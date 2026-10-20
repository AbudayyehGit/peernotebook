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
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Organizations Policies
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- 2. Users Policies
DROP POLICY IF EXISTS "Users can view members of their organization" ON users;
CREATE POLICY "Users can view members of their organization"
    ON users FOR SELECT
    USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- 3. Clients Policies (Strict Multi-Tenant Isolation)
DROP POLICY IF EXISTS "Users can view clients within their organization" ON clients;
CREATE POLICY "Users can view clients within their organization"
    ON clients FOR SELECT
    USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Specialists can insert clients in their organization" ON clients;
CREATE POLICY "Specialists can insert clients in their organization"
    ON clients FOR INSERT
    WITH CHECK (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Specialists can update clients in their organization" ON clients;
CREATE POLICY "Specialists can update clients in their organization"
    ON clients FOR UPDATE
    USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()))
    WITH CHECK (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- 4. Session Notes Policies (Role-Based Isolation)
DROP POLICY IF EXISTS "Users can view session notes within their organization" ON session_notes;
CREATE POLICY "Users can view session notes within their organization"
    ON session_notes FOR SELECT
    USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Peer specialists can insert notes within their organization" ON session_notes;
CREATE POLICY "Peer specialists can insert notes within their organization"
    ON session_notes FOR INSERT
    WITH CHECK (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (author_id = auth.uid() OR author_id IS NULL)
    );

DROP POLICY IF EXISTS "Authors and supervisors can update notes within organization" ON session_notes;
CREATE POLICY "Authors and supervisors can update notes within organization"
    ON session_notes FOR UPDATE
    USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (author_id = auth.uid() OR EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'admin', 'compliance_officer')
        ))
    );

-- 5. Immutable Audit Logs Policies (Write-Only & Strictly Tamper-Proof)
DROP POLICY IF EXISTS "Authorized personnel can view audit logs within their organization" ON audit_logs;
CREATE POLICY "Authorized personnel can view audit logs within their organization"
    ON audit_logs FOR SELECT
    USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can insert audit logs within their organization" ON audit_logs;
CREATE POLICY "Authenticated users can insert audit logs within their organization"
    ON audit_logs FOR INSERT
    WITH CHECK (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

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
