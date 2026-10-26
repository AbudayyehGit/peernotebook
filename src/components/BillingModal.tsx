/**
 * Peer Notebook - Stripe Billing & 14-Day Free Trial Management Modal
 * GA #8 Standard • Trauma-Informed Clinical UI • Strict 8pt Spacing
 * Handles Plan Selection, Free Trial Countdown, Stripe Checkout & Self-Serve Portal
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  StripeBillingService,
  SUBSCRIPTION_TIERS,
  PlanTierInfo
} from '../services/stripeBillingService';
import { SubscriptionTier, BillingInterval } from '../db/peerNotebookDatabase';
import {
  Check,
  ShieldCheck,
  ExternalLink,
  CreditCard,
  Sparkles,
  Clock,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  gatedFeatureNotice?: string | null;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  gatedFeatureNotice
}) => {
  const { currentUser, updateUserBilling } = useAuth();
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('monthly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    currentUser?.subscriptionTier || 'founding_specialist'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const trialDetails = StripeBillingService.getTrialDetails(currentUser);
  const currentTierInfo = SUBSCRIPTION_TIERS[currentUser?.subscriptionTier || 'founding_specialist'];

  const handleInitiateCheckout = async (tier: SubscriptionTier) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await StripeBillingService.createCheckoutSession({
        tier,
        interval: selectedInterval,
        customerEmail: currentUser?.email || 'specialist@peernotebook.com',
        userName: currentUser?.fullName,
        organizationId: currentUser?.organizationId
      });

      if (result.url && !result.isSimulated) {
        // Redirect to live Stripe Checkout
        window.location.href = result.url;
        return;
      }

      // In sandbox/simulated mode, activate the subscription in local Dexie store
      await updateUserBilling({
        subscriptionStatus: 'active',
        subscriptionTier: tier,
        billingInterval: selectedInterval,
        stripeCustomerId: currentUser?.stripeCustomerId || `cus_sim_${Date.now()}`,
        stripeSubscriptionId: result.sessionId || `sub_sim_${Date.now()}`,
        currentPeriodEnd: new Date(Date.now() + (selectedInterval === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      });

      setSuccessMessage(`Subscription activated! You are now subscribed to the ${SUBSCRIPTION_TIERS[tier].name} (${selectedInterval}).`);
      setIsProcessing(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Checkout initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleOpenStripePortal = async () => {
    setIsProcessing(true);
    try {
      const result = await StripeBillingService.createCustomerPortalSession(
        currentUser?.stripeCustomerId,
        window.location.href
      );
      if (result.url && !result.isSimulated) {
        window.location.href = result.url;
      } else {
        setSuccessMessage('Sandbox Portal: You can manage renewals, payment methods, or upgrade tiers directly from this panel.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not open billing portal.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateTrialDays = async (days: number) => {
    const trialEndsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    await updateUserBilling({
      subscriptionStatus: days > 0 ? 'trialing' : 'canceled',
      trialEndsAt,
      currentPeriodEnd: trialEndsAt
    });
    setSuccessMessage(`Simulated trial state: ${days === 0 ? 'Expired' : `${days} days remaining`}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#1E3A8A] to-blue-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/30 border border-teal-300/40 text-teal-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Stripe Billing &amp; Subscription Portal
              </span>
              <span className="hidden sm:inline-flex text-xs font-mono text-blue-200">
                14-Day Free Trial
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Invest in your practice. Reclaim your clinical time.
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Zero-risk 14-day full access trial. No credit card required upfront. Cancel anytime with 1-click note archive export.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Feature Gating Alert Notice */}
        {gatedFeatureNotice && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2 px-6 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{gatedFeatureNotice}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Active Status & Trial Progress Bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Current Account Status
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${trialDetails.statusBadgeColor}`}>
                  {trialDetails.statusBadgeText}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Logged in as: <strong className="text-[#1E3A8A]">{currentUser?.email}</strong> · Current Tier:{' '}
                <strong className="text-[#0F766E]">{currentTierInfo.name}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {currentUser?.subscriptionStatus === 'active' && (
                <button
                  type="button"
                  onClick={handleOpenStripePortal}
                  disabled={isProcessing}
                  className="min-h-[44px] px-4 py-2 bg-white hover:bg-slate-100 text-[#1E3A8A] border border-slate-300 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Stripe Billing Portal</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback Alerts */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Billing Interval Toggle */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="bg-slate-100 p-1 rounded-full border border-slate-200 flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedInterval('monthly')}
                className={`min-h-[44px] px-5 py-2 rounded-full transition-all cursor-pointer ${
                  selectedInterval === 'monthly'
                    ? 'bg-white text-[#1E3A8A] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setSelectedInterval('annual')}
                className={`min-h-[44px] px-5 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedInterval === 'annual'
                    ? 'bg-white text-[#1E3A8A] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 bg-[#16A34A] text-white rounded-full text-[10px] font-bold">
                  Save 17% (2 Mo Free)
                </span>
              </button>
            </div>
          </div>

          {/* Tier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {(Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTier[]).map((tierKey) => {
              const tier = SUBSCRIPTION_TIERS[tierKey];
              const isCurrent = currentUser?.subscriptionTier === tierKey && currentUser?.subscriptionStatus === 'active';
              const price = selectedInterval === 'monthly' ? tier.monthlyPrice : Math.round(tier.annualPrice / 12);
              const totalAnnual = tier.annualPrice;

              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-all relative ${
                    tierKey === 'founding_specialist'
                      ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20 bg-teal-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 right-4">
                      <span className="px-2.5 py-0.5 bg-[#0F766E] text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#1E3A8A]">{tier.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {tier.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-[#1E3A8A]">${price}</span>
                        <span className="text-xs text-slate-500 font-medium">/ month</span>
                      </div>
                      {selectedInterval === 'annual' && (
                        <p className="text-[11px] text-[#16A34A] font-semibold mt-0.5">
                          Billed annually at ${totalAnnual}/year
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Includes 14-day zero-risk trial
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Included Features
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                            <span className="leading-tight">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isProcessing || isCurrent}
                      onClick={() => handleInitiateCheckout(tierKey)}
                      className={`w-full min-h-[48px] px-4 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : tierKey === 'founding_specialist'
                          ? 'bg-[#0F766E] hover:bg-teal-700 text-white shadow-xs'
                          : 'bg-[#1E3A8A] hover:bg-blue-900 text-white shadow-xs'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active Current Plan</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {currentUser?.subscriptionStatus === 'active'
                              ? `Switch to ${tier.name}`
                              : 'Start 14-Day Free Trial'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sandbox Diagnostic Simulator Buttons */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#0F766E]" />
                Sandbox Testing &amp; Lifecycle Diagnostics
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Simulate Billing States</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Test feature gating, trial countdown banners, and live subscription states without running live credit card charges:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSimulateTrialDays(14)}
                className="min-h-[44px] px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 font-semibold cursor-pointer"
              >
                Reset 14 Days Trial
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTrialDays(2)}
                className="min-h-[44px] px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-300 font-semibold cursor-pointer"
              >
                Simulate 2 Days Left (Amber Alert)
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTrialDays(0)}
                className="min-h-[44px] px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-lg border border-red-300 font-semibold cursor-pointer"
              >
                Simulate Trial Expired (Gating)
              </button>
              <button
                type="button"
                onClick={() => handleInitiateCheckout('founding_specialist')}
                className="min-h-[44px] px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 font-semibold cursor-pointer"
              >
                Simulate Active Founding ($19/mo)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>Secure 256-bit encryption · Zero lock-in · Full note export anytime</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-full font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
