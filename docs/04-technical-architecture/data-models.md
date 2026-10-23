# Data Models & Relational Schema Dictionary

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Persistence:** TypeScript Types, Dexie.js Schema & PostgreSQL DDL with RLS

---

## 1. Core Entity Relationship Diagram (ERD)

```
[ organizations ] 1 ───< [ users ]
       │                    │
       │                    │
       ▼ 1                  ▼ 1
  [ clients ] 1 ────────< [ session_notes ] 1 ───< [ audit_trail_logs ]
                                │
                                ▼ 1
                          [ sync_queue ]
```

---

## 2. PostgreSQL DDL & Row-Level Security (RLS)

```sql
-- 1. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    county VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users (Specialists & Supervisors)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('specialist', 'supervisor', 'admin')),
    credentials VARCHAR(100) DEFAULT 'CPSS-CA',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clients (Peers Served)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_identifier VARCHAR(100) NOT NULL,
    preferred_name VARCHAR(100),
    pronouns VARCHAR(50),
    county_case_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    active_recovery_goals TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Session Notes (4-Part Encounter Record)
CREATE TABLE session_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    specialist_id UUID REFERENCES users(id),
    encounter_date DATE NOT NULL,
    place_of_service VARCHAR(10) DEFAULT '15',
    direct_minutes INT NOT NULL CHECK (direct_minutes >= 0),
    travel_minutes INT DEFAULT 0,
    documentation_minutes INT DEFAULT 0,
    billable_units INT NOT NULL,
    goal_addressed TEXT NOT NULL,
    interventions_provided TEXT[] NOT NULL,
    client_response TEXT NOT NULL,
    next_steps TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'locked', 'cosigned')),
    sha256_hash VARCHAR(64),
    locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit Trail Logs (Tamper-Evident)
CREATE TABLE audit_trail_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    details JSONB,
    sha256_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail_logs ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policy Example
CREATE POLICY org_session_notes_isolation ON session_notes
    FOR ALL
    USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
```
