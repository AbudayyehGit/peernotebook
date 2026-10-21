-- ==============================================================================
-- Peer Notebook: Supabase Row-Level Security (RLS) Hardening Migration
-- Version: 20261021000002_harden_rls_multi_tenant_isolation
-- Target: Supabase PostgreSQL Relational Storage
-- Standard: GA #8 • CalAIM / Medi-Cal H0038 • HIPAA 45 CFR § 164.312(b)
-- Purpose: Guarantees 100% strict multi-tenant isolation, ensuring every authenticated
--          specialist's session data and clinical notes are restricted exclusively
--          to their assigned organization ID.
-- ==============================================================================

-- 1. Helper Functions (SECURITY DEFINER with fixed search_path to prevent recursion)
CREATE OR REPLACE FUNCTION get_auth_user_organization_id()
RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
    v_jwt_org TEXT;
BEGIN
    -- Check JWT app_metadata for high-speed evaluation
    v_jwt_org := (auth.jwt() -> 'app_metadata' ->> 'organization_id');
    IF v_jwt_org IS NOT NULL AND v_jwt_org ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        RETURN v_jwt_org::UUID;
    END IF;

    -- Secure query on public.users bypassing RLS recursion
    SELECT organization_id INTO v_org_id
    FROM public.users
    WHERE id = auth.uid() AND is_active = TRUE
    LIMIT 1;

    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS user_role AS $$
DECLARE
    v_role user_role;
    v_jwt_role TEXT;
BEGIN
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

CREATE OR REPLACE FUNCTION is_org_supervisor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_auth_user_role() IN ('supervisor', 'admin', 'compliance_officer');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 2. Force Enable RLS across all tables
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

-- 3. Hardened Organizations Policies
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

-- 4. Hardened Users Policies
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

-- 5. Hardened Clients Policies
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

-- 6. Hardened Session Notes Policies (Exclusively Scoped to Assigned Organization ID)
DROP POLICY IF EXISTS "Users can view session notes within their organization" ON session_notes;
DROP POLICY IF EXISTS "Strict multi-tenant select for session_notes" ON session_notes;
CREATE POLICY "Strict multi-tenant select for session_notes"
    ON session_notes FOR SELECT
    TO authenticated
    USING (
        -- ABSOLUTE REQUIREMENT: Restricted exclusively to assigned organization ID
        organization_id IS NOT NULL
        AND organization_id = get_auth_user_organization_id()
        AND (
            is_org_supervisor_or_admin()
            OR author_id = auth.uid()
            OR client_id IN (
                SELECT c.id FROM clients c 
                WHERE c.assigned_specialist_id = auth.uid() 
                AND c.organization_id = get_auth_user_organization_id()
            )
            OR get_auth_user_role() = 'peer_specialist'
        )
    );

DROP POLICY IF EXISTS "Peer specialists can insert notes within their organization" ON session_notes;
DROP POLICY IF EXISTS "Strict multi-tenant insert for session_notes" ON session_notes;
CREATE POLICY "Strict multi-tenant insert for session_notes"
    ON session_notes FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Enforces matching assigned organization
        organization_id IS NOT NULL
        AND organization_id = get_auth_user_organization_id()
        -- Authenticated specialist authorship mandatory
        AND author_id = auth.uid()
        -- Associated client must belong to the exact same organization
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
        organization_id IS NOT NULL
        AND organization_id = get_auth_user_organization_id()
        AND (
            (author_id = auth.uid() AND (status IN ('draft', 'pending_supervisor', 'revision_requested') OR is_org_supervisor_or_admin()))
            OR is_org_supervisor_or_admin()
        )
    )
    WITH CHECK (
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
            (author_id = auth.uid() AND status = 'draft')
            OR get_auth_user_role() = 'admin'
        )
    );

-- 7. Hardened Audit Logs Policies (Tamper-Proof)
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

-- 8. Defense-in-Depth Cross-Entity Tenant Integrity Trigger
CREATE OR REPLACE FUNCTION enforce_session_note_tenant_isolation()
RETURNS TRIGGER AS $$
DECLARE
    v_client_org UUID;
    v_author_org UUID;
BEGIN
    IF NEW.organization_id IS NULL THEN
        RAISE EXCEPTION 'Multi-Tenant Security Error: session_notes.organization_id cannot be NULL.';
    END IF;

    IF NEW.client_id IS NOT NULL THEN
        SELECT organization_id INTO v_client_org FROM public.clients WHERE id = NEW.client_id;
        IF v_client_org IS NOT NULL AND v_client_org <> NEW.organization_id THEN
            RAISE EXCEPTION 'Cross-Tenant Isolation Breach: Client % (Org %) does not belong to session note organization %',
                NEW.client_id, v_client_org, NEW.organization_id;
        END IF;
    END IF;

    IF NEW.author_id IS NOT NULL THEN
        SELECT organization_id INTO v_author_org FROM public.users WHERE id = NEW.author_id;
        IF v_author_org IS NOT NULL AND v_author_org <> NEW.organization_id THEN
            RAISE EXCEPTION 'Cross-Tenant Isolation Breach: Author % (Org %) does not belong to session note organization %',
                NEW.author_id, v_author_org, NEW.organization_id;
        END IF;
    END IF;

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
