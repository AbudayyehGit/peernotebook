/**
 * Peer Notebook - Hero Section & High-Conversion Clinical Lead Capture
 * GA #8 Standard • Responsive Container Sizes & Touch Targets (Min 48px)
 * CalAIM & Medi-Cal H0038 Compliant • Anti-AI Slop Restraint
 * Embedded Mandatory Non-Bypassable HIPAA / CMIA Consent Checkboxes
 */

import React, { useState } from 'react';
import {
  Download,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { ZeroAiBadge } from './ZeroAiBadge';
import { leadDigestService } from '../services/leadDigestService';
import { toastService } from '../services/toastService';

interface HeroSectionProps {
  onLaunchApp: () => void;
  onOpenDocs?: (slug?: string) => void;
  onOpenAuthModal?: (mode?: 'signin' | 'register') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchApp,
  onOpenDocs,
  onOpenAuthModal
}) => {
  const [email, setEmail] = useState('');
  const [specialistName, setSpecialistName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Certified Peer Support Specialist (CPSS-CA)');
  const [county, setCounty] = useState('38-San Francisco');
  const [wantsBetaCohort, setWantsBetaCohort] = useState(true);

  // Mandatory Non-Bypassable Compliance Checkboxes
  const [agreeTos, setAgreeTos] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeBaa, setAgreeBaa] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const allConsentGiven = agreeTos && agreePrivacy && agreeBaa;

  const handleSubmitLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setFormError('Please enter a valid work or personal email address.');
      return;
    }
    if (!allConsentGiven) {
      setFormError('All three compliance agreements (ToS, Privacy Policy, BAA) must be accepted.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    try {
      await leadDigestService.submitLead({
        email,
        name: specialistName || 'Colleague',
        roleTitle,
        county,
        wantsBetaCohort
      });
      setIsSubmitted(true);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[LEAD_SUBMISSION_ERROR]', err);
      toastService.error(
        'Delivery Pipeline Notice',
        'Unable to complete remote delivery immediately. Your registration has been safely queued in local storage.',
        errMsg
      );
      // Fallback: still show submission confirmed as local storage queued the record
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="overview" className="relative pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-slate-200/80 w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Headline, Proof Points & Action Group (Col Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Symmetrized Trust Status Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200 text-xs font-semibold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span>California Certified Peer Support (CPSS-CA)</span>
                <span className="text-teal-300" aria-hidden="true">•</span>
                <span>CalAIM &amp; Medi-Cal H0038</span>
              </div>
              <ZeroAiBadge variant="compact" />
            </div>

            {/* Main Headline with Responsive Fluid Typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#1E3A8A] tracking-tight leading-[1.12] text-balance">
              Stop wrestling with clinical paperwork. Start focusing on recovery.
            </h1>

            {/* Subheadline with quantified proof */}
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl text-pretty">
              The first offline-first clinical documentation workspace engineered exclusively for California Certified Peer Support Specialists (CPSS-CA), 1099 independent recovery coaches, and CBO partner agencies. Reduce documentation time by <strong>65% (&lt;5 min/note)</strong> with guaranteed Medi-Cal audit readiness.
            </p>

            {/* Quick Proof Points Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[#0F766E] font-bold text-xs">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>&lt; 5 Min / Note</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Deterministic 4-part CalAIM DAP note structure eliminates writer’s block.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[#16A34A] font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>100% Offline Vault</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Encrypted local storage functions in encampments with seamless cloud sync.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[#D97706] font-bold text-xs">
                  <FileCheck className="w-4 h-4 shrink-0" />
                  <span>H0038 15-Min Math</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Automatic DHCS CMS 8-minute billing unit conversions for clean county claims.
                </p>
              </div>
            </div>

            {/* Symmetrized Action Group with Uniform 48px Dimensions & px-6 py-3.5 */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onLaunchApp}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-full text-sm font-bold shadow-sm transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Launch Beta Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenAuthModal ? onOpenAuthModal('signin') : onLaunchApp()}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 bg-white hover:bg-slate-50 text-[#1E3A8A] rounded-full text-sm font-bold border border-slate-300 shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-[#0F766E]" />
                <span>Login</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenDocs ? onOpenDocs('04-technical-architecture/05_Compliance_Engine_PDF_Export') : (window.location.hash = '#docs')}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#0F766E] hover:text-teal-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer rounded-full bg-teal-50/70 hover:bg-teal-100 border border-teal-200/80"
              >
                <span>Read CalAIM Spec</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Lead Magnet Download & Beta Waitlist Form (Col Span 5) */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-lg space-y-4">
              {!isSubmitted ? (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E] uppercase tracking-wide">
                      <Download className="w-4 h-4 text-[#0F766E]" />
                      <span>Instant Checklist Download + Pilot Access</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      Get "The 10-Minute Medi-Cal H0038 Note Checklist"
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Join our 3–5 specialist solo beta cohort and receive the free printable California CalAIM audit checklist.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitLeadCapture} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Maria Gonzalez, CPSS-CA"
                        value={specialistName}
                        onChange={(e) => setSpecialistName(e.target.value)}
                        className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Work or Personal Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="maria@peeradvocate.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Specialist Role
                        </label>
                        <select
                          value={roleTitle}
                          onChange={(e) => setRoleTitle(e.target.value)}
                          className="w-full min-h-[48px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white"
                        >
                          <option value="Certified Peer Support Specialist (CPSS-CA)">Certified Peer Specialist (CPSS-CA)</option>
                          <option value="1099 Independent Recovery Coach">1099 Independent Coach</option>
                          <option value="Community Health Worker (CHW)">CHW / Peer Navigator</option>
                          <option value="Peer Program Supervisor">Peer Supervisor (LCSW)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          County
                        </label>
                        <select
                          value={county}
                          onChange={(e) => setCounty(e.target.value)}
                          className="w-full min-h-[48px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white"
                        >
                          <option value="38-San Francisco">38-San Francisco</option>
                          <option value="01-Alameda">01-Alameda</option>
                          <option value="19-Los Angeles">19-Los Angeles</option>
                          <option value="34-Sacramento">34-Sacramento</option>
                          <option value="37-San Diego">37-San Diego</option>
                          <option value="43-Santa Clara">43-Santa Clara</option>
                          <option value="Other California County">Other CA County</option>
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wantsBetaCohort}
                        onChange={(e) => setWantsBetaCohort(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E]"
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        Invite me to the 3–5 person Solo Beta Cohort for free lifetime solo tier
                      </span>
                    </label>

                    {/* MANDATORY NON-BYPASSABLE PRIVACY & COMPLIANCE CHECKBOXES */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <span className="font-bold text-[#1E3A8A] block uppercase text-[10px] tracking-wide">
                        Mandatory Compliance Checkboxes:
                      </span>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={agreeTos}
                          onChange={(e) => setAgreeTos(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded text-[#0F766E] focus:ring-[#0F766E]"
                        />
                        <span className="text-slate-700 text-[11px] leading-tight">
                          I agree to the <strong>Terms of Service (ToS)</strong>. <span className="text-rose-500">*</span>
                        </span>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={agreePrivacy}
                          onChange={(e) => setAgreePrivacy(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded text-[#0F766E] focus:ring-[#0F766E]"
                        />
                        <span className="text-slate-700 text-[11px] leading-tight">
                          I agree to the <strong>California CMIA & HIPAA Privacy Policy</strong>. <span className="text-rose-500">*</span>
                        </span>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={agreeBaa}
                          onChange={(e) => setAgreeBaa(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded text-[#0F766E] focus:ring-[#0F766E]"
                        />
                        <span className="text-slate-700 text-[11px] leading-tight">
                          I acknowledge the <strong>Business Associate Agreement (BAA)</strong> provisions. <span className="text-rose-500">*</span>
                        </span>
                      </label>
                    </div>

                    {formError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={!allConsentGiven || isSubmitting}
                        className={`w-full min-h-[48px] px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                          allConsentGiven && !isSubmitting
                            ? 'bg-[#0F766E] hover:bg-teal-800 text-white cursor-pointer hover:shadow-md'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Download className="w-4 h-4" />
                        <span>
                          {isSubmitting
                            ? 'Securing Pilot Spot...'
                            : !allConsentGiven
                            ? 'Check All 3 Required Boxes'
                            : 'Get Free Checklist + Pilot Invite'}
                        </span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 text-center">
                      🔒 Zero spam. California CMIA & CalAIM aligned. Unsubscribe anytime.
                    </p>
                  </form>
                </>
              ) : (
                <div className="p-4 sm:p-5 bg-emerald-50/90 rounded-xl border border-emerald-300 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-[#16A34A]">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <h4 className="font-bold text-slate-900 text-base">
                      You’re In! Checklist Ready for Download
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Thank you, <strong>{specialistName || 'Colleague'}</strong>! We’ve reserved your spot in our 3–5 specialist pilot cohort for <strong>{county} County</strong>.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Lead Magnet Asset:</span>
                      <span className="text-[#0F766E] font-bold">The 10-Minute Medi-Cal H0038 Note Checklist</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Delivery Destination:</span>
                      <span className="font-mono">{email}</span>
                    </div>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <a
                      href="#lead-magnet"
                      className="min-h-[48px] px-6 py-3.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-full text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-colors text-center"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>View Interactive Checklist Below</span>
                    </a>
                    <button
                      type="button"
                      onClick={onLaunchApp}
                      className="min-h-[48px] px-6 py-3.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-full text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
                    >
                      <span>Launch App</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
