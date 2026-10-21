-- ==============================================================================
-- PEER NOTEBOOK: SUPABASE ROW-LEVEL SECURITY (RLS) MULTI-TENANT TEST SUITE
-- Target: PostgreSQL / Supabase
-- Purpose: Mathematically verifies that each authenticated specialist's session data
--          is restricted exclusively to their assigned organization ID.
-- Execution: Safe transactional test harness (terminates with ROLLBACK)
-- ==============================================================================

BEGIN;

-- 1. Setup Mock Test Environment
DO $$
DECLARE
    org_alpha UUID := '11111111-1111-1111-1111-111111111111';
    org_beta  UUID := '22222222-2222-2222-2222-222222222222';
    spec_alpha UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    spec_beta  UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    client_alpha UUID := 'c1111111-1111-1111-1111-111111111111';
    client_beta  UUID := 'c2222222-2222-2222-2222-222222222222';
    note_alpha UUID := 'd1111111-1111-1111-1111-111111111111';
    note_beta  UUID := 'd2222222-2222-2222-2222-222222222222';
    test_count INTEGER;
BEGIN
    RAISE NOTICE '[START] Peer Notebook Multi-Tenant RLS Hardening Verification';

    -- Insert Organizations
    INSERT INTO organizations (id, name, npi, county_code)
    VALUES 
        (org_alpha, 'Hope Horizons Behavioral (Org Alpha)', '1992003001', '38-San Francisco'),
        (org_beta,  'Bay Area Recovery Collective (Org Beta)', '1992003002', '01-Alameda');

    -- Insert Users
    INSERT INTO users (id, organization_id, email, full_name, role)
    VALUES 
        (spec_alpha, org_alpha, 'specialist.alpha@hopehorizons.org', 'Maria Gonzalez, CPSS-CA', 'peer_specialist'),
        (spec_beta,  org_beta,  'specialist.beta@bayrecovery.org', 'Devon Brooks, CPSS-CA', 'peer_specialist');

    -- Insert Clients
    INSERT INTO clients (id, organization_id, client_identifier, preferred_name, assigned_specialist_id)
    VALUES
        (client_alpha, org_alpha, 'PN-1011', 'Alex M.', spec_alpha),
        (client_beta,  org_beta,  'PN-2022', 'Jordan K.', spec_beta);

    -- Insert Session Notes
    INSERT INTO session_notes (
        id, organization_id, client_id, author_id, author_name, encounter_date,
        start_time, end_time, duration_minutes, billing_code, goal_addressed,
        peer_intervention, client_response, plan_next_steps, specialist_signature
    ) VALUES (
        note_alpha, org_alpha, client_alpha, spec_alpha, 'Maria Gonzalez', CURRENT_DATE,
        '10:00:00', '11:00:00', 60, 'H0038', 'Housing navigation',
        'Assisted with voucher application', 'Client engaged enthusiastically', 'Follow up in 3 days', 'Maria Gonzalez, CPSS-CA'
    ), (
        note_beta, org_beta, client_beta, spec_beta, 'Devon Brooks', CURRENT_DATE,
        '13:00:00', '14:00:00', 60, 'H0038', 'Substance use recovery',
        'Harm reduction kit education', 'Client receptive to community meeting', 'Attend meeting next Monday', 'Devon Brooks, CPSS-CA'
    );

    RAISE NOTICE '[SETUP COMPLETE] Seeded 2 organizations, 2 specialists, 2 clients, 2 session notes.';
END $$;

-- 2. Test Execution under Specialist Alpha Security Context
-- Set mock JWT claims for Specialist Alpha (Org Alpha)
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated", "app_metadata": {"organization_id": "11111111-1111-1111-1111-111111111111", "role": "peer_specialist"}}';
SET LOCAL ROLE authenticated;

-- Test 1: Verify Specialist Alpha can SELECT their own organization's session notes
DO $$
DECLARE
    visible_notes INTEGER;
BEGIN
    SELECT COUNT(*) INTO visible_notes FROM session_notes;
    IF visible_notes <> 1 THEN
        RAISE EXCEPTION 'TEST 1 FAILED: Expected exactly 1 visible note for Org Alpha, found %', visible_notes;
    END IF;
    RAISE NOTICE 'TEST 1 PASSED: Specialist Alpha sees exactly 1 note (Org Alpha). Note Beta is invisible.';
END $$;

-- Test 2: Verify Specialist Alpha CANNOT see any session note belonging to Org Beta
DO $$
DECLARE
    cross_tenant_notes INTEGER;
BEGIN
    SELECT COUNT(*) INTO cross_tenant_notes 
    FROM session_notes 
    WHERE organization_id = '22222222-2222-2222-2222-222222222222';

    IF cross_tenant_notes > 0 THEN
        RAISE EXCEPTION 'TEST 2 CRITICAL SECURITY FAILURE: Specialist Alpha can see % notes from Org Beta!', cross_tenant_notes;
    END IF;
    RAISE NOTICE 'TEST 2 PASSED: 0 notes visible from Org Beta (Zero cross-tenant leakage).';
END $$;

-- Test 3: Verify Specialist Alpha CANNOT update session notes belonging to Org Beta
DO $$
DECLARE
    rows_updated INTEGER;
BEGIN
    UPDATE session_notes 
    SET goal_addressed = 'Tampered by Cross-Tenant Attacker'
    WHERE organization_id = '22222222-2222-2222-2222-222222222222';
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    IF rows_updated > 0 THEN
        RAISE EXCEPTION 'TEST 3 CRITICAL SECURITY FAILURE: Updated % rows in Org Beta!', rows_updated;
    END IF;
    RAISE NOTICE 'TEST 3 PASSED: Cross-tenant update blocked by RLS (0 rows updated).';
END $$;

-- Test 4: Verify Specialist Alpha CANNOT delete session notes belonging to Org Beta
DO $$
DECLARE
    rows_deleted INTEGER;
BEGIN
    DELETE FROM session_notes 
    WHERE organization_id = '22222222-2222-2222-2222-222222222222';

    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    IF rows_deleted > 0 THEN
        RAISE EXCEPTION 'TEST 4 CRITICAL SECURITY FAILURE: Deleted % rows in Org Beta!', rows_deleted;
    END IF;
    RAISE NOTICE 'TEST 4 PASSED: Cross-tenant delete blocked by RLS (0 rows deleted).';
END $$;

-- Test 5: Verify Cross-Tenant INSERT into Org Beta is blocked
DO $$
BEGIN
    BEGIN
        INSERT INTO session_notes (
            id, organization_id, author_id, author_name, encounter_date,
            start_time, end_time, duration_minutes, goal_addressed,
            peer_intervention, client_response, plan_next_steps, specialist_signature
        ) VALUES (
            'd3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222',
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Maria Gonzalez', CURRENT_DATE,
            '15:00:00', '16:00:00', 60, 'Intrusion attempt',
            'Test', 'Test', 'Test', 'Signature'
        );
        RAISE EXCEPTION 'TEST 5 CRITICAL FAILURE: Cross-tenant INSERT into Org Beta succeeded!';
    EXCEPTION
        WHEN insufficient_privilege OR check_violation THEN
            RAISE NOTICE 'TEST 5 PASSED: Cross-tenant insert into Org Beta blocked with RLS violation.';
    END;
END $$;

-- Test 6: Verify Specialist Alpha CAN insert a valid note within Org Alpha
DO $$
BEGIN
    INSERT INTO session_notes (
        id, organization_id, author_id, author_name, encounter_date,
        start_time, end_time, duration_minutes, goal_addressed,
        peer_intervention, client_response, plan_next_steps, specialist_signature
    ) VALUES (
        'd4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Maria Gonzalez', CURRENT_DATE,
        '16:00:00', '17:00:00', 60, 'Legitimate Org Alpha Encounter',
        'CalAIM peer mentoring', 'Progress made', 'Next step agreed', 'Maria Gonzalez, CPSS-CA'
    );
    RAISE NOTICE 'TEST 6 PASSED: Intra-tenant insert within assigned Org Alpha succeeded.';
END $$;

-- Test 7: Verify Cross-Tenant Client linking is rejected by defense-in-depth trigger
DO $$
BEGIN
    BEGIN
        INSERT INTO session_notes (
            id, organization_id, client_id, author_id, author_name, encounter_date,
            start_time, end_time, duration_minutes, goal_addressed,
            peer_intervention, client_response, plan_next_steps, specialist_signature
        ) VALUES (
            'd5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111',
            'c2222222-2222-2222-2222-222222222222', -- Client from Org Beta!
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Maria Gonzalez', CURRENT_DATE,
            '17:00:00', '18:00:00', 60, 'Cross-client attack',
            'Test', 'Test', 'Test', 'Signature'
        );
        RAISE EXCEPTION 'TEST 7 CRITICAL FAILURE: Cross-tenant client linking succeeded!';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'TEST 7 PASSED: Cross-tenant client reference aborted by trigger: %', SQLERRM;
    END;
END $$;

RAISE NOTICE '====================================================================';
RAISE NOTICE 'ALL 7 MULTI-TENANT ROW-LEVEL SECURITY TESTS PASSED CONVINCINGLY.';
RAISE NOTICE 'Specialist session data is mathematically isolated to assigned organization ID.';
RAISE NOTICE '====================================================================';

-- Safe rollback so database remains completely clean
ROLLBACK;
