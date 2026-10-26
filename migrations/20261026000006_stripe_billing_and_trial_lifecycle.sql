-- ==============================================================================
-- Peer Notebook Migration: 20261026000006_stripe_billing_and_trial_lifecycle.sql
-- Module: Stripe Subscription, 14-Day Free Trial, Webhooks & Customer Portal
-- Compatible with Supabase PostgreSQL, Row-Level Security & CalAIM Isolation
-- ==============================================================================

-- 1. Extend user_profiles with Stripe Billing & Free Trial Tracking Fields
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trialing' 
  CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid')),
ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'founding_specialist'
  CHECK (subscription_tier IN ('founding_specialist', 'solo_1099_pro', 'agency_unlimited')),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'monthly'
  CHECK (billing_interval IN ('monthly', 'annual')),
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

-- Create indices for lightning fast lookup during Stripe webhook reconciliation
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON public.user_profiles (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_subscription_id ON public.user_profiles (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON public.user_profiles (subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_trial_ends_at ON public.user_profiles (trial_ends_at);

-- 2. Billing Invoices & Payment Ledger Table
CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('paid', 'open', 'void', 'uncollectible')),
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own billing invoices"
  ON public.billing_invoices
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Stored Helper Function: Check if user has active trial or subscription
CREATE OR REPLACE FUNCTION public.is_subscription_or_trial_active(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
  v_trial_ends TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  SELECT subscription_status, trial_ends_at, current_period_end
  INTO v_status, v_trial_ends, v_period_end
  FROM public.user_profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Active paid subscription
  IF v_status = 'active' THEN
    RETURN true;
  END IF;

  -- In free trial window
  IF v_status = 'trialing' AND v_trial_ends > NOW() THEN
    RETURN true;
  END IF;

  -- Grace period until period end
  IF v_period_end IS NOT NULL AND v_period_end > NOW() THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- 4. Stored Helper Function: Webhook reconcile handler
CREATE OR REPLACE FUNCTION public.reconcile_stripe_subscription(
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_price_id TEXT,
  p_status TEXT,
  p_tier TEXT,
  p_interval TEXT,
  p_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_res JSONB;
BEGIN
  SELECT id INTO v_user_id
  FROM public.user_profiles
  WHERE stripe_customer_id = p_stripe_customer_id;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Customer not found');
  END IF;

  UPDATE public.user_profiles
  SET 
    stripe_subscription_id = p_stripe_subscription_id,
    stripe_price_id = p_stripe_price_id,
    subscription_status = p_status,
    subscription_tier = COALESCE(p_tier, subscription_tier),
    billing_interval = COALESCE(p_interval, billing_interval),
    current_period_end = p_period_end,
    cancel_at_period_end = p_cancel_at_period_end,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Append to audit trail
  INSERT INTO public.audit_trail_logs (
    organization_id,
    user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  SELECT 
    organization_id,
    v_user_id,
    'STRIPE_SUBSCRIPTION_UPDATE',
    'user_profiles',
    v_user_id,
    jsonb_build_object(
      'status', p_status,
      'tier', p_tier,
      'stripe_subscription_id', p_stripe_subscription_id,
      'period_end', p_period_end
    )
  FROM public.user_profiles
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id, 'status', p_status);
END;
$$;

COMMENT ON TABLE public.billing_invoices IS 'Peer Notebook Stripe customer payment invoices and receipt archives';
