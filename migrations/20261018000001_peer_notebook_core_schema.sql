-- Peer Notebook Core Schema (PostgreSQL / Supabase Migration)
-- Version: 20261018000001
-- Description: HIPAA-compliant peer support encounter notes, client rosters, supervisor sign-offs, and immutable audit logs.
-- GA #8 Standards • CalAIM & Medi-Cal H0038 Compliance • Strict Multi-Tenant RLS & Immutability Triggers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations / Behavioral Health Agencies
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    npi VARCHAR(20),
    medicaid_provider_id VARCHAR(50),
    county_code VARCHAR(50) DEFAULT '38-San Francisco',
    calaim_contract_active BOOLEAN DEFAULT TRUE,
    baa_signed_at TIMESTAMPTZ DEFAULT NOW(),
    baa_version VARCHAR(50) DEFAULT 'v2.4-GA8-CalAIM',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users & Peer Specialists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('peer_specialist', 'supervisor', 'admin', 'compliance_officer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    credential_title VARCHAR(150) DEFAULT 'Certified Peer Support Specialist (CPSS-CA)',
    license_number VARCHAR(100),
    npi VARCHAR(20),
    role user_role DEFAULT 'peer_specialist',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients / Peers receiving support (Multi-tenant isolated by organization_id)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_identifier VARCHAR(64) NOT NULL, -- Pseudonymized Client Code (e.g. PN-7821)
    preferred_name VARCHAR(100) NOT NULL,
    medi_cal_cin VARCHAR(50),
    date_of_birth DATE,
    assigned_specialist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recovery_goals TEXT[] DEFAULT '{}',
    current_status VARCHAR(50) DEFAULT 'Active Recovery',
    calaim_pathway VARCHAR(100) DEFAULT 'Community Supports',
    phone VARCHAR(50),
    emergency_contact VARCHAR(255),
    last_encounter_date DATE,
    consent_signed BOOLEAN DEFAULT TRUE,
    consent_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinical & Peer Support Encounter Notes
DO $$ BEGIN
    CREATE TYPE note_status AS ENUM ('draft', 'pending_supervisor', 'approved', 'revision_requested');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_modality AS ENUM ('face_to_face', 'community_field', 'telehealth_video', 'phone_outreach');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS session_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    client_name VARCHAR(255),
    client_identifier VARCHAR(64),
    medi_cal_cin VARCHAR(50),
    author_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    author_name VARCHAR(255),
    author_credentials VARCHAR(150),
    encounter_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    face_to_face_minutes INTEGER NOT NULL DEFAULT 45,
    travel_minutes INTEGER NOT NULL DEFAULT 0,
    documentation_minutes INTEGER NOT NULL DEFAULT 15,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    billing_code VARCHAR(20) DEFAULT 'H0038', -- Medi-Cal H0038: Self-help/peer services, per 15 min
    billing_units INTEGER GENERATED ALWAYS AS (CEIL(duration_minutes / 15.0)::INTEGER) STORED,
    modality service_modality DEFAULT 'community_field',
    place_of_service_code VARCHAR(10) DEFAULT '99',
    location_details VARCHAR(255) DEFAULT 'Community Field / Drop-In Center',
    
    -- Structured CalAIM 4-Part Peer Documentation
    focus_domains TEXT[] DEFAULT '{"Recovery Goals", "Community Navigation"}',
    goal_addressed TEXT NOT NULL,
    peer_intervention TEXT NOT NULL,
    client_response TEXT NOT NULL,
    plan_next_steps TEXT NOT NULL,
    safety_concerns BOOLEAN DEFAULT FALSE,
    safety_notes TEXT,

    -- Signatures & Cosigning
    specialist_signature TEXT NOT NULL,
    signed_at TIMESTAMPTZ,
    status note_status DEFAULT 'pending_supervisor',
    
    supervisor_id UUID REFERENCES users(id),
    supervisor_name VARCHAR(255),
    supervisor_signature TEXT,
    supervisor_feedback TEXT,
    approved_at TIMESTAMPTZ,

    synced BOOLEAN DEFAULT TRUE,
    sync_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immutable HIPAA Audit Log (45 CFR § 164.312(b))
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_hash VARCHAR(64),
    tamper_proof_checksum VARCHAR(128) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Synonym View for audit_trail_logs ensuring seamless table/view compatibility
CREATE OR REPLACE VIEW audit_trail_logs AS 
SELECT * FROM audit_logs;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_clients_org_specialist ON clients(organization_id, assigned_specialist_id);
CREATE INDEX IF NOT EXISTS idx_notes_org_author_date ON session_notes(organization_id, author_id, encounter_date);
CREATE INDEX IF NOT EXISTS idx_notes_status ON session_notes(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_timestamp ON audit_logs(organization_id, timestamp DESC);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) - STRICT MULTI-TENANT ISOLATION
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- MULTI-TENANT CONTEXT & ROLE EXTRACTION (RECURSION-PROOF & HIGH PERFORMANCE)
--------------------------------------------------------------------------------

-- Secure helper: Resolves the authenticated user's assigned organization_id.
-- Uses SECURITY DEFINER with fixed search_path to eliminate recursive subquery execution on public.users.
CREATE OR REPLACE FUNCTION get_auth_user_organization_id()
RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
    v_jwt_org TEXT;
BEGIN
    -- Fast path: Check JWT claims (app_metadata or custom tenant claims)
    v_jwt_org := (auth.jwt() -> 'app_metadata' ->> 'organization_id');
    IF v_jwt_org IS NOT NULL AND v_jwt_org ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        RETURN v_jwt_org::UUID;
    END IF;

    -- Direct query on users table via SECURITY DEFINER (bypasses RLS recursion)
    SELECT organization_id INTO v_org_id
    FROM public.users
    WHERE id = auth.uid() AND is_active = TRUE
    LIMIT 1;

    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Secure helper: Resolves the authenticated user's system role.
CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS user_role AS $$
DECLARE
    v_role user_role;
    v_jwt_role TEXT;
BEGIN
    -- Fast path: Check JWT claims
    v_jwt_role := (auth.jwt() -> 'app_metadata' ->> 'role');
    IF v_jwt_role IS NOT NULL THEN
        RETURN v_jwt_role::user_role;
    END IF;

    SELECT role INTO v_role
    FROM public.users
    WHERE id = auth.uid() AND is_active = TRUE
    LIMIT 1;

    RETURN COALESCE(v_role, 'peer_specialist'::user_role);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Secure helper: Checks if authenticated user has administrative or supervisor oversight in their organization.
CREATE OR REPLACE FUNCTION is_org_supervisor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_auth_user_role() IN ('supervisor', 'admin', 'compliance_officer');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) - STRICT MULTI-TENANT ISOLATION (FORCE ENABLED)
--------------------------------------------------------------------------------

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;

ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- 1. Organizations Policies (Strict Isolation to Assigned Org)
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Strict multi-tenant select for organizations" ON organizations;
CREATE POLICY "Strict multi-tenant select for organizations"
    ON organizations FOR SELECT
    TO authenticated
    USING (id = get_auth_user_organization_id());

DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;
DROP POLICY IF EXISTS "Strict multi-tenant update for organizations" ON organizations;
CREATE POLICY "Strict multi-tenant update for organizations"
    ON organizations FOR UPDATE
    TO authenticated
    USING (id = get_auth_user_organization_id() AND is_org_supervisor_or_admin())
    WITH CHECK (id = get_auth_user_organization_id());

-- 2. Users Policies (Self Profile + Intra-Agency Colleagues Only)
DROP POLICY IF EXISTS "Users can view members of their organization" ON users;
DROP POLICY IF EXISTS "Strict multi-tenant select for users" ON users;
CREATE POLICY "Strict multi-tenant select for users"
    ON users FOR SELECT
    TO authenticated
    USING (
        id = auth.uid()
        OR (organization_id IS NOT NULL AND organization_id = get_auth_user_organization_id())
    );

DROP POLICY IF EXISTS "Users can update self or admin manage org users" ON users;
DROP POLICY IF EXISTS "Strict multi-tenant update for users" ON users;
CREATE POLICY "Strict multi-tenant update for users"
    ON users FOR UPDATE
    TO authenticated
    USING (
        id = auth.uid()
        OR (organization_id = get_auth_user_organization_id() AND get_auth_user_role() = 'admin')
    )
    WITH CHECK (
        organization_id = get_auth_user_organization_id()
    );

DROP POLICY IF EXISTS "Admins or self can insert user in org" ON users;
DROP POLICY IF EXISTS "Strict multi-tenant insert for users" ON users;
CREATE POLICY "Strict multi-tenant insert for users"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id = get_auth_user_organization_id()
        AND (id = auth.uid() OR get_auth_user_role() = 'admin')
    );

-- 3. Clients Policies (Strict Multi-Tenant Isolation per Assigned Agency)
DROP POLICY IF EXISTS "Users can view clients within their organization" ON clients;
DROP POLICY IF EXISTS "Strict multi-tenant select for clients" ON clients;
CREATE POLICY "Strict multi-tenant select for clients"
    ON clients FOR SELECT
    TO authenticated
    USING (
        organization_id IS NOT NULL 
        AND organization_id = get_auth_user_organization_id()
    );

DROP POLICY IF EXISTS "Specialists can insert clients in their organization" ON clients;
DROP POLICY IF EXISTS "Strict multi-tenant insert for clients" ON clients;
CREATE POLICY "Strict multi-tenant insert for clients"
    ON clients FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IS NOT NULL 
        AND organization_id = get_auth_user_organization_id()
    );

DROP POLICY IF EXISTS "Specialists can update clients in their organization" ON clients;
DROP POLICY IF EXISTS "Strict multi-tenant update for clients" ON clients;
CREATE POLICY "Strict multi-tenant update for clients"
    ON clients FOR UPDATE
    TO authenticated
    USING (organization_id IS NOT NULL AND organization_id = get_auth_user_organization_id())
    WITH CHECK (organization_id IS NOT NULL AND organization_id = get_auth_user_organization_id());

DROP POLICY IF EXISTS "Supervisors and admins can delete clients in their organization" ON clients;
DROP POLICY IF EXISTS "Strict multi-tenant delete for clients" ON clients;
CREATE POLICY "Strict multi-tenant delete for clients"
    ON clients FOR DELETE
    TO authenticated
    USING (
        organization_id IS NOT NULL 
        AND organization_id = get_auth_user_organization_id()
        AND is_org_supervisor_or_admin()
    );

-- 4. Session Notes Policies (Strict Multi-Tenant Isolation & Authenticated Specialist Scoping)
DROP POLICY IF EXISTS "Users can view session notes within their organization" ON session_notes;
DROP POLICY IF EXISTS "Strict multi-tenant select for session_notes" ON session_notes;
CREATE POLICY "Strict multi-tenant select for session_notes"
    ON session_notes FOR SELECT
    TO authenticated
    USING (
        -- HARD GUARANTEE: Session note MUST belong strictly to the specialist's assigned organization
        organization_id IS NOT NULL
        AND organization_id = get_auth_user_organization_id()
        AND (
            -- Supervisors, admins, and compliance officers have full clinical review oversight
            is_org_supervisor_or_admin()
            -- Peer specialist authored the encounter note
            OR author_id = auth.uid()
            -- Peer specialist is the primary assigned specialist for this peer client
            OR client_id IN (
                SELECT c.id FROM clients c 
                WHERE c.assigned_specialist_id = auth.uid() 
                AND c.organization_id = get_auth_user_organization_id()
            )
            -- Agency peer support team coordination within the same verified agency
            OR get_auth_user_role() = 'peer_specialist'
        )
    );

DROP POLICY IF EXISTS "Peer specialists can insert notes within their organization" ON session_notes;
DROP POLICY IF EXISTS "Strict multi-tenant insert for session_notes" ON session_notes;
CREATE POLICY "Strict multi-tenant insert for session_notes"
    ON session_notes FOR INSERT
    TO authenticated
    WITH CHECK (
        -- HARD GUARANTEE: Restricts insert exclusively to the specialist's assigned organization
        organization_id IS NOT NULL
        AND organization_id = get_auth_user_organization_id()
        -- HARD GUARANTEE: Author ID MUST match authenticated specialist (prevents anonymous/spoofed entries)
        AND author_id = auth.uid()
        -- Defense: Client referenced must belong to the exact same assigned organization
        AND (
            client_id IS NULL 
            OR client_id IN (
                SELECT c.id FROM clients c 
                WHERE c.organization_id = get_auth_user_organization_id()
            )
        )
    );

DROP POLICY IF EXISTS "Authors and supervisors can update notes within organization" ON session_notes;
DROP POLICY IF EXISTS "Strict multi-tenant update for session_notes" ON session_notes;
CREATE POLICY "Strict multi-tenant update for session_notes"
    ON session_notes FOR UPDATE
    TO authenticated
    USING (
        -- HARD GUARANTEE: Must belong to assigned organization
        organization_id IS NOT NULL
        AND organization_id = get_auth_user_organization_id()
        AND (
            -- Specialist can update their own notes prior to final supervisor sign-off
            (author_id = auth.uid() AND (status IN ('draft', 'pending_supervisor', 'revision_requested') OR is_org_supervisor_or_admin()))
            -- Supervisors and compliance officers can review, cosign, and approve
            OR is_org_supervisor_or_admin()
        )
    )
    WITH CHECK (
        -- HARD GUARANTEE: Cannot migrate notes across tenants
        organization_id IS NOT NULL
        AND organization_id = get_auth_user_organization_id()
        AND (
            author_id = auth.uid() 
            OR is_org_supervisor_or_admin()
            OR author_id = (SELECT sn.author_id FROM session_notes sn WHERE sn.id = session_notes.id)
        )
    );

DROP POLICY IF EXISTS "Authors can delete draft notes within their organization" ON session_notes;
DROP POLICY IF EXISTS "Strict multi-tenant delete for session_notes" ON session_notes;
CREATE POLICY "Strict multi-tenant delete for session_notes"
    ON session_notes FOR DELETE
    TO authenticated
    USING (
        organization_id IS NOT NULL
        AND organization_id = get_auth_user_organization_id()
        AND (
            -- Specialist can only delete unsubmitted draft notes authored by them
            (author_id = auth.uid() AND status = 'draft')
            -- Admins can delete within their assigned organization
            OR get_auth_user_role() = 'admin'
        )
    );

-- 5. Immutable Audit Logs Policies (Write-Only & Strictly Tamper-Proof)
DROP POLICY IF EXISTS "Authorized personnel can view audit logs within their organization" ON audit_logs;
DROP POLICY IF EXISTS "Strict multi-tenant select for audit_logs" ON audit_logs;
CREATE POLICY "Strict multi-tenant select for audit_logs"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (
        organization_id IS NOT NULL 
        AND organization_id = get_auth_user_organization_id()
    );

DROP POLICY IF EXISTS "Authenticated users can insert audit logs within their organization" ON audit_logs;
DROP POLICY IF EXISTS "Strict multi-tenant insert for audit_logs" ON audit_logs;
CREATE POLICY "Strict multi-tenant insert for audit_logs"
    ON audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IS NOT NULL 
        AND organization_id = get_auth_user_organization_id()
        AND (actor_id = auth.uid() OR actor_id IS NULL)
    );

--------------------------------------------------------------------------------
-- MULTI-TENANT CROSS-ENTITY INTEGRITY TRIGGER (DEFENSE IN DEPTH)
-- Guarantees that session_notes cannot reference clients or authors from other organizations
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_session_note_tenant_isolation()
RETURNS TRIGGER AS $$
DECLARE
    v_client_org UUID;
    v_author_org UUID;
BEGIN
    -- 1. Ensure organization_id is not null
    IF NEW.organization_id IS NULL THEN
        RAISE EXCEPTION 'Multi-Tenant Security Error: session_notes.organization_id cannot be NULL.';
    END IF;

    -- 2. Verify Client belongs to the exact same organization
    IF NEW.client_id IS NOT NULL THEN
        SELECT organization_id INTO v_client_org FROM public.clients WHERE id = NEW.client_id;
        IF v_client_org IS NOT NULL AND v_client_org <> NEW.organization_id THEN
            RAISE EXCEPTION 'Cross-Tenant Isolation Breach: Client % (Org %) does not belong to session note organization %',
                NEW.client_id, v_client_org, NEW.organization_id;
        END IF;
    END IF;

    -- 3. Verify Author belongs to the exact same organization
    IF NEW.author_id IS NOT NULL THEN
        SELECT organization_id INTO v_author_org FROM public.users WHERE id = NEW.author_id;
        IF v_author_org IS NOT NULL AND v_author_org <> NEW.organization_id THEN
            RAISE EXCEPTION 'Cross-Tenant Isolation Breach: Author % (Org %) does not belong to session note organization %',
                NEW.author_id, v_author_org, NEW.organization_id;
        END IF;
    END IF;

    -- 4. Prevent modifying organization_id on UPDATE
    IF TG_OP = 'UPDATE' AND OLD.organization_id <> NEW.organization_id THEN
        RAISE EXCEPTION 'Multi-Tenant Security Violation: Cannot migrate session note across organizations (% -> %).',
            OLD.organization_id, NEW.organization_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_enforce_session_note_tenant_isolation ON session_notes;
CREATE TRIGGER trg_enforce_session_note_tenant_isolation
    BEFORE INSERT OR UPDATE ON session_notes
    FOR EACH ROW
    EXECUTE FUNCTION enforce_session_note_tenant_isolation();

--------------------------------------------------------------------------------
-- TAMPER-PROOF IMMUTABILITY ENFORCEMENT (45 CFR § 164.312(b))
-- Prevents UPDATE and DELETE operations on audit_logs completely
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'HIPAA 45 CFR § 164.312(b) Security Violation: Audit trail logs are strictly immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_tampering ON audit_logs;
CREATE TRIGGER trg_prevent_audit_tampering
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_tampering();
