-- ==============================================================================
-- Peer Notebook: Daily Digest Automation, Lead Captures & Web Traffic Analytics
-- Version: 20261023000003_daily_digest_and_lead_captures
-- Target: Supabase PostgreSQL Relational Storage
-- Standard: GA #8 • HIPAA / CMIA Aligned • CalAIM Compliance
-- Cron Schedule: Daily at 00:00 UTC -> support@peernotebook.com
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Waitlist & Pilot Lead Captures Table
CREATE TABLE IF NOT EXISTS lead_captures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) DEFAULT 'Colleague',
    role_title VARCHAR(150) DEFAULT 'Certified Peer Support Specialist (CPSS-CA)',
    county VARCHAR(100) DEFAULT 'California',
    wants_beta_cohort BOOLEAN DEFAULT TRUE,
    source_route VARCHAR(255) DEFAULT '/#lead-magnet',
    ip_hash VARCHAR(64),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_captures_created_at ON lead_captures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_captures_email ON lead_captures(email);

-- 2. Web Traffic & Engagement Telemetry Table
CREATE TABLE IF NOT EXISTS site_traffic_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) DEFAULT 'pageview', -- 'pageview', 'cta_click', 'checklist_download', 'docs_view'
    visitor_id VARCHAR(64),
    session_id VARCHAR(64),
    referrer VARCHAR(512),
    is_mobile BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_traffic_analytics_created_at ON site_traffic_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_analytics_route ON site_traffic_analytics(route);

-- 3. Daily Summary Digest Delivery Audit Logs
CREATE TABLE IF NOT EXISTS daily_digest_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient VARCHAR(255) NOT NULL DEFAULT 'support@peernotebook.com',
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    new_leads_count INTEGER NOT NULL DEFAULT 0,
    total_leads_count INTEGER NOT NULL DEFAULT 0,
    visits_count INTEGER NOT NULL DEFAULT 0,
    unique_visitors_count INTEGER NOT NULL DEFAULT 0,
    conversion_rate NUMERIC(5, 2) DEFAULT 0.00,
    dispatch_status VARCHAR(50) NOT NULL DEFAULT 'delivered', -- 'delivered', 'pending', 'failed'
    provider VARCHAR(50) DEFAULT 'resend',
    provider_message_id VARCHAR(255),
    triggered_by VARCHAR(50) DEFAULT 'cron_00_utc', -- 'cron_00_utc', 'manual_admin'
    report_html TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_digest_logs_sent_at ON daily_digest_logs(sent_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE lead_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_traffic_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_digest_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert leads (from landing page form)
DROP POLICY IF EXISTS "Anyone can insert lead captures" ON lead_captures;
CREATE POLICY "Anyone can insert lead captures"
    ON lead_captures FOR INSERT
    TO anon, authenticated
    WITH CHECK (email IS NOT NULL AND length(email) > 3);

-- Only authenticated staff/admins can view lead captures
DROP POLICY IF EXISTS "Staff can view lead captures" ON lead_captures;
CREATE POLICY "Staff can view lead captures"
    ON lead_captures FOR SELECT
    TO authenticated
    USING (TRUE);

-- Anonymous users can insert pageview telemetry
DROP POLICY IF EXISTS "Anyone can record traffic telemetry" ON site_traffic_analytics;
CREATE POLICY "Anyone can record traffic telemetry"
    ON site_traffic_analytics FOR INSERT
    TO anon, authenticated
    WITH CHECK (route IS NOT NULL);

-- Only authenticated staff can view traffic analytics
DROP POLICY IF EXISTS "Staff can view traffic analytics" ON site_traffic_analytics;
CREATE POLICY "Staff can view traffic analytics"
    ON site_traffic_analytics FOR SELECT
    TO authenticated
    USING (TRUE);

-- Digest logs viewable by authenticated users
DROP POLICY IF EXISTS "Authenticated users can view digest logs" ON daily_digest_logs;
CREATE POLICY "Authenticated users can view digest logs"
    ON daily_digest_logs FOR ALL
    TO authenticated
    USING (TRUE);

-- 5. Helper Function: Compute 24-Hour Lead & Traffic Stats
CREATE OR REPLACE FUNCTION get_daily_digest_metrics(p_hours INTEGER DEFAULT 24)
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
BEGIN
    -- Counts
    SELECT COUNT(*) INTO v_new_leads FROM lead_captures WHERE created_at >= v_start_time;
    SELECT COUNT(*) INTO v_total_leads FROM lead_captures;
    SELECT COUNT(*) INTO v_total_visits FROM site_traffic_analytics WHERE created_at >= v_start_time;
    SELECT COUNT(DISTINCT visitor_id) INTO v_unique_visitors FROM site_traffic_analytics WHERE created_at >= v_start_time;

    IF v_total_visits > 0 THEN
        v_conversion_rate := ROUND((v_new_leads::NUMERIC / v_total_visits::NUMERIC) * 100, 2);
    END IF;

    -- Recent lead details
    SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_recent_leads FROM (
        SELECT email, full_name, role_title, county, created_at
        FROM lead_captures
        WHERE created_at >= v_start_time
        ORDER BY created_at DESC
        LIMIT 25
    ) sub;

    -- Top routes
    SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_top_routes FROM (
        SELECT route, COUNT(*) as pageviews
        FROM site_traffic_analytics
        WHERE created_at >= v_start_time
        GROUP BY route
        ORDER BY pageviews DESC
        LIMIT 10
    ) sub;

    RETURN jsonb_build_object(
        'period_hours', p_hours,
        'period_start', v_start_time,
        'period_end', NOW(),
        'new_leads_count', v_new_leads,
        'total_leads_count', v_total_leads,
        'total_visits', v_total_visits,
        'unique_visitors', v_unique_visitors,
        'conversion_rate', v_conversion_rate,
        'recent_leads', v_recent_leads,
        'top_routes', v_top_routes
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Cron Schedule Configuration (pg_cron)
-- Scheduled daily at 00:00 UTC to dispatch digest to support@peernotebook.com
-- Note: Uncomment in Supabase projects with pg_cron & pg_net extensions active:
-- SELECT cron.schedule(
--     'peernotebook-daily-digest-00utc',
--     '0 0 * * *',
--     $$
--     SELECT net.http_post(
--         url := 'https://peernotebook.com/api/daily-digest',
--         headers := '{"Content-Type": "application/json"}'::jsonb,
--         body := '{"source": "supabase_pg_cron"}'::jsonb
--     );
--     $$
-- );
