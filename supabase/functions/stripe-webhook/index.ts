// Supabase Edge Function: stripe-webhook/index.ts
// Standards: ISO 9001 • Stripe API 2022-11-15 • Dual-Path Free vs. Pro vs. CBO Licensing
// Author: H. Joe Abudayyeh <joe@peernotebook.com>
// Copyright © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { apiVersion: '2022-11-15' })

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature || '',
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const customerEmail = session.customer_details?.email
      const clientReferenceId = session.client_reference_id
      const subscriptionTier = session.metadata?.plan_tier || 'pro_monthly' // free | pro | cbo_seat

      // Update user subscription state in Supabase PostgreSQL (or log event)
      console.log(`[Stripe Webhook] Subscription activated for ${customerEmail || clientReferenceId}: Tier=${subscriptionTier}`)
    }

    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    return new Response(`Webhook Error: ${err?.message || 'Unknown error'}`, { status: 400 })
  }
})
