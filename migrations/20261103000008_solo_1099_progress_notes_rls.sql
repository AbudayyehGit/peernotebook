-- ==============================================================================
-- Peer Notebook: Solo 1099 Practitioner RLS Policy & Column Migration
-- Migration: 20261103000008_solo_1099_progress_notes_rls.sql
-- Standards: ISO 9001 • HIPAA § 164.312 • CalAIM H0038 • Multi-Tenant & Solo RLS
-- Author: H. Joe Abudayyeh <joe@peernotebook.com>
-- Copyright © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All rights reserved.
-- ==============================================================================

-- 1. Ensure progress_notes table has is_solo_practitioner column
CREATE TABLE IF NOT EXISTS public.progress_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID,
    peer_id TEXT NOT NULL,
    client_identifier TEXT,
    content TEXT,
    is_solo_practitioner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support solo 1099 practitioners alongside multi-tenant agency RLS policies
ALTER TABLE public.progress_notes ADD COLUMN IF NOT EXISTS is_solo_practitioner BOOLEAN DEFAULT FALSE;

-- Enable Row Level Security
ALTER TABLE public.progress_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for solo 1099 practitioners
DROP POLICY IF EXISTS solo_practitioner_notes_policy ON public.progress_notes;
CREATE POLICY solo_practitioner_notes_policy ON public.progress_notes
  FOR ALL TO authenticated
  USING (specialist_id = auth.uid() AND is_solo_practitioner = TRUE);

-- Also ensure session_notes has matching solo practitioner support
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'session_notes'
    ) THEN
        ALTER TABLE public.session_notes ADD COLUMN IF NOT EXISTS is_solo_practitioner BOOLEAN DEFAULT FALSE;
        
        DROP POLICY IF EXISTS solo_practitioner_session_notes_policy ON public.session_notes;
        CREATE POLICY solo_practitioner_session_notes_policy ON public.session_notes
          FOR ALL TO authenticated
          USING (author_id = auth.uid() AND is_solo_practitioner = TRUE);
    END IF;
END $$;
