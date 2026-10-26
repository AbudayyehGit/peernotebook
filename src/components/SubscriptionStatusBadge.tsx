/**
 * Peer Notebook - Subscription & 14-Day Free Trial Header Badge
 * GA #8 Standard • Trauma-Informed Clinical UI • 48px Minimum Touch Target
 * Plain-English Status: Shows Active Free Trial or Paid Founding Member Status
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { StripeBillingService } from '../services/stripeBillingService';
import { Sparkles, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

interface SubscriptionStatusBadgeProps {
  onOpenBillingModal: () => void;
  className?: string;
}

export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  onOpenBillingModal,
  className = ''
}) => {
  const { currentUser } = useAuth();
  const trialInfo = StripeBillingService.getTrialDetails(currentUser);

  return (
    <button
      type="button"
      onClick={onOpenBillingModal}
      className={`min-h-[44px] sm:min-h-[48px] px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs hover:opacity-95 ${trialInfo.statusBadgeColor} ${className}`}
      title="Click to view subscription tiers, 14-day free trial details, or Stripe billing portal"
    >
      {trialInfo.isSubscriptionActive ? (
        <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
      ) : trialInfo.isTrialActive ? (
        trialInfo.daysRemaining <= 3 ? (
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        ) : (
          <Clock className="w-4 h-4 text-[#0F766E] shrink-0" />
        )
      ) : (
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
      )}
      <span className="truncate max-w-[150px] xs:max-w-none">
        {trialInfo.statusBadgeText}
      </span>
      <Sparkles className="hidden md:inline w-3 h-3 text-amber-500 shrink-0" />
    </button>
  );
};
