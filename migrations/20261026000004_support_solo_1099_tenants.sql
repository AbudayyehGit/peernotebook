-- ==============================================================================
-- Peer Notebook: Supabase Schema Update for Solo 1099 Independent Contractors
-- Migration: 20261026000004_support_solo_1099_tenants
-- Standard: GA #8 • CalAIM / Medi-Cal H0038 • Multi-Tenant & Solo Tenant Isolation
-- Purpose: Enables independent 1099 recovery coaches and solo practitioners to operate
--          without a mandatory organization ID, while maintaining strict RLS boundaries
--          and preserving agency multi-tenant isolation.
-- ==============================================================================

-- 1. Add account_type to users table if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'account_type'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN account_type VARCHAR(50) DEFAULT 'agency_cbo' 
        CHECK (account_type IN ('agency_cbo', 'solo_1099'));
    END IF;
END $$;

-- 2. Ensure organization_id can be NULL for solo 1099 users
ALTER TABLE public.users ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE public.clients ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE public.session_notes ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE public.audit_logs ALTER COLUMN organization_id DROP NOT NULL;

-- 3. Add contractor specific fields to users if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_contractor_1099'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN is_contractor_1099 BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'hourly_contract_rate'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN hourly_contract_rate NUMERIC(10,2) DEFAULT 45.00;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'mileage_reimbursement_rate'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN mileage_reimbursement_rate NUMERIC(10,3) DEFAULT 0.670;
    END IF;
END $$;

-- 4. Helper Function: Check if user is a solo 1099 practitioner
CREATE OR REPLACE FUNCTION is_solo_1099_user()
RETURNS BOOLEAN AS $$
DECLARE
    v_account_type TEXT;
BEGIN
    SELECT account_type INTO v_account_type
    FROM public.users
    WHERE id = auth.uid() AND is_active = TRUE
    LIMIT 1;

    RETURN v_account_type = 'solo_1099';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 5. Updated RLS Policy for Clients supporting Solo Tenants & Agency CBOs
DROP POLICY IF EXISTS "Strict multi-tenant select for clients" ON clients;
CREATE POLICY "Strict multi-tenant select for clients"
    ON clients FOR SELECT
    TO authenticated
    USING (
        -- Agency CBO isolation: Scoped to matching non-null organization ID
        (organization_id IS NOT NULL AND organization_id = get_auth_user_organization_id())
        -- Solo 1099 isolation: Scoped directly to the assigned specialist (no org ID required)
        OR (assigned_specialist_id = auth.uid())
    );

DROP POLICY IF EXISTS "Strict multi-tenant insert for clients" ON clients;
CREATE POLICY "Strict multi-tenant insert for clients"
    ON clients FOR INSERT
    TO authenticated
    WITH CHECK (
        (organization_id IS NOT NULL AND organization_id = get_auth_user_organization_id())
        OR (organization_id IS NULL AND assigned_specialist_id = auth.uid())
    );

DROP POLICY IF EXISTS "Strict multi-tenant update for clients" ON clients;
CREATE POLICY "Strict multi-tenant update for clients"
    ON clients FOR UPDATE
    TO authenticated
    USING (
        (organization_id IS NOT NULL AND organization_id = get_auth_user_organization_id())
        OR (assigned_specialist_id = auth.uid())
    )
    WITH CHECK (
        (organization_id IS NOT NULL AND organization_id = get_auth_user_organization_id())
        OR (assigned_specialist_id = auth.uid())
    );

-- 6. Updated RLS Policy for Session Notes supporting Solo Tenants & Agency CBOs
DROP POLICY IF EXISTS "Strict multi-tenant select for session_notes" ON session_notes;
CREATE POLICY "Strict multi-tenant select for session_notes"
    ON session_notes FOR SELECT
    TO authenticated
    USING (
        -- Agency CBO isolation
        (
            organization_id IS NOT NULL 
            AND organization_id = get_auth_user_organization_id()
            AND (is_org_supervisor_or_admin() OR author_id = auth.uid())
        )
        -- Solo 1099 isolation: Author owns their session notes
        OR (organization_id IS NULL AND author_id = auth.uid())
    );

DROP POLICY IF EXISTS "Strict multi-tenant insert for session_notes" ON session_notes;
CREATE POLICY "Strict multi-tenant insert for session_notes"
    ON session_notes FOR INSERT
    TO authenticated
    WITH CHECK (
        (
            organization_id IS NOT NULL 
            AND organization_id = get_auth_user_organization_id()
            AND author_id = auth.uid()
        )
        OR (organization_id IS NULL AND author_id = auth.uid())
    );

DROP POLICY IF EXISTS "Strict multi-tenant update for session_notes" ON session_notes;
CREATE POLICY "Strict multi-tenant update for session_notes"
    ON session_notes FOR UPDATE
    TO authenticated
    USING (
        (
            organization_id IS NOT NULL 
            AND organization_id = get_auth_user_organization_id()
            AND (is_org_supervisor_or_admin() OR author_id = auth.uid())
        )
        OR (organization_id IS NULL AND author_id = auth.uid())
    )
    WITH CHECK (
        (
            organization_id IS NOT NULL 
            AND organization_id = get_auth_user_organization_id()
        )
        OR (organization_id IS NULL AND author_id = auth.uid())
    );
