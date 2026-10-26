/**
 * Peer Notebook - Stripe Customer Billing Portal Session Handler
 * GA #8 Standard • Self-Serve Subscription, Plan Management & Receipts
 */

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { customerId, returnUrl } = body;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey || !customerId) {
      // In sandbox mode or when customer has no Stripe ID yet, simulate portal return
      return res.status(200).json({
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
      return res.status(portalResponse.status).json({
        error: portalData.error?.message || 'Failed to create billing portal session'
      });
    }

    return res.status(200).json({ url: portalData.url });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
