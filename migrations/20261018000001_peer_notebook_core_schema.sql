-- Peer Notebook Core Schema (PostgreSQL / Supabase Migration)
-- Version: 20261018000001
-- Description: HIPAA-compliant peer support encounter notes, client rosters, supervisor sign-offs, and immutable audit logs.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations / Behavioral Health Agencies
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    npi VARCHAR(20),
    medicaid_provider_id VARCHAR(50),
    baa_signed_at TIMESTAMPTZ,
    baa_version VARCHAR(20) DEFAULT 'v2.4',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users & Peer Specialists
CREATE TYPE user_role AS ENUM ('peer_specialist', 'supervisor', 'admin', 'compliance_officer');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    credential_title VARCHAR(100) DEFAULT 'Certified Peer Support Specialist (CPSS)',
    license_number VARCHAR(100),
    role user_role DEFAULT 'peer_specialist',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients / Peers receiving support
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_identifier VARCHAR(64) NOT NULL, -- Pseudonymized Client Code (e.g. PN-7821)
    preferred_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    assigned_specialist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recovery_goals TEXT[] DEFAULT '{}',
    current_status VARCHAR(50) DEFAULT 'Active Recovery',
    consent_signed BOOLEAN DEFAULT TRUE,
    consent_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinical & Peer Support Encounter Notes
CREATE TYPE note_status AS ENUM ('draft', 'pending_supervisor', 'approved', 'revision_requested');
CREATE TYPE service_modality AS ENUM ('face_to_face', 'community_field', 'telehealth_video', 'phone_outreach');

CREATE TABLE IF NOT EXISTS session_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    encounter_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    billing_code VARCHAR(20) DEFAULT 'H0038', -- Medicaid H0038: Self-help/peer services, per 15 min
    billing_units INTEGER GENERATED ALWAYS AS (CEIL(duration_minutes / 15.0)::INTEGER) STORED,
    modality service_modality DEFAULT 'community_field',
    location_details VARCHAR(255) DEFAULT 'Community Library / Drop-In Center',
    
    -- Structured Peer Documentation
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
    supervisor_signature TEXT,
    supervisor_feedback TEXT,
    approved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immutable HIPAA Audit Log
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

-- Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view within their organization"
    ON session_notes FOR SELECT
    USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Peer specialists can insert and edit own drafts"
    ON session_notes FOR ALL
    USING (author_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    ));
