/**
 * Peer Notebook - Frictionless Unauthenticated Free Sandbox Tier (1099 Contractors)
 * GA #8 Standard • Strict Client-Side In-Memory Execution • Zero Cloud Persistence
 * HIPAA & CMIA Aligned • Single-Note 4-Part CalAIM Architecture with Clipboard Export
 */

import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldAlert,
  Clock,
  HeartHandshake,
  RefreshCw,
  Info
} from 'lucide-react';
import { sanitizeToNonClinicalLanguage, calculateMediCalBillingUnits } from '../services/peerNoteEngine';
import { TrafficAnalyticsService } from '../services/trafficAnalyticsService';

interface FreeSandboxTierProps {
  onLoginClick: () => void;
  onUpgradeClick: () => void;
  onBackToLanding: () => void;
}

export const FreeSandboxTier: React.FC<FreeSandboxTierProps> = ({
  onLoginClick,
  onUpgradeClick,
  onBackToLanding
}) => {
  // Pure in-memory states (no IndexedDB, no Cloud persistence)
  const [clientIdentifier, setClientIdentifier] = useState('PN-SANDBOX');
  const [faceToFaceMinutes, setFaceToFaceMinutes] = useState(45);
  const [travelMinutes, setTravelMinutes] = useState(15);
  const [docMinutes, setDocMinutes] = useState(10);
  const [goalAddressed, setGoalAddressed] = useState(
    'Client identified goal of securing stable permanent housing and maintaining 90 days continuous recovery.'
  );
  const [peerIntervention, setPeerIntervention] = useState(
    'Shared lived recovery experience regarding navigating local housing authority waitlists. Modeled stress-reduction breathing techniques and co-reviewed section 8 packet.'
  );
  const [clientResponse, setClientResponse] = useState(
    'Client engaged actively, completed two housing application sections, and stated: "I feel less overwhelmed breaking this into smaller daily steps."'
  );
  const [planNextSteps, setPlanNextSteps] = useState(
    'Client to gather identification records by Thursday; peer specialist to meet client at community center Friday at 10:00 AM.'
  );

  const [copied, setCopied] = useState(false);
  const [replacementsCount, setReplacementsCount] = useState(0);

  // Medi-Cal 15-minute billing unit calculation (CMS 8-minute rule)
  const totalMinutes = faceToFaceMinutes + travelMinutes + docMinutes;
  const billingUnits = calculateMediCalBillingUnits(totalMinutes);

  // Deterministic Strengths-Based Language Translation
  const handleTranslateToNonClinical = () => {
    const resIntervention = sanitizeToNonClinicalLanguage(peerIntervention);
    const resResponse = sanitizeToNonClinicalLanguage(clientResponse);
    const totalReplacements = resIntervention.replacementsCount + resResponse.replacementsCount;

    setPeerIntervention(resIntervention.sanitizedText);
    setClientResponse(resResponse.sanitizedText);
    setReplacementsCount(totalReplacements);

    TrafficAnalyticsService.recordAction('sandboxNoteAuthored');
  };

  // Generate standardized plain-text 4-part CalAIM note
  const generateFormattedNoteText = (): string => {
    return `
================================================================================
CALAIM H0038 PEER SUPPORT SPECIALIST ENCOUNTER NOTE (UNAUTHENTICATED SANDBOX)
================================================================================
Client Identifier:      ${clientIdentifier} (De-Identified)
Service Code:           H0038 (Peer Support Services - 15 Minute Increments)
Total Time Accounting:  ${totalMinutes} Minutes (F2F: ${faceToFaceMinutes}m | Travel: ${travelMinutes}m | Doc: ${docMinutes}m)
Billable Units:         ${billingUnits} Units (CMS 8-Minute Midpoint Rule)
Execution Mode:         Client-Side In-Memory Sandbox (Zero Cloud Storage)
--------------------------------------------------------------------------------
1. RECOVERY GOAL LINKAGE:
${goalAddressed}

2. PEER SPECIALIST INTERVENTION:
${peerIntervention}

3. CLIENT RESPONSE & ENGAGEMENT:
${clientResponse}

4. NEXT COLLABORATIVE STEPS:
${planNextSteps}
--------------------------------------------------------------------------------
Compliance Standard: CalAIM / Medi-Cal H0038 • Peer Notebook (peernotebook.com)
Upgrade to unlock persistent encrypted history, supervisor QA, & PDF exports.
================================================================================
    `.trim();
  };

  const handleCopyToClipboard = async () => {
    const formatted = generateFormattedNoteText();
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      TrafficAnalyticsService.recordAction('sandboxCopiedToClipboard');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
        >
          ← Return to Landing Page
        </button>
        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          🔒 HIPAA/CMIA Safe • Zero Cloud Storage Mode
        </span>
      </div>

      {/* Prominent Upgrade Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#0F766E] text-white text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Free 1099 Sandbox
              </span>
              <span className="text-xs text-blue-200 font-semibold">
                Single-Note Session Mode
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Upgrade to Solo Pro ($19/mo) for Multi-Note Cloud Sync
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              This sandbox does not save your notes once you close your browser. Subscribe or sign in to unlock
              <strong> Dexie.js persistent offline history</strong>, <strong>supervisor cosignature review</strong>,
              and <strong>one-click tamper-evident PDF exports</strong>.
              <span className="block mt-1 text-teal-300 font-bold">
                ✓ Includes a 30-Day Free Trial. Unused trial days automatically rollover!
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={onUpgradeClick}
              className="px-5 py-3 rounded-full bg-[#0F766E] hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <span>Subscribe ($19/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLoginClick}
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-white/20 cursor-pointer"
            >
              <span>Sign In / Register</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sandbox Workspace Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#1E3A8A]">
              1099 Contractor 4-Part Note Sandbox
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft your encounter note, verify billing increments, and copy to clipboard for EHR pasting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTranslateToNonClinical}
              className="px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Transform clinical jargon into strengths-based peer support terminology"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sanitize Non-Clinical ({replacementsCount})</span>
            </button>

            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>

        {/* 15-Minute Billing Calculator Header */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Face-to-Face</span>
            <input
              type="number"
              min="0"
              max="300"
              value={faceToFaceMinutes}
              onChange={(e) => setFaceToFaceMinutes(parseInt(e.target.value, 10) || 0)}
              className="w-20 text-center font-bold text-sm bg-white border border-slate-300 rounded-lg p-1 mt-1"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">min</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Travel</span>
            <input
              type="number"
              min="0"
              max="180"
              value={travelMinutes}
              onChange={(e) => setTravelMinutes(parseInt(e.target.value, 10) || 0)}
              className="w-20 text-center font-bold text-sm bg-white border border-slate-300 rounded-lg p-1 mt-1"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">min</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Documentation</span>
            <input
              type="number"
              min="0"
              max="60"
              value={docMinutes}
              onChange={(e) => setDocMinutes(parseInt(e.target.value, 10) || 0)}
              className="w-20 text-center font-bold text-sm bg-white border border-slate-300 rounded-lg p-1 mt-1"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">min</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">H0038 Units</span>
            <span className="text-xl font-extrabold text-[#16A34A]">{billingUnits} Units</span>
            <span className="text-[10px] text-emerald-700 font-semibold">({totalMinutes} total mins)</span>
          </div>
        </div>

        {/* 4-Part CalAIM Note Architecture Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider block mb-1">
              1. Recovery Goal Linkage (Self-Directed)
            </label>
            <textarea
              rows={2}
              value={goalAddressed}
              onChange={(e) => setGoalAddressed(e.target.value)}
              className="w-full text-xs text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0F766E] transition-colors"
              placeholder="Cite client's personal recovery goal..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider block mb-1">
              2. Peer Specialist Intervention (Non-Clinical Lived Experience Coaching)
            </label>
            <textarea
              rows={3}
              value={peerIntervention}
              onChange={(e) => setPeerIntervention(e.target.value)}
              className="w-full text-xs text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0F766E] transition-colors"
              placeholder="Detail peer actions, lived experience sharing, system navigation..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider block mb-1">
              3. Client Response &amp; Measurable Engagement
            </label>
            <textarea
              rows={3}
              value={clientResponse}
              onChange={(e) => setClientResponse(e.target.value)}
              className="w-full text-xs text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0F766E] transition-colors"
              placeholder="Observable behavioral reactions, client direct quotes, mutual rapport..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider block mb-1">
              4. Next Collaborative Steps (Action Plan)
            </label>
            <textarea
              rows={2}
              value={planNextSteps}
              onChange={(e) => setPlanNextSteps(e.target.value)}
              className="w-full text-xs text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0F766E] transition-colors"
              placeholder="Next encounter date, agreed client action steps..."
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Need persistent records across visits? Log in or subscribe to activate Dexie.js offline vault.</span>
          </div>

          <button
            type="button"
            onClick={handleCopyToClipboard}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0F766E] hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Note'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
