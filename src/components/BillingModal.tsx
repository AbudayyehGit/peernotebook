/**
 * Peer Notebook - Stripe Billing & 30-Day Free Trial Management Modal
 * GA #8 Standard • 30-Day Trial with Automatic Rollover Guarantee
 * Features:
 *  - 30-Day Free Trial Countdown with Unused Days Rollover Credit
 *  - Full Interactive Stripe Sandbox Payment Workflow
 *  - Real Test Card Buttons (4242 Success, 4002 Decline, Expired)
 *  - Instant Simulated Invoice Receipt Generation & Download
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
  CreditCard,
  Sparkles,
  Clock,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Award,
  Download,
  CheckCircle2,
  X,
  FileText
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
  const [isSandboxCheckoutOpen, setIsSandboxCheckoutOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expMonth, setExpMonth] = useState('12');
  const [expYear, setExpYear] = useState('28');
  const [cvc, setCvc] = useState('123');
  const [postalCode, setPostalCode] = useState('94102');
  const [successReceipt, setSuccessReceipt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const trialDetails = StripeBillingService.getTrialDetails(currentUser);
  const rollover = StripeBillingService.calculateTrialRollover(currentUser);
  const currentTierInfo = SUBSCRIPTION_TIERS[selectedTier];

  const handleOpenSandbox = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setErrorMessage(null);
    setSuccessReceipt(null);
    setIsSandboxCheckoutOpen(true);
  };

  const handleExecuteSandboxPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await StripeBillingService.executeSandboxCheckout(
        {
          cardNumber,
          expMonth,
          expYear,
          cvc,
          postalCode,
          planTier: selectedTier,
          interval: selectedInterval
        },
        currentUser
      );

      if (!result.success) {
        setErrorMessage(result.errorMessage || 'Payment was declined by card issuer.');
        setIsProcessing(false);
        return;
      }

      // Update user billing state with rollover credit
      await updateUserBilling({
        subscriptionStatus: 'active_subscriber',
        subscriptionTier: selectedTier,
        billingInterval: selectedInterval,
        stripeCustomerId: result.customerId,
        stripeSubscriptionId: result.subscriptionId,
        trialEndsAt: currentUser?.trialEndsAt,
        currentPeriodEnd: result.nextBillingDate,
        cancelAtPeriodEnd: false
      });

      const receipt = StripeBillingService.generateSimulatedInvoice({
        invoiceId: result.invoiceId,
        customerEmail: currentUser?.email || 'specialist@peernotebook.com',
        customerName: currentUser?.fullName || 'Certified Peer Specialist',
        tierName: SUBSCRIPTION_TIERS[selectedTier].name,
        amount: result.amountPaid,
        interval: selectedInterval,
        rolloverDays: result.rolloverDaysGranted,
        nextBillingDate: result.nextBillingDate
      });

      setSuccessReceipt(receipt);
      setIsProcessing(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Sandbox payment failed.');
      setIsProcessing(false);
    }
  };

  const downloadReceipt = () => {
    if (!successReceipt) return;
    const blob = new Blob([successReceipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PeerNotebook_Stripe_Receipt_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl overflow-y-auto z-10 flex flex-col text-slate-800">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F766E] flex items-center justify-center text-white shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E3A8A]">Subscription &amp; Stripe Sandbox</h2>
              <p className="text-xs text-slate-500">
                Peer Notebook • 30-Day Free Trial with Rollover Guarantee • HIPAA Aligned
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 30-Day Trial & Rollover Notice Banner */}
        <div className="bg-[#F0FDFA] border-b border-[#CCFBF1] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
                  30-Day Free Trial Rollover Guarantee
                </span>
                <span className="text-[10px] bg-[#0F766E] text-white px-2 py-0.5 rounded-full font-bold">
                  Zero Lost Days
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {trialDetails.rolloverNotice}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500">Trial status:</span>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${trialDetails.statusBadgeColor}`}>
              {trialDetails.statusBadgeText}
            </span>
          </div>
        </div>

        {/* Gated feature notice if triggered by locked action */}
        {gatedFeatureNotice && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{gatedFeatureNotice}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Billing Interval Toggle */}
          <div className="flex justify-center">
            <div className="bg-slate-100 p-1 rounded-full flex items-center border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedInterval('monthly')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedInterval === 'monthly'
                    ? 'bg-[#1E3A8A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setSelectedInterval('annual')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedInterval === 'annual'
                    ? 'bg-[#1E3A8A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Object.values(SUBSCRIPTION_TIERS).map((plan) => {
              const isCurrent = currentUser?.subscriptionTier === plan.id;
              const isSelected = selectedTier === plan.id;
              const price = selectedInterval === 'annual' ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedTier(plan.id)}
                  className={`rounded-2xl p-5 border-2 flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0F766E] bg-teal-50/20 shadow-md ring-2 ring-[#0F766E]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {plan.badge || 'Plan'}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Your Active Plan
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#1E3A8A]">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plan.description}</p>

                    <div className="my-4">
                      <span className="text-3xl font-extrabold text-[#1E3A8A]">${price}</span>
                      <span className="text-xs text-slate-500 font-medium">/month</span>
                      {selectedInterval === 'annual' && (
                        <p className="text-[11px] text-[#0F766E] font-semibold mt-0.5">
                          Billed annually (${plan.annualPrice}/yr)
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-5 mt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSandbox(plan.id);
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F766E] hover:bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Launch Stripe Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stripe Sandbox Checkout Drawer */}
          {isSandboxCheckoutOpen && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0F766E]" />
                  <h3 className="text-sm font-bold text-[#1E3A8A]">
                    Stripe Sandbox Relay • {SUBSCRIPTION_TIERS[selectedTier].name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSandboxCheckoutOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {/* Rollover Credit Banner */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-center justify-between">
                <span>
                  <strong>Rollover Applied:</strong> {rollover.remainingTrialDays} days remaining on trial will roll over.
                </span>
                <span className="font-bold">Next renewal: {new Date(rollover.effectivePaidStartDate).toLocaleDateString()}</span>
              </div>

              {/* Quick Fill Test Cards */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Interactive Test Cards (Stripe Sandbox):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('4242 4242 4242 4242');
                      setErrorMessage(null);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold hover:bg-emerald-100 cursor-pointer"
                  >
                    🟢 4242 (Success Payment)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('4000 0000 0000 0002');
                      setErrorMessage(null);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-300 font-semibold hover:bg-red-100 cursor-pointer"
                  >
                    🔴 4002 (Card Declined)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('4000 0000 0000 0069');
                      setErrorMessage(null);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 font-semibold hover:bg-amber-100 cursor-pointer"
                  >
                    🟡 0069 (Expired Card)
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Exp (MM/YY)</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value)}
                      className="w-1/2 text-xs font-mono p-2.5 bg-white border border-slate-300 rounded-xl text-center"
                    />
                    <input
                      type="text"
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value)}
                      className="w-1/2 text-xs font-mono p-2.5 bg-white border border-slate-300 rounded-xl text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">CVC / ZIP</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-1/2 text-xs font-mono p-2.5 bg-white border border-slate-300 rounded-xl text-center"
                    />
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-1/2 text-xs font-mono p-2.5 bg-white border border-slate-300 rounded-xl text-center"
                    />
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteSandboxPayment}
                className="w-full py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Stripe Sandbox Transaction...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Authorize ${selectedInterval === 'annual' ? currentTierInfo.annualPrice : currentTierInfo.monthlyPrice}.00 (Test Relay)
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Paid Invoice Receipt Preview */}
          {successReceipt && (
            <div className="bg-slate-900 text-emerald-400 p-5 rounded-2xl font-mono text-xs space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
                <span className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Payment Succeeded • Sandbox Webhook Dispatched
                </span>
                <button
                  type="button"
                  onClick={downloadReceipt}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 font-sans font-bold text-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Invoice Receipt</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-[11px] overflow-x-auto">
                {successReceipt}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
