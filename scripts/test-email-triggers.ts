/**
 * Automated Verification & Testing Suite for Peer Notebook Email Triggers
 * Tests:
 * 1. Automatic & Manual Daily Digest (/api/daily-digest)
 * 2. Immediate Lead Capture Notification (/api/lead-capture)
 * 3. 6-Digit Lead Authenticity Email Verification (/api/verify-email)
 */

import dailyDigestHandler from '../api/daily-digest';
import leadCaptureHandler from '../api/lead-capture';
import verifyEmailHandler from '../api/verify-email';

async function runEmailTriggerTests() {
  console.log('================================================================');
  console.log('  PEER NOTEBOOK AUTOMATED EMAIL TRIGGER TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      if (detail) console.log(`       -> ${detail}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       -> ${detail}`);
      process.exitCode = 1;
    }
  }

  // --- TEST 1: Email Verification Send ---
  console.log('--- Step 1: Testing Email Verification OTP Generation & Dispatch ---');
  try {
    const sendReq = new Request('https://peernotebook.com/api/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        email: 'alex.rivera@alamedahealth.org',
        name: 'Alex Rivera',
        roleTitle: 'Certified Peer Support Specialist (CPSS-CA)'
      })
    });

    const sendRes = await verifyEmailHandler(sendReq);
    const sendData = await sendRes.json();

    assert(sendRes.status === 200, 'Verify Email Endpoint: Send HTTP 200');
    assert(Boolean(sendData.ok), 'Verify Email Endpoint: ok === true');
    assert(typeof sendData.simulatedCode === 'string' && sendData.simulatedCode.length === 6, 'Verify Email Endpoint: Generated 6-digit OTP', `OTP: ${sendData.simulatedCode}`);
    assert(sendData.email === 'alex.rivera@alamedahealth.org', 'Verify Email Endpoint: Target email recipient matches');

    // --- TEST 2: Email Verification Code Validation ---
    console.log('\n--- Step 2: Testing Email Verification Code Validation ---');
    const verifyReq = new Request('https://peernotebook.com/api/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        email: 'alex.rivera@alamedahealth.org',
        code: sendData.simulatedCode
      })
    });

    const verifyRes = await verifyEmailHandler(verifyReq);
    const verifyData = await verifyRes.json();

    assert(verifyRes.status === 200, 'Verify Email Endpoint: Validate HTTP 200');
    assert(Boolean(verifyData.verified), 'Verify Email Endpoint: verified === true', verifyData.message);

    // Negative test: Invalid OTP
    const invalidReq = new Request('https://peernotebook.com/api/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        email: 'alex.rivera@alamedahealth.org',
        code: '000000'
      })
    });
    const invalidRes = await verifyEmailHandler(invalidReq);
    assert(invalidRes.status === 400, 'Verify Email Endpoint: Rejects invalid code with HTTP 400');
  } catch (err) {
    assert(false, 'Verify Email Tests Exception', String(err));
  }

  // --- TEST 3: Lead Capture Notification ---
  console.log('\n--- Step 3: Testing Lead Capture & Waitlist Notification Trigger ---');
  try {
    const leadReq = new Request('https://peernotebook.com/api/lead-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.specialist@sfpeer.org',
        name: 'Sarah Specialist',
        roleTitle: 'Certified Peer Support Specialist (CPSS-CA)',
        county: '38-San Francisco',
        wantsBetaCohort: true
      })
    });

    const leadRes = await leadCaptureHandler(leadReq);
    const leadData = await leadRes.json();

    assert(leadRes.status === 201, 'Lead Capture Endpoint: HTTP 201 Created');
    assert(Boolean(leadData.ok), 'Lead Capture Endpoint: ok === true');
    assert(Boolean(leadData.leadId), 'Lead Capture Endpoint: Generated lead tracking ID', leadData.leadId);
    assert(Boolean(leadData.emailDeliveryStatus), 'Lead Capture Endpoint: Email delivery status recorded', leadData.emailDeliveryStatus);
  } catch (err) {
    assert(false, 'Lead Capture Tests Exception', String(err));
  }

  // --- TEST 4: Daily Digest Automation ---
  console.log('\n--- Step 4: Testing Daily Summary Digest Automation ---');
  try {
    const digestReq = new Request('https://peernotebook.com/api/daily-digest?manual=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ triggeredBy: 'automated_test' })
    });

    const digestRes = await dailyDigestHandler(digestReq);
    const digestData = await digestRes.json();

    assert(digestRes.status === 200, 'Daily Digest Endpoint: HTTP 200 OK');
    assert(digestData.recipient === 'support@peernotebook.com', 'Daily Digest Endpoint: Dispatches to support@peernotebook.com');
    assert(Array.isArray(digestData.recentLeads) && digestData.recentLeads.length > 0, 'Daily Digest Endpoint: Section 1 (Last 24 Hours Signups) populated', `${digestData.recentLeads.length} leads in last 24h`);
    assert(Array.isArray(digestData.allLeads) && digestData.allLeads.length >= digestData.recentLeads.length, 'Daily Digest Endpoint: Section 2 (All Captured Signups Ever) populated', `${digestData.allLeads.length} total cumulative signups`);
    assert(Array.isArray(digestData.activeBacklog) && digestData.activeBacklog.length > 0, 'Daily Digest Endpoint: Active backlog checklist included', `${digestData.activeBacklog.length} tasks`);
    assert(typeof digestData.htmlReport === 'string' && digestData.htmlReport.includes('support@peernotebook.com'), 'Daily Digest Endpoint: Complete HTML email report compiled');
  } catch (err) {
    assert(false, 'Daily Digest Tests Exception', String(err));
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`TOTAL: ${passedTests}/${totalTests} EMAIL TRIGGER TESTS PASSED`);
  console.log('----------------------------------------------------------------\n');
}

runEmailTriggerTests().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
