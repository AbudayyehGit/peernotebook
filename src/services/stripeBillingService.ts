/**
 * Peer Notebook - Stripe Billing & Subscription Service
 * GA #8 Standard • 30-Day Zero-Risk Free Trial with Automatic Rollover
 * Handles Checkout Sessions, Stripe Sandbox Workflow, Webhook Simulation, and Customer Portal
 */

import { User, SubscriptionStatus, SubscriptionTier, BillingInterval } from '../db/peerNotebookDatabase';
import { AuditLogger } from './auditLogger';

export interface PlanTierInfo {
  id: SubscriptionTier;
  name: string;
  badge?: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  stripeMonthlyPriceId: string;
  stripeAnnualPriceId: string;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, PlanTierInfo> = {
  founding_specialist: {
    id: 'founding_specialist',
    name: 'Solo Specialist Pro',
    badge: '30-Day Free Trial',
    monthlyPrice: 19,
    annualPrice: 190,
    description: 'Purpose-built for California CPSS-CA practitioners and solo recovery coaches.',
    features: [
      '30-Day Zero-Risk Free Trial (No Card Upfront)',
      'Rollover Guarantee: Remaining trial days add to your first paid month',
      '100% Offline Field Logging (Dexie.js IndexedDB)',
      'Deterministic 4-Part CalAIM DAP Notes (<90s)',
      'Automatic DHCS 15-Min Billing Units (CMS 8-Min Rule)',
      'Client-Side SHA-256 Tamper-Evident PDF Export',
      'Encrypted AES-GCM 256-bit Backup Archives',
      'Continuous Cloud Sync to Supabase PostgreSQL'
    ],
    stripeMonthlyPriceId: 'price_founding_monthly_19',
    stripeAnnualPriceId: 'price_founding_annual_190'
  },
  solo_1099_pro: {
    id: 'solo_1099_pro',
    name: '1099 Independent Contractor Pro',
    badge: '1099 Optimized',
    monthlyPrice: 39,
    annualPrice: 390,
    description: 'Engineered for independent 1099 recovery coaches juggling multiple agency contracts.',
    features: [
      'Everything in Solo Specialist',
      '30-Day Free Trial with Full Rollover Protection',
      '1099 Independent Contractor Tax & W-9 Mode',
      'Automated Mileage Tracking ($0.67/mile IRS rate)',
      'Contract Hourly Rate Billable Amount Math',
      'Multi-Agency Routing & Separation',
      '1-Click Contractor Timesheet & Claim Export',
      'Priority Field Sync SLA & Cloud Backup'
    ],
    stripeMonthlyPriceId: 'price_solo_1099_monthly_39',
    stripeAnnualPriceId: 'price_solo_1099_annual_390'
  },
  agency_unlimited: {
    id: 'agency_unlimited',
    name: 'CBO Agency & Supervisor Team',
    badge: 'CBO Standard',
    monthlyPrice: 149,
    annualPrice: 1490,
    description: 'For Community-Based Organizations, clinics, and county behavioral health departments.',
    features: [
      'Everything in Solo 1099 Pro',
      'Unlimited Peer Specialists & Supervisors',
      'Supervisor Note Review, Approval & Cosigning Queue',
      'Role-Based Access Control (Admin, Supervisor, Peer)',
      'County Medi-Cal 837P EDI Batch Export Prep',
      'Real-Time Agency-Wide Audit Trail Logs',
      'Dedicated BAA & CalMHSA County Compliance Binder'
    ],
    stripeMonthlyPriceId: 'price_agency_monthly_149',
    stripeAnnualPriceId: 'price_agency_annual_1490'
  }
};

export interface CheckoutRequest {
  tier: SubscriptionTier;
  interval: BillingInterval;
  customerEmail: string;
  userName?: string;
  organizationId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResult {
  url?: string;
  sessionId?: string;
  isSimulated?: boolean;
  message?: string;
}

export interface StripeSandboxCardPayment {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  postalCode: string;
  planTier: SubscriptionTier;
  interval: BillingInterval;
}

export interface StripeSandboxPaymentResult {
  success: boolean;
  statusCode: number;
  status: 'succeeded' | 'requires_action' | 'card_declined' | 'expired_card';
  customerId: string;
  subscriptionId: string;
  chargeId: string;
  amountPaid: number;
  rolloverDaysGranted: number;
  nextBillingDate: string;
  invoiceId: string;
  errorMessage?: string;
}

export class StripeBillingService {
  /**
   * Calculates 30-day trial details, remaining days, and rollover entitlement
   */
  public static getTrialDetails(user: User | null): {
    daysRemaining: number;
    hoursRemaining: number;
    isTrialActive: boolean;
    isSubscriptionActive: boolean;
    hasFullAccess: boolean;
    statusBadgeText: string;
    statusBadgeColor: string;
    rolloverNotice: string;
  } {
    if (!user) {
      return {
        daysRemaining: 30,
        hoursRemaining: 720,
        isTrialActive: true,
        isSubscriptionActive: false,
        hasFullAccess: true,
        statusBadgeText: '30-Day Free Trial',
        statusBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        rolloverNotice: '30 days free. Any remaining trial days roll over upon subscription.'
      };
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      return {
        daysRemaining: 999,
        hoursRemaining: 9999,
        isTrialActive: false,
        isSubscriptionActive: true,
        hasFullAccess: true,
        statusBadgeText: user.role === 'super_admin' ? 'Super Admin / Engineer (Full)' : 'Agency Admin Tier (Full)',
        statusBadgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
        rolloverNotice: 'Permanent administrative access.'
      };
    }

    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'active_subscriber') {
      const tierName = SUBSCRIPTION_TIERS[user.subscriptionTier || 'founding_specialist']?.name || 'Active Plan';
      return {
        daysRemaining: 365,
        hoursRemaining: 8760,
        isTrialActive: false,
        isSubscriptionActive: true,
        hasFullAccess: true,
        statusBadgeText: `${tierName} · Active`,
        statusBadgeColor: 'bg-emerald-50 text-[#16A34A] border-emerald-200 font-semibold',
        rolloverNotice: 'Active subscription with rollover credit applied.'
      };
    }

    if (user.subscriptionStatus === 'past_due') {
      return {
        daysRemaining: 0,
        hoursRemaining: 0,
        isTrialActive: false,
        isSubscriptionActive: false,
        hasFullAccess: false,
        statusBadgeText: 'Past Due · Please Update Payment',
        statusBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        rolloverNotice: 'Please update payment to resume cloud synchronization.'
      };
    }

    if (user.subscriptionStatus === 'canceled') {
      return {
        daysRemaining: 0,
        hoursRemaining: 0,
        isTrialActive: false,
        isSubscriptionActive: false,
        hasFullAccess: false,
        statusBadgeText: 'Subscription Canceled',
        statusBadgeColor: 'bg-red-50 text-red-700 border-red-200 font-bold',
        rolloverNotice: 'Subscription canceled. Local offline notes remain accessible in read-only mode.'
      };
    }

    const trialEnds = user.trialEndsAt ? new Date(user.trialEndsAt).getTime() : Date.now() + 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const diffMs = trialEnds - now;
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    const hoursRemaining = Math.max(0, Math.ceil(diffMs / (60 * 60 * 1000)));
    const isTrialActive = diffMs > 0 && (user.subscriptionStatus === 'trialing' || !user.subscriptionStatus);

    if (isTrialActive) {
      return {
        daysRemaining,
        hoursRemaining,
        isTrialActive: true,
        isSubscriptionActive: false,
        hasFullAccess: true,
        statusBadgeText: `Free Trial: ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`,
        statusBadgeColor: daysRemaining <= 5
          ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
          : 'bg-teal-50 text-[#0F766E] border-teal-200 font-semibold',
        rolloverNotice: `All ${daysRemaining} remaining trial days will rollover automatically to your first subscription period!`
      };
    }

    return {
      daysRemaining: 0,
      hoursRemaining: 0,
      isTrialActive: false,
      isSubscriptionActive: false,
      hasFullAccess: false,
      statusBadgeText: '30-Day Trial Expired',
      statusBadgeColor: 'bg-red-50 text-red-700 border-red-200 font-bold',
      rolloverNotice: 'Trial expired. Subscribe for $19/mo to continue cloud sync and Medi-Cal exports.'
    };
  }

  /**
   * Calculates trial rollover days when upgrading to a paid subscription
   */
  public static calculateTrialRollover(user: User | null): {
    remainingTrialDays: number;
    effectivePaidStartDate: string;
    rolloverApplied: boolean;
  } {
    if (!user || !user.trialEndsAt) {
      const now = Date.now();
      return {
        remainingTrialDays: 30,
        effectivePaidStartDate: new Date(now + 60 * 24 * 60 * 60 * 1000).toISOString(),
        rolloverApplied: true
      };
    }

    const trialEnd = new Date(user.trialEndsAt).getTime();
    const now = Date.now();
    const remainingTrialDays = Math.max(0, Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000)));

    // Remaining trial days + 30 days of paid subscription cycle
    const totalDays = remainingTrialDays + 30;
    const effectivePaidStartDate = new Date(now + totalDays * 24 * 60 * 60 * 1000).toISOString();

    return {
      remainingTrialDays,
      effectivePaidStartDate,
      rolloverApplied: remainingTrialDays > 0
    };
  }

  /**
   * Executes a full Stripe Sandbox Payment simulation with realistic test cards
   */
  public static async executeSandboxCheckout(
    payment: StripeSandboxCardPayment,
    user: User | null
  ): Promise<StripeSandboxPaymentResult> {
    const cleanNumber = payment.cardNumber.replace(/\s+/g, '');
    const plan = SUBSCRIPTION_TIERS[payment.planTier] || SUBSCRIPTION_TIERS.founding_specialist;
    const amount = payment.interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Test Card Logic
    if (cleanNumber.endsWith('0002') || cleanNumber.startsWith('400000000002')) {
      return {
        success: false,
        statusCode: 402,
        status: 'card_declined',
        customerId: '',
        subscriptionId: '',
        chargeId: '',
        amountPaid: 0,
        rolloverDaysGranted: 0,
        nextBillingDate: '',
        invoiceId: '',
        errorMessage: 'Your card was declined. Insufficient funds in sandbox account.'
      };
    }

    if (cleanNumber.endsWith('0069') || cleanNumber.startsWith('400000000069')) {
      return {
        success: false,
        statusCode: 402,
        status: 'expired_card',
        customerId: '',
        subscriptionId: '',
        chargeId: '',
        amountPaid: 0,
        rolloverDaysGranted: 0,
        nextBillingDate: '',
        invoiceId: '',
        errorMessage: 'Your card has expired. Please provide a card with valid expiration.'
      };
    }

    // Default Success Flow (4242 or any standard card)
    const rollover = this.calculateTrialRollover(user);
    const customerId = user?.stripeCustomerId || `cus_test_${Math.random().toString(36).substring(2, 10)}`;
    const subscriptionId = `sub_test_${Math.random().toString(36).substring(2, 10)}`;
    const chargeId = `ch_test_${Math.random().toString(36).substring(2, 10)}`;
    const invoiceId = `in_test_${Math.random().toString(36).substring(2, 10)}`;

    return {
      success: true,
      statusCode: 200,
      status: 'succeeded',
      customerId,
      subscriptionId,
      chargeId,
      amountPaid: amount,
      rolloverDaysGranted: rollover.remainingTrialDays,
      nextBillingDate: rollover.effectivePaidStartDate,
      invoiceId
    };
  }

  /**
   * Generates a simulated Stripe Invoice & Receipt
   */
  public static generateSimulatedInvoice(params: {
    invoiceId: string;
    customerEmail: string;
    customerName: string;
    tierName: string;
    amount: number;
    interval: string;
    rolloverDays: number;
    nextBillingDate: string;
  }): string {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
================================================================================
                    PEER NOTEBOOK LLC - STRIPE INVOICE
================================================================================
Invoice Number:    ${params.invoiceId}
Date:              ${formattedDate}
Customer:          ${params.customerName} (${params.customerEmail})
Status:            PAID (Stripe Sandbox Relay)
--------------------------------------------------------------------------------
LINE ITEMS:
1. ${params.tierName} (${params.interval === 'annual' ? 'Annual Billing' : 'Monthly Billing'})
   Base Rate:                                              $${params.amount}.00
2. 30-Day Free Trial Rollover Credit:                      +${params.rolloverDays} bonus days
   Effective Next Renewal:                                 ${new Date(params.nextBillingDate).toLocaleDateString()}
--------------------------------------------------------------------------------
Subtotal:                                                  $${params.amount}.00
Tax (Healthcare SaaS BAA Exemption):                       $0.00
TOTAL CHARGED:                                             $${params.amount}.00
Payment Method:                                            Visa ending in 4242
================================================================================
HIPAA / Medi-Cal CalAIM H0038 Peer Support Documentation Platform
Peer Notebook LLC • support@peernotebook.com • peernotebook.com
================================================================================
    `.trim();
  }
}
