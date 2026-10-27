/**
 * Peer Notebook - Universal Vercel Serverless / Edge Telemetry Endpoint
 * Receives exception and database timeout logs from Peer Notebook client apps
 * Emits structured JSON to runtime logs for observability and alerting.
 */

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req: any, res?: any) {
  const isNode = Boolean(res && typeof res.setHeader === 'function');

  let method = 'POST';
  let body: any = {};
  let userAgent = 'Unknown';
  let vercelId = 'local';

  if (isNode) {
    method = (req.method || 'POST').toUpperCase();
    body = req.body || {};
    userAgent = req.headers?.['user-agent'] || 'Unknown';
    vercelId = req.headers?.['x-vercel-id'] || 'local-node';
  } else if (req instanceof Request || (req && req.url && typeof req.headers?.get === 'function')) {
    method = (req.method || 'POST').toUpperCase();
    userAgent = req.headers?.get?.('user-agent') || 'Unknown';
    vercelId = req.headers?.get?.('x-vercel-id') || 'local-edge';
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  if (method !== 'POST') {
    if (isNode) {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const batch = Array.isArray(body?.batch) ? body.batch : [body];

    for (const item of batch) {
      console.error(
        `[VERCEL_LOG] [PEER_NOTEBOOK_INCIDENT] [${item?.category || 'UNKNOWN'}]`,
        JSON.stringify({
          ...item,
          edgeReceivedAt: new Date().toISOString(),
          edgeRegion: vercelId,
          userAgent
        })
      );
    }

    const responsePayload = {
      ok: true,
      loggedCount: batch.length,
      receivedAt: new Date().toISOString()
    };

    if (isNode) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(responsePayload));
      return;
    }

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[VERCEL_LOG] Telemetry parse error:', errorMsg);
    if (isNode) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to parse telemetry' }));
      return;
    }
    return new Response(JSON.stringify({ error: 'Failed to parse telemetry' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
