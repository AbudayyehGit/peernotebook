/**
 * Vercel Serverless / Edge Telemetry Endpoint
 * Receives exception and database timeout logs from Peer Notebook client apps
 * Emits structured JSON to Vercel runtime logs for observability and alerting.
 */

export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const batch = Array.isArray(body?.batch) ? body.batch : [body];

    for (const item of batch) {
      console.error(
        `[VERCEL_EDGE_LOG] [PEER_NOTEBOOK_INCIDENT] [${item.category || 'UNKNOWN'}]`,
        JSON.stringify({
          ...item,
          edgeReceivedAt: new Date().toISOString(),
          edgeRegion: request.headers.get('x-vercel-id') || 'local-edge'
        })
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        loggedCount: batch.length,
        receivedAt: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[VERCEL_EDGE_LOG] Telemetry parse error:', errorMsg);
    return new Response(JSON.stringify({ error: 'Failed to parse telemetry' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
