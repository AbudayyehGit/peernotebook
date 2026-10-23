/**
 * Vercel Serverless / Edge Lead Capture Endpoint
 * Receives pilot cohort registrations & checklist requests from LandingPage
 * GA #8 Standard • HIPAA / CMIA Aligned
 */

export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { email, name, roleTitle, county, wantsBetaCohort } = body || {};

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'A valid email address is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const leadRecord = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: email.trim().toLowerCase(),
      name: (name || 'Colleague').trim(),
      roleTitle: roleTitle || 'Certified Peer Support Specialist (CPSS-CA)',
      county: county || 'California',
      wantsBetaCohort: Boolean(wantsBetaCohort),
      submittedAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'Unknown'
    };

    console.log('[PEER_NOTEBOOK_LEAD_CAPTURE]', JSON.stringify(leadRecord));

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Lead registration captured successfully for beta cohort.',
        leadId: leadRecord.id,
        capturedAt: leadRecord.submittedAt
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[LEAD_CAPTURE_ERROR]', errorMsg);
    return new Response(JSON.stringify({ error: 'Failed to capture lead', details: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
