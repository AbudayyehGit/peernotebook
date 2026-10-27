/**
 * Peer Notebook - Stripe Customer Billing Portal Session Handler
 * GA #8 Standard • Self-Serve Subscription, Plan Management & Receipts
 */

function sendResponse(res: any, status: number, data?: any) {
  if (typeof res.status === 'function') {
    if (data !== undefined) return res.status(status).json(data);
    return res.status(status).end();
  }
  res.statusCode = status;
  if (data !== undefined) {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(data));
  }
  return res.end();
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return sendResponse(res, 200);
  }

  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { customerId, returnUrl } = body;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey || !customerId) {
      return sendResponse(res, 200, {
        simulated: true,
        url: returnUrl || 'https://peernotebook.com/#settings',
        message: 'Sandbox mode: Customer portal simulated'
      });
    }

    const params = new URLSearchParams();
    params.append('customer', customerId);
    params.append('return_url', returnUrl || 'https://peernotebook.com/#settings');

    const portalResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const portalData = await portalResponse.json();

    if (!portalResponse.ok) {
      return sendResponse(res, portalResponse.status, {
        error: portalData.error?.message || 'Failed to create billing portal session'
      });
    }

    return sendResponse(res, 200, { url: portalData.url });
  } catch (err: any) {
    return sendResponse(res, 500, { error: err.message || 'Internal server error' });
  }
}
