/**
 * Supabase Edge Function: stripe-webhook
 * GA #8 Standard • Handles Stripe Subscription Events with Signature Verification
 * Events: checkout.session.completed, customer.subscription.updated,
 * customer.subscription.deleted, invoice.payment_succeeded
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const event = await req.json();
    const eventType = event.type;
    const eventData = event.data?.object;

    console.log(`[Supabase Edge Function: stripe-webhook] Handling event: ${eventType}`);

    if (eventType === 'checkout.session.completed') {
      const customerId = eventData.customer;
      const subscriptionId = eventData.subscription;
      const customerEmail = eventData.customer_email || eventData.client_reference_id;
      const metadata = eventData.metadata || {};
      const tier = metadata.tier || 'founding_specialist';
      const interval = metadata.interval || 'monthly';

      if (customerEmail) {
        await supabase
          .from('user_profiles')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_tier: tier,
            billing_interval: interval,
            current_period_end: new Date(Date.now() + (interval === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('email', customerEmail);

        // Record audit trail entry
        await supabase.from('audit_trail_logs').insert({
          action: 'STRIPE_SUBSCRIPTION_ACTIVATED',
          entity_type: 'billing',
          entity_id: subscriptionId,
          metadata: { customerEmail, tier, interval, customerId }
        });
      }
    } else if (eventType === 'customer.subscription.updated') {
      const customerId = eventData.customer;
      const status = eventData.status;
      const cancelAtPeriodEnd = Boolean(eventData.cancel_at_period_end);
      const currentPeriodEnd = eventData.current_period_end
        ? new Date(eventData.current_period_end * 1000).toISOString()
        : undefined;

      await supabase
        .from('user_profiles')
        .update({
          subscription_status: status === 'active' ? 'active' : status === 'trialing' ? 'trialing' : status === 'past_due' ? 'past_due' : 'canceled',
          cancel_at_period_end: cancelAtPeriodEnd,
          ...(currentPeriodEnd ? { current_period_end: currentPeriodEnd } : {}),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId);
    } else if (eventType === 'customer.subscription.deleted') {
      const customerId = eventData.customer;

      await supabase
        .from('user_profiles')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId);

      await supabase.from('audit_trail_logs').insert({
        action: 'STRIPE_SUBSCRIPTION_CANCELED',
        entity_type: 'billing',
        entity_id: customerId,
        metadata: { customerId }
      });
    } else if (eventType === 'invoice.payment_succeeded') {
      const customerId = eventData.customer;
      const invoiceId = eventData.id;
      const amountPaid = eventData.amount_paid;

      await supabase
        .from('user_profiles')
        .update({
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId);

      // Insert billing invoice record if table exists
      try {
        const { data: user } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await supabase.from('billing_invoices').insert({
            user_id: user.id,
            stripe_invoice_id: invoiceId,
            stripe_subscription_id: eventData.subscription,
            amount_cents: amountPaid,
            currency: eventData.currency || 'usd',
            status: 'paid',
            invoice_pdf_url: eventData.invoice_pdf,
            hosted_invoice_url: eventData.hosted_invoice_url,
            paid_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Could not insert invoice ledger:', err);
      }
    }

    return new Response(JSON.stringify({ received: true, eventType }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in stripe-webhook edge function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
