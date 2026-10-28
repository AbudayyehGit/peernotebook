/**
 * Peer Notebook - Stripe Billing & Subscription Service
 * GA #8 Standard • 14-Day Zero-Risk Free Trial & Founding Member Locking
 * Handles Checkout Sessions, Customer Billing Portal, and Feature Gating
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
    name: 'Solo Specialist / Founding Member',
    badge: 'Most Popular',
    monthlyPrice: 19,
    annualPrice: 190,
    description: 'Purpose-built for California CPSS-CA practitioners and solo recovery navigators.',
    features: [
      '14-Day Zero-Risk Free Trial (No Card Upfront)',
      '100% Offline Field Logging (Dexie.js IndexedDB)',
      'Deterministic 4-Part CalAIM DAP Notes (<90s)',
      'Automatic DHCS 15-Min Billing Units (CMS 8-Min Rule)',
      'Client-Side SHA-256 Tamper-Evident PDF Export',
      'Encrypted AES-GCM 256-bit Backup Archives',
      'Dual-Tenancy Peer Isolation & Real-Time Cloud Sync'
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
    description: 'Engineered for independent 1099 contractors juggling multiple agency contracts.',
    features: [
      'Everything in Founding Specialist',
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
    badge: 'County Standard',
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

export interface PortalSessionResult {
  url?: string;
  isSimulated?: boolean;
  message?: string;
}

export class StripeBillingService {
  /**
   * Calculates trial details and access validity for a given user
   */
  public static getTrialDetails(user: User | null): {
    daysRemaining: number;
    hoursRemaining: number;
    isTrialActive: boolean;
    isSubscriptionActive: boolean;
    hasFullAccess: boolean;
    statusBadgeText: string;
    statusBadgeColor: string;
  } {
    if (!user) {
      return {
        daysRemaining: 14,
        hoursRemaining: 336,
        isTrialActive: true,
        isSubscriptionActive: false,
        hasFullAccess: true,
        statusBadgeText: '14-Day Free Trial',
        statusBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    }

    if (user.role === 'admin') {
      return {
        daysRemaining: 999,
        hoursRemaining: 9999,
        isTrialActive: false,
        isSubscriptionActive: true,
        hasFullAccess: true,
        statusBadgeText: 'Admin Tier (Unlimited)',
        statusBadgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
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
        statusBadgeColor: 'bg-emerald-50 text-[#16A34A] border-emerald-200 font-semibold'
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
        statusBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
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
        statusBadgeColor: 'bg-red-50 text-red-700 border-red-200 font-bold'
      };
    }

    const trialEnds = user.trialEndsAt ? new Date(user.trialEndsAt).getTime() : Date.now() + 14 * 24 * 60 * 60 * 1000;
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
        statusBadgeColor: daysRemaining <= 3
          ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
          : 'bg-teal-50 text-[#0F766E] border-teal-200 font-semibold'
      };
    }

    return {
      daysRemaining: 0,
      hoursRemaining: 0,
      isTrialActive: false,
      isSubscriptionActive: false,
      hasFullAccess: false,
      statusBadgeText: 'Trial Expired · Upgrade Required',
      statusBadgeColor: 'bg-red-50 text-red-700 border-red-200 font-bold'
    };
  }

  /**
   * Initiates Stripe Checkout session for subscription with 14-day trial
   */
  public static async createCheckoutSession(
    request: CheckoutRequest
  ): Promise<CheckoutResult> {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://peernotebook.com';
    const successUrl = request.successUrl || `${origin}/#workspace?session_id={CHECKOUT_SESSION_ID}&billing=success`;
    const cancelUrl = request.cancelUrl || `${origin}/#workspace?billing=cancelled`;

    try {
      // First attempt backend API route (/api/stripe-checkout)
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: request.tier,
          interval: request.interval,
          customerEmail: request.customerEmail,
          userName: request.userName,
          organizationId: request.organizationId,
          successUrl,
          cancelUrl
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          return { url: data.url, sessionId: data.sessionId };
        }
      }
    } catch {
      // Network or dev server fallback
    }

    // In local dev/offline mode without live Stripe credentials, deliver deterministic simulated checkout
    const simulatedSessionId = `cs_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      sessionId: simulatedSessionId,
      isSimulated: true,
      message: 'Simulated zero-risk checkout activated for testing environment'
    };
  }

  /**
   * Creates a self-serve Stripe Customer Billing Portal session
   */
  public static async createCustomerPortalSession(
    customerId?: string,
    returnUrl?: string
  ): Promise<PortalSessionResult> {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://peernotebook.com';
    const retUrl = returnUrl || `${origin}/#settings`;

    try {
      const res = await fetch('/api/stripe-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          returnUrl: retUrl
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          return { url: data.url };
        }
      }
    } catch {
      // Fallback
    }

    return {
      isSimulated: true,
      message: 'Self-serve billing portal is simulated in sandbox environment'
    };
  }

  /**
   * Feature Gating: Checks if user can access Cloud Sync
   */
  public static canAccessCloudSync(user: User | null): boolean {
    const details = this.getTrialDetails(user);
    return details.hasFullAccess;
  }

  /**
   * Feature Gating: Checks if user can access Encrypted Backup & PDF Export
   */
  public static canAccessEncryptedExport(user: User | null): boolean {
    const details = this.getTrialDetails(user);
    return details.hasFullAccess;
  }

  /**
   * Feature Gating: Checks if user has contractor 1099 mileage & billable math
   */
  public static canAccess1099Pro(user: User | null): boolean {
    if (!user) return true;
    if (user.role === 'admin') return true;
    const tier = user.subscriptionTier || 'founding_specialist';
    return tier === 'solo_1099_pro' || tier === 'agency_unlimited' || Boolean(user.isContractor1099);
  }

  /**
   * Feature Gating: Checks if user can access Supervisor Cosigning Queue
   */
  public static canAccessSupervisorCosigning(user: User | null): boolean {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'supervisor') return true;
    return user.subscriptionTier === 'agency_unlimited';
  }
}
