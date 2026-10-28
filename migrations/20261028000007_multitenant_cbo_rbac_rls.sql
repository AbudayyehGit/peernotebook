-- ==============================================================================
-- Peer Notebook: Multi-Tenant CBO RBAC & Row-Level Security (RLS) Engine
-- Migration: 20261028000007_multitenant_cbo_rbac_rls.sql
-- Roles: peer_specialist, peer_supervisor, cbo_admin, super_admin
-- Security Standard: 45 CFR § 164.312(b) & California CMIA
-- ==============================================================================

-- 1. Helper function: Resolve authenticated user CBO ID (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_auth_cbo_id()
RETURNS UUID AS $$
DECLARE
    v_cbo_id UUID;
    v_jwt_cbo TEXT;
BEGIN
    -- Check JWT app_metadata for optimized single-trip resolution
    v_jwt_cbo := (auth.jwt() -> 'app_metadata' ->> 'cbo_id');
    IF v_jwt_cbo IS NOT NULL THEN
        RETURN v_jwt_cbo::UUID;
    END IF;

    -- Fallback to user_profiles table query
    SELECT cbo_id INTO v_cbo_id
    FROM public.user_profiles
    WHERE id = auth.uid()
    LIMIT 1;

    RETURN v_cbo_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 2. Helper function: Resolve authenticated user RBAC role (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
    v_jwt_role TEXT;
BEGIN
    v_jwt_role := (auth.jwt() -> 'app_metadata' ->> 'role');
    IF v_jwt_role IS NOT NULL THEN
        RETURN v_jwt_role;
    END IF;

    SELECT role INTO v_role
    FROM public.user_profiles
    WHERE id = auth.uid()
    LIMIT 1;

    RETURN COALESCE(v_role, 'peer_specialist');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 3. Ensure mandatory cbo_id UUID NOT NULL on core multi-tenant tables
DO $$
BEGIN
    -- user_profiles cbo_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'cbo_id'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN cbo_id UUID;
        UPDATE public.user_profiles SET cbo_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE cbo_id IS NULL;
        ALTER TABLE public.user_profiles ALTER COLUMN cbo_id SET NOT NULL;
    END IF;

    -- clients cbo_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'cbo_id'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN cbo_id UUID;
        UPDATE public.clients SET cbo_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE cbo_id IS NULL;
        ALTER TABLE public.clients ALTER COLUMN cbo_id SET NOT NULL;
    END IF;

    -- session_notes cbo_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'session_notes' AND column_name = 'cbo_id'
    ) THEN
        ALTER TABLE public.session_notes ADD COLUMN cbo_id UUID;
        UPDATE public.session_notes SET cbo_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE cbo_id IS NULL;
        ALTER TABLE public.session_notes ALTER COLUMN cbo_id SET NOT NULL;
    END IF;
END $$;

-- 4. Force RLS across tables
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.clients FORCE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes FORCE ROW LEVEL SECURITY;

-- 5. Strict RBAC Policies for session_notes
DROP POLICY IF EXISTS "cbo_rbac_session_notes_select" ON public.session_notes;
CREATE POLICY "cbo_rbac_session_notes_select"
    ON public.session_notes FOR SELECT TO authenticated
    USING (
        get_auth_role() = 'super_admin'
        OR (
            cbo_id = get_auth_cbo_id()
            AND (
                get_auth_role() IN ('cbo_admin', 'peer_supervisor')
                OR author_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "cbo_rbac_session_notes_insert" ON public.session_notes;
CREATE POLICY "cbo_rbac_session_notes_insert"
    ON public.session_notes FOR INSERT TO authenticated
    WITH CHECK (
        cbo_id = get_auth_cbo_id()
        AND author_id = auth.uid()
    );

DROP POLICY IF EXISTS "cbo_rbac_session_notes_update" ON public.session_notes;
CREATE POLICY "cbo_rbac_session_notes_update"
    ON public.session_notes FOR UPDATE TO authenticated
    USING (
        get_auth_role() = 'super_admin'
        OR (
            cbo_id = get_auth_cbo_id()
            AND (
                get_auth_role() IN ('cbo_admin', 'peer_supervisor')
                OR (author_id = auth.uid() AND status = 'draft')
            )
        )
    )
    WITH CHECK (
        cbo_id = get_auth_cbo_id()
    );

-- 6. Strict RBAC Policies for clients
DROP POLICY IF EXISTS "cbo_rbac_clients_select" ON public.clients;
CREATE POLICY "cbo_rbac_clients_select"
    ON public.clients FOR SELECT TO authenticated
    USING (
        get_auth_role() = 'super_admin'
        OR cbo_id = get_auth_cbo_id()
    );

DROP POLICY IF EXISTS "cbo_rbac_clients_insert" ON public.clients;
CREATE POLICY "cbo_rbac_clients_insert"
    ON public.clients FOR INSERT TO authenticated
    WITH CHECK (
        cbo_id = get_auth_cbo_id()
    );
