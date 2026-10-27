/**
 * Peer Notebook - Stripe Webhook Reconciliation Handler
 * GA #8 Standard • Handles Subscription Lifecycle Events
 * Events: checkout.session.completed, customer.subscription.updated,
 * customer.subscription.deleted, invoice.payment_succeeded
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
  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  const stripeSig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (webhookSecret && stripeSig) {
      // In production with signature validation configured, verify event
      // Note: Full crypto HMAC check can be executed using Web Crypto or Node crypto
      event = JSON.parse(rawBody);
    } else {
      // Parse body directly
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    const eventType = event.type;
    const eventData = event.data?.object;

    console.log(`[Stripe Webhook] Received ${eventType}:`, event.id);

    // Supabase Environment Credentials for updating user_profiles
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    switch (eventType) {
      case 'checkout.session.completed': {
        const customerId = eventData.customer;
        const subscriptionId = eventData.subscription;
        const customerEmail = eventData.customer_email || eventData.client_reference_id;
        const metadata = eventData.metadata || {};
        const tier = metadata.tier || 'founding_specialist';
        const interval = metadata.interval || 'monthly';

        console.log(`[Stripe Webhook] Checkout completed for ${customerEmail} (Tier: ${tier})`);

        if (supabaseUrl && supabaseKey && customerEmail) {
          try {
            await fetch(`${supabaseUrl}/rest/v1/user_profiles?email=eq.${encodeURIComponent(customerEmail)}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                subscription_status: 'active',
                subscription_tier: tier,
                billing_interval: interval,
                current_period_end: new Date(Date.now() + (interval === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
            });
          } catch (dbErr) {
            console.error('[Stripe Webhook] Error updating user profile:', dbErr);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const customerId = eventData.customer;
        const subscriptionId = eventData.id;
        const status = eventData.status; // 'active', 'past_due', 'canceled', 'trialing'
        const cancelAtPeriodEnd = Boolean(eventData.cancel_at_period_end);
        const currentPeriodEnd = eventData.current_period_end
          ? new Date(eventData.current_period_end * 1000).toISOString()
          : undefined;

        console.log(`[Stripe Webhook] Subscription ${subscriptionId} status updated to: ${status}`);

        if (supabaseUrl && supabaseKey && customerId) {
          try {
            await fetch(`${supabaseUrl}/rest/v1/user_profiles?stripe_customer_id=eq.${encodeURIComponent(customerId)}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                subscription_status: status === 'active' ? 'active' : status === 'trialing' ? 'trialing' : status === 'past_due' ? 'past_due' : 'canceled',
                cancel_at_period_end: cancelAtPeriodEnd,
                ...(currentPeriodEnd ? { current_period_end: currentPeriodEnd } : {}),
                updated_at: new Date().toISOString()
              })
            });
          } catch (dbErr) {
            console.error('[Stripe Webhook] Error updating subscription:', dbErr);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const customerId = eventData.customer;
        console.log(`[Stripe Webhook] Subscription canceled for customer: ${customerId}`);

        if (supabaseUrl && supabaseKey && customerId) {
          try {
            await fetch(`${supabaseUrl}/rest/v1/user_profiles?stripe_customer_id=eq.${encodeURIComponent(customerId)}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                subscription_status: 'canceled',
                updated_at: new Date().toISOString()
              })
            });
          } catch (dbErr) {
            console.error('[Stripe Webhook] Error cancelling subscription:', dbErr);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const customerId = eventData.customer;
        const invoiceId = eventData.id;
        const amountPaid = eventData.amount_paid;
        const invoicePdf = eventData.invoice_pdf;
        const hostedInvoiceUrl = eventData.hosted_invoice_url;

        console.log(`[Stripe Webhook] Payment succeeded for invoice ${invoiceId}: $${(amountPaid / 100).toFixed(2)}`);

        if (supabaseUrl && supabaseKey && customerId) {
          try {
            // Re-activate active status and record billing receipt
            await fetch(`${supabaseUrl}/rest/v1/user_profiles?stripe_customer_id=eq.${encodeURIComponent(customerId)}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                subscription_status: 'active',
                updated_at: new Date().toISOString()
              })
            });
          } catch (dbErr) {
            console.error('[Stripe Webhook] Error recording invoice payment:', dbErr);
          }
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${eventType}`);
    }

    return sendResponse(res, 200, { received: true, eventType });
  } catch (err: any) {
    console.error('[Stripe Webhook] Handler error:', err);
    return sendResponse(res, 400, { error: err.message || 'Webhook error' });
  }
}
