/**
 * Peer Notebook - Stripe Checkout Session Handler
 * GA #8 Standard • 14-Day Free Trial & Founding Member Subscription Locking
 * Runs as a Vercel Serverless Function or Node.js API Route
 */

import type { IncomingMessage, ServerResponse } from 'http';

interface CheckoutRequestBody {
  tier: 'founding_specialist' | 'solo_1099_pro' | 'agency_unlimited';
  interval: 'monthly' | 'annual';
  customerEmail: string;
  userName?: string;
  organizationId?: string;
  successUrl: string;
  cancelUrl: string;
}

const PRICE_CONFIG = {
  founding_specialist: {
    monthly: { amount: 1900, name: 'Peer Notebook - Founding Specialist (Monthly)' },
    annual: { amount: 19000, name: 'Peer Notebook - Founding Specialist (Annual - 2 Months Free)' }
  },
  solo_1099_pro: {
    monthly: { amount: 3900, name: 'Peer Notebook - Solo 1099 Pro (Monthly)' },
    annual: { amount: 39000, name: 'Peer Notebook - Solo 1099 Pro (Annual - 2 Months Free)' }
  },
  agency_unlimited: {
    monthly: { amount: 14900, name: 'Peer Notebook - Agency & Supervisor Team (Monthly)' },
    annual: { amount: 149000, name: 'Peer Notebook - Agency & Supervisor Team (Annual - 2 Months Free)' }
  }
};

export default async function handler(req: any, res: any) {
  // CORS configuration
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
    const body: CheckoutRequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { tier, interval, customerEmail, userName, organizationId, successUrl, cancelUrl } = body;

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const priceInfo = PRICE_CONFIG[tier]?.[interval] || PRICE_CONFIG.founding_specialist.monthly;

    if (!stripeKey) {
      // In sandbox/preview mode where Stripe API key is not yet configured,
      // return a graceful simulated checkout response so frontend flows execute seamlessly
      const simulatedSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return res.status(200).json({
        sessionId: simulatedSessionId,
        url: `${successUrl.replace('{CHECKOUT_SESSION_ID}', simulatedSessionId)}&simulated=true`,
        simulated: true,
        message: 'Sandbox mode: Zero-risk simulated subscription initiated.'
      });
    }

    // Call live Stripe API via standard HTTP fetch without external SDK dependency
    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('customer_email', customerEmail);
    params.append('client_reference_id', customerEmail);
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);
    params.append('subscription_data[trial_period_days]', '14');
    params.append('subscription_data[metadata][tier]', tier);
    params.append('subscription_data[metadata][interval]', interval);
    if (organizationId) params.append('subscription_data[metadata][organizationId]', organizationId);
    if (userName) params.append('subscription_data[metadata][userName]', userName);

    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][unit_amount]', String(priceInfo.amount));
    params.append('line_items[0][price_data][recurring][interval]', interval === 'annual' ? 'year' : 'month');
    params.append('line_items[0][price_data][product_data][name]', priceInfo.name);
    params.append('line_items[0][price_data][product_data][description]', 'CalAIM & Medi-Cal H0038 Peer Encounter Documentation');
    params.append('line_items[0][quantity]', '1');

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      return res.status(stripeResponse.status).json({
        error: stripeData.error?.message || 'Stripe checkout creation failed'
      });
    }

    return res.status(200).json({
      sessionId: stripeData.id,
      url: stripeData.url
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
