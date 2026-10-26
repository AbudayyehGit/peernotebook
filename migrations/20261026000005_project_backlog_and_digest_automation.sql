-- ==============================================================================
-- Peer Notebook: Project Backlog Schema & Automated Daily Digest Enhancement
-- Version: 20261026000005_project_backlog_and_digest_automation
-- Target: Supabase PostgreSQL Relational Storage
-- Standard: GA #8 • HIPAA / CMIA Aligned • CalAIM Compliance
-- Schedule: Daily at 00:00 UTC -> support@peernotebook.com
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Project Backlog Table for Live Engineering Task Tracking
CREATE TABLE IF NOT EXISTS project_backlog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Engineering', -- 'Engineering', 'Security', 'Compliance', 'Governance', 'Operations'
    priority VARCHAR(20) NOT NULL DEFAULT 'P1', -- 'P0', 'P1', 'P2'
    status VARCHAR(50) NOT NULL DEFAULT 'In Progress', -- 'Pending', 'In Progress', 'Completed', 'Blocked'
    assigned_role VARCHAR(100) DEFAULT 'Principal Engineer',
    description TEXT,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_backlog_status ON project_backlog(status);
CREATE INDEX IF NOT EXISTS idx_project_backlog_priority ON project_backlog(priority);

-- 2. Enable Row-Level Security
ALTER TABLE project_backlog ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated users can view backlog items
DROP POLICY IF EXISTS "Public can view project backlog" ON project_backlog;
CREATE POLICY "Public can view project backlog"
    ON project_backlog FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- Authenticated staff can manage backlog items
DROP POLICY IF EXISTS "Staff can manage project backlog" ON project_backlog;
CREATE POLICY "Staff can manage project backlog"
    ON project_backlog FOR ALL
    TO authenticated
    USING (TRUE);

-- 3. Seed Production Engineering & Pre-Launch Governance Tasks
INSERT INTO project_backlog (task_id, title, category, priority, status, assigned_role, description, due_date)
VALUES
    ('TASK-01', 'Automated Daily Digest via Supabase Edge Function & Resend API', 'Engineering', 'P0', 'In Progress', 'Principal Architect', 'Deploy scheduled 00:00 UTC daily email digest with backlog checklist and lead captures targeting support@peernotebook.com', CURRENT_DATE + INTERVAL '1 day'),
    ('TASK-02', 'Peer Notebook LLC Formation & Articles of Organization Filing', 'Governance', 'P0', 'Pending', 'Managing Member', 'File Articles of Organization with California Secretary of State and obtain IRS EIN prior to commercial billing', CURRENT_DATE + INTERVAL '14 days'),
    ('TASK-03', 'Formal Execution of Founder-to-LLC IP Assignment Agreement', 'Governance', 'P0', 'Pending', 'Managing Member & Counsel', 'Execute formal IP Assignment Agreement transferring 100% domain, patents, and copyright to Peer Notebook LLC upon charter receipt', CURRENT_DATE + INTERVAL '15 days'),
    ('TASK-04', 'Zero-Trust Field Privacy Pseudonymization & De-identification Audit', 'Security', 'P1', 'In Progress', 'Security Architect', 'Verify deterministic client masking (Client #XXXX) across all field outreach views and printable summaries', CURRENT_DATE + INTERVAL '2 days'),
    ('TASK-05', 'Client-Side 256-Bit AES-GCM Encrypted JSON Export & SHA-256 Stamp', 'Compliance', 'P1', 'In Progress', 'Lead Frontend Engineer', 'Enforce PBKDF2 100,000-iteration key derivation and tamper-evident SHA-256 checksums in export vault', CURRENT_DATE + INTERVAL '3 days'),
    ('TASK-06', 'CalAIM Medi-Cal H0038 15-Minute Billing Math Verification for County Bridge', 'Compliance', 'P1', 'In Progress', 'Compliance Specialist', 'Validate CMS 8-minute rounding calculations across direct, travel, and documentation time splits', CURRENT_DATE + INTERVAL '5 days'),
    ('TASK-07', 'Solo 1099 Independent Contractor Tenancy & Mileage Ledger', 'Operations', 'P2', 'In Progress', 'Full-Stack Engineer', 'Verify standalone 1099 contractor tenancy without organizational foreign key requirement', CURRENT_DATE + INTERVAL '7 days')
ON CONFLICT (task_id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    priority = EXCLUDED.priority,
    status = EXCLUDED.status,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 4. Enhanced Helper Function: Full Digest Payload with Backlog Checklist
CREATE OR REPLACE FUNCTION get_daily_digest_full_payload(p_hours INTEGER DEFAULT 24)
RETURNS JSONB AS $$
DECLARE
    v_start_time TIMESTAMPTZ := NOW() - (p_hours || ' hours')::INTERVAL;
    v_new_leads INTEGER;
    v_total_leads INTEGER;
    v_total_visits INTEGER;
    v_unique_visitors INTEGER;
    v_conversion_rate NUMERIC(5, 2) := 0.00;
    v_recent_leads JSONB;
    v_top_routes JSONB;
    v_active_backlog JSONB;
    v_active_backlog_count INTEGER;
    v_total_backlog_count INTEGER;
BEGIN
    -- Leads & Traffic Counts
    SELECT COUNT(*) INTO v_new_leads FROM lead_captures WHERE created_at >= v_start_time;
    SELECT COUNT(*) INTO v_total_leads FROM lead_captures;
    SELECT COUNT(*) INTO v_total_visits FROM site_traffic_analytics WHERE created_at >= v_start_time;
    SELECT COUNT(DISTINCT visitor_id) INTO v_unique_visitors FROM site_traffic_analytics WHERE created_at >= v_start_time;

    IF v_total_visits > 0 THEN
        v_conversion_rate := ROUND((v_new_leads::NUMERIC / v_total_visits::NUMERIC) * 100, 2);
    END IF;

    -- Recent lead captures
    SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_recent_leads FROM (
        SELECT email, full_name, role_title, county, wants_beta_cohort, created_at
        FROM lead_captures
        WHERE created_at >= v_start_time
        ORDER BY created_at DESC
        LIMIT 25
    ) sub;

    -- Top traffic routes
    SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_top_routes FROM (
        SELECT route, COUNT(*) as pageviews
        FROM site_traffic_analytics
        WHERE created_at >= v_start_time
        GROUP BY route
        ORDER BY pageviews DESC
        LIMIT 10
    ) sub;

    -- Backlog items where status != 'Completed'
    SELECT COUNT(*) INTO v_active_backlog_count FROM project_backlog WHERE status != 'Completed';
    SELECT COUNT(*) INTO v_total_backlog_count FROM project_backlog;

    SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_active_backlog FROM (
        SELECT task_id, title, category, priority, status, assigned_role, due_date
        FROM project_backlog
        WHERE status != 'Completed'
        ORDER BY 
            CASE priority 
                WHEN 'P0' THEN 1 
                WHEN 'P1' THEN 2 
                WHEN 'P2' THEN 3 
                ELSE 4 
            END,
            created_at ASC
    ) sub;

    RETURN jsonb_build_object(
        'period_hours', p_hours,
        'period_start', v_start_time,
        'period_end', NOW(),
        'target_recipient', 'support@peernotebook.com',
        'new_leads_count', v_new_leads,
        'total_leads_count', v_total_leads,
        'total_visits', v_total_visits,
        'unique_visitors', v_unique_visitors,
        'conversion_rate', v_conversion_rate,
        'recent_leads', v_recent_leads,
        'top_routes', v_top_routes,
        'active_backlog_count', v_active_backlog_count,
        'total_backlog_count', v_total_backlog_count,
        'active_backlog', v_active_backlog,
        'pre_launch_governance', jsonb_build_object(
            'llc_formation', 'Pending Pre-Launch Milestone (Articles of Organization & EIN in progress)',
            'ip_assignment', 'Pending Pre-Launch Milestone (Executed upon LLC charter completion)'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
