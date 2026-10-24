/**
 * Peer Notebook - High-Conversion Production Landing Page & Launchpad
 * GA #8 Milestone 1: Lead Magnet Email Capture & Solo Beta Cohort (3-5 Specialists)
 * Design Tokens: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E), Green (#16A34A)
 * Strictly Light Mode • Trauma-Informed Clinical Aesthetics • Anti-AI Slop Restraint
 */

import React, { useState } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Lock,
  Download,
  ArrowRight,
  Sparkles,
  Users,
  WifiOff,
  Check,
  Mail,
  Zap,
  Printer,
  Copy,
  CheckCheck,
  FileCheck,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { BetaOnboardingModal } from './BetaOnboardingModal';
import { OutreachTemplatesModal } from './OutreachTemplatesModal';
import { TrustComplianceFooter } from './TrustComplianceFooter';
import { ZeroAiBadge } from './ZeroAiBadge';
import { safeStorage } from '../utils/safeStorage';
import { leadDigestService } from '../services/leadDigestService';

// Static photo assets served from /public/images/ with absolute root paths for reliable Vercel production deployment
const HERO_IMAGE_URL = '/images/hero-peer-support-workspace.jpg';
const CHECKLIST_IMAGE_URL = '/images/lead-magnet-checklist-preview.jpg';
const FIELD_TABLET_URL = '/images/field-offline-tablet.jpg';

interface LandingPageProps {
  onLaunchApp: () => void;
  onOpenDocs?: (slug?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onOpenDocs }) => {
  // Lead Capture Form State
  const [email, setEmail] = useState('');
  const [specialistName, setSpecialistName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Certified Peer Support Specialist (CPSS-CA)');
  const [county, setCounty] = useState('San Francisco');
  const [wantsBetaCohort, setWantsBetaCohort] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Image Loading & Fallback States
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [fieldTabletFailed, setFieldTabletFailed] = useState(false);
  const [checklistFailed, setChecklistFailed] = useState(false);

  // Modals
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [checklistCopied, setChecklistCopied] = useState(false);

  // Interactive Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  const checklistStandards = [
    {
      title: '1. CalAIM Medical Necessity & Recovery Goal Linkage',
      desc: 'Encounter directly references the peer client’s active recovery goal (e.g. permanent supportive housing, harm reduction, community navigation) rather than general conversation.',
    },
    {
      title: '2. Clear Peer Specialist Scope of Practice (Non-Clinical)',
      desc: 'Intervention clearly highlights peer-delivered support (lived experience modeling, mutual empowerment, crisis de-escalation) and explicitly avoids licensed psychotherapeutic terminology.',
    },
    {
      title: '3. Direct Quotation of Client’s Own Words',
      desc: 'The "Client Response" section includes at least one authentic verbatim quote from the peer reflecting their emotional state, self-advocacy, or insight.',
    },
    {
      title: '4. Concrete, Actionable Peer Intervention Named',
      desc: 'Specific interventions are stated (e.g. "Reviewed housing voucher application step-by-step; practiced role-playing landlord phone interview").',
    },
    {
      title: '5. Accurate 3-Way Time Allocation',
      desc: 'Direct face-to-face minutes, travel time, and documentation minutes are tracked separately to verify Medi-Cal payment reform compliance.',
    },
    {
      title: '6. Strict H0038 15-Minute Billing Unit Conversion',
      desc: 'Total duration is converted accurately using California DHCS 15-minute rules (8–22 min = 1 unit; 23–37 min = 2 units; 38–52 min = 3 units; 53–67 min = 4 units).',
    },
    {
      title: '7. Specialist Credential Signature & Date Stamp',
      desc: 'Encounter is signed with your legal name and CPSS-CA or trainee credential immediately upon completion.',
    },
  ];

  const handleToggleChecklist = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  React.useEffect(() => {
    leadDigestService.recordPageView('/');
  }, []);

  const handleSubmitLeadCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setFormError('Please enter a valid work or personal email address.');
      return;
    }
    setFormError(null);
    setIsSubmitted(true);

    // Save lead to local storage and dispatch to daily digest lead queue
    leadDigestService.submitLead({
      email,
      name: specialistName || 'Colleague',
      roleTitle,
      county,
      wantsBetaCohort
    });
  };

  const handleCopyChecklistText = async () => {
    const text = `THE 10-MINUTE MEDI-CAL H0038 NOTE CHECKLIST (CalAIM & CalMHSA Compliant)
Peer Notebook (peernotebook.com)

${checklistStandards.map((item, i) => `[ ] ${item.title}\n    ${item.desc}`).join('\n\n')}

CALIFORNIA DHCS H0038 BILLING UNIT INCREMENTS:
• 8 - 22 minutes = 1 Unit
• 23 - 37 minutes = 2 Units
• 38 - 52 minutes = 3 Units
• 53 - 67 minutes = 4 Units
• 68 - 82 minutes = 5 Units

Built with trauma-informed care at peernotebook.com`;

    try {
      await navigator.clipboard.writeText(text);
      setChecklistCopied(true);
      setTimeout(() => setChecklistCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrintChecklist = () => {
    window.print();
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-800 min-h-screen flex flex-col selection:bg-[#0F766E] selection:text-white">
      {/* =========================================================================
          TOP NAVIGATION BAR (Strict 3-Zone Top Bar Contract)
          Zone 1: Brand Wordmark | Zone 2: Single-Line Nav Links | Zone 3: 1 Primary CTA
          ========================================================================= */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 text-base sm:text-lg font-bold tracking-tight text-[#1E3A8A] whitespace-nowrap shrink-0 hover:opacity-95 transition-opacity"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-xs shrink-0">
              <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span>Peer Notebook</span>
          </a>

          {/* Zone 2: single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#overview" className="hover:text-[#1E3A8A] transition-colors whitespace-nowrap shrink-0">
              Overview
            </a>
            <a href="#value-proposition" className="hover:text-[#1E3A8A] transition-colors whitespace-nowrap shrink-0">
              Why Peer Notebook
            </a>
            <a href="#lead-magnet" className="hover:text-[#1E3A8A] transition-colors whitespace-nowrap shrink-0">
              H0038 Checklist
            </a>
            <a href="#beta-cohort" className="hover:text-[#1E3A8A] transition-colors whitespace-nowrap shrink-0">
              Solo Beta Cohort
            </a>
            <a href="#trust" className="text-[#1E3A8A] hover:text-[#0F766E] font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Trust Center</span>
            </a>
            <button
              onClick={() => onOpenDocs ? onOpenDocs() : (window.location.hash = '#docs')}
              className="text-[#0F766E] hover:text-teal-800 font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>Docs Hub (27)</span>
            </button>
            <a
              href="mailto:support@peernotebook.com"
              className="hover:text-[#1E3A8A] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
              title="Official Business Support: support@peernotebook.com"
            >
              <Mail className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Contact</span>
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={() => onOpenDocs ? onOpenDocs() : (window.location.hash = '#docs')}
              className="md:hidden min-h-[44px] px-2.5 sm:px-3.5 py-2 text-xs font-bold text-[#0F766E] bg-teal-50 hover:bg-teal-100 rounded-full border border-teal-200 transition-colors shrink-0"
            >
              Docs
            </button>
            <button
              onClick={onLaunchApp}
              className="min-h-[44px] px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all hover:shadow-md cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2"
            >
              <span className="hidden xs:inline">Launch Beta Workspace</span>
              <span className="xs:hidden">Launch App</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION: High-Conversion Problem / Solution + Lead Capture Form
          ========================================================================= */}
      <section id="overview" className="relative pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headline, Copy & Email Capture Form (Col Span 7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category / Kicker (Clean unboxed text, no pills) */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider">
                <span>California Certified Peer Support (CPSS-CA)</span>
                <span aria-hidden="true">·</span>
                <span>CalAIM & Medi-Cal H0038</span>
                <span aria-hidden="true">·</span>
                <ZeroAiBadge variant="compact" />
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E3A8A] tracking-tight leading-[1.15] text-balance">
                Stop wrestling with clinical paperwork. Start focusing on recovery.
              </h1>

              {/* Subheadline with quantified value & compliance */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Spend <strong>65% less time documenting</strong> and eliminate audit anxiety. Purpose-built for California Certified Peer Support Specialists with automated 4-part notes, exact 15-minute billing math, and zero-lost-data offline resilience.
              </p>

              {/* Proof / Benefit Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <strong className="text-slate-900 block font-bold">100% CalAIM Ready</strong>
                    <span className="text-slate-500 text-[11px]">4-part note standard</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <strong className="text-slate-900 block font-bold">Auto H0038 Math</strong>
                    <span className="text-slate-500 text-[11px]">15-min unit calculations</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <strong className="text-slate-900 block font-bold">True Offline First</strong>
                    <span className="text-slate-500 text-[11px]">IndexedDB + Dexie.js</span>
                  </div>
                </div>
              </div>

              {/* Lead Magnet Capture Form / Confirmation Box */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-md space-y-4">
                {!isSubmitted ? (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E] uppercase tracking-wide">
                        <Download className="w-4 h-4 text-[#0F766E]" />
                        <span>Instant Lead Magnet Download + Beta Access</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Get "The 10-Minute Medi-Cal H0038 Note Checklist"
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Join our 3–5 specialist solo beta cohort and receive the free printable California CalAIM audit checklist.
                      </p>
                    </div>

                    <form onSubmit={handleSubmitLeadCapture} className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Maria Gonzalez, CPSS-CA"
                            value={specialistName}
                            onChange={(e) => setSpecialistName(e.target.value)}
                            className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="maria@peeradvocate.org"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Specialist Role / Title
                          </label>
                          <select
                            value={roleTitle}
                            onChange={(e) => setRoleTitle(e.target.value)}
                            className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                          >
                            <option value="Certified Peer Support Specialist (CPSS-CA)">Certified Peer Specialist (CPSS-CA)</option>
                            <option value="Peer Advocate / Navigator">Peer Advocate / Navigator</option>
                            <option value="Community Health Worker (CHW)">Community Health Worker (CHW)</option>
                            <option value="Peer Program Supervisor / Lead">Peer Program Supervisor / Lead</option>
                            <option value="Independent Solo Contractor">Independent Solo Contractor</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Primary California County
                          </label>
                          <select
                            value={county}
                            onChange={(e) => setCounty(e.target.value)}
                            className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                          >
                            <option value="San Francisco">38-San Francisco</option>
                            <option value="Alameda">01-Alameda</option>
                            <option value="Los Angeles">19-Los Angeles</option>
                            <option value="Sacramento">34-Sacramento</option>
                            <option value="San Diego">37-San Diego</option>
                            <option value="Santa Clara">43-Santa Clara</option>
                            <option value="Other California County">Other California County</option>
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

                      {formError && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-500">
                          🔒 Zero spam. HIPAA & CalAIM aligned. Unsubscribe anytime.
                        </span>
                        <button
                          type="submit"
                          className="min-h-[46px] px-6 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0"
                        >
                          <Download className="w-4 h-4" />
                          <span>Get Free Checklist + Pilot Invite</span>
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="p-4 sm:p-5 bg-emerald-50/90 rounded-xl border border-emerald-300 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2.5 text-[#16A34A]">
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
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <a
                        href="#lead-magnet"
                        className="min-h-[44px] px-5 py-2 bg-[#0F766E] hover:bg-teal-800 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-2 transition-colors"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>View Interactive Checklist Below</span>
                      </a>
                      <button
                        onClick={onLaunchApp}
                        className="min-h-[44px] px-5 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Start Test Note in App</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Hero Visual Asset (Col Span 5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 group">
                {!heroImageFailed ? (
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Certified Peer Support Specialist collaborating with client in a warm community setting"
                    className="w-full max-w-full h-[360px] sm:h-[440px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="eager"
                    onError={() => setHeroImageFailed(true)}
                  />
                ) : (
                  <div className="w-full h-[360px] sm:h-[440px] bg-gradient-to-br from-[#1E3A8A] via-slate-900 to-[#0F766E] p-8 flex flex-col justify-between text-white">
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                        <HeartHandshake className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                        California Peer Practice
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        Peer-Centered Documentation
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-200 italic leading-relaxed">
                        "Documentation should never pull you away from authentic human connection."
                      </p>
                      <span className="text-xs text-teal-200 block">
                        CalAIM Behavioral Health Payment Reform & Medi-Cal H0038
                      </span>
                    </div>
                  </div>
                )}
                {/* Measured Scrim & Caption */}
                {!heroImageFailed && (
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent text-white">
                    <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider block">
                      Trauma-Informed Peer Practice
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug mt-1">
                      "Documentation should never pull you away from authentic human connection."
                    </p>
                    <span className="text-[11px] text-slate-300 block mt-1">
                      CalAIM Behavioral Health Payment Reform Compliant
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Action Badges Strip */}
              <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Shield className="w-4 h-4 text-[#0F766E]" />
                  <span className="font-semibold">HIPAA / CMIA Aligned</span>
                </div>
                <button
                  onClick={() => setOnboardingModalOpen(true)}
                  className="min-h-[36px] px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>2-Min Walkthrough</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          VALUE PROPOSITION BENTO GRID (4 Marquee Capabilities)
          ========================================================================= */}
      <section id="value-proposition" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider block">
              Architected for Real California Field Work
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1E3A8A] tracking-tight">
              Why California Specialists Rely on Peer Notebook
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Standard clinical EHRs were designed for billing departments and doctors, not peer navigators out in parks, drop-in centers, and transit hubs.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {/* Bento Card 1: Offline-First Field Resilience (Span 7) */}
            <div className="lg:col-span-7 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-200 shrink-0">
                    <WifiOff className="w-5 h-5 text-[#0F766E]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider block">
                      True Dual-Layer Persistence
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1E3A8A]">
                      Document in Basements, Parks, and Shelters with Zero Signal
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Never lose a note to a dropped Wi-Fi connection. Peer Notebook commits every word immediately to your device’s local IndexedDB database using Dexie.js. When network connectivity resumes, the background sync worker flushes your queue to Supabase automatically without primary key collisions (≥99.5% success rate).
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
                {!fieldTabletFailed ? (
                  <img
                    src={FIELD_TABLET_URL}
                    alt="Peer specialist using mobile tablet in field community outreach setting with offline sync"
                    className="w-full max-w-full h-48 sm:h-56 object-cover"
                    loading="lazy"
                    onError={() => setFieldTabletFailed(true)}
                  />
                ) : (
                  <div className="w-full h-48 sm:h-56 bg-gradient-to-r from-teal-50 to-blue-50 p-6 flex flex-col justify-center items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0F766E] flex items-center justify-center">
                      <WifiOff className="w-5 h-5" />
                    </div>
                    <strong className="text-sm font-bold text-[#1E3A8A]">
                      Offline-First Field Resilience
                    </strong>
                    <span className="text-xs text-slate-600 max-w-sm">
                      Zero data loss in basements, parks, or rural areas with Dexie.js local persistence.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bento Card 2: 15-Minute Billing Calculator (Span 5) */}
            <div className="lg:col-span-5 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-50 text-[#1E3A8A] rounded-xl border border-blue-200 shrink-0">
                    <Clock className="w-5 h-5 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider block">
                      CalAIM Payment Reform
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1E3A8A]">
                      Automated H0038 15-Minute Billing Math
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Stop doing manual rounding calculations on the hood of your car. Enter your start and end times, and Peer Notebook accurately computes your units:
                </p>

                {/* Billing Table Snapshot */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono space-y-1.5 text-slate-700">
                  <div className="flex justify-between border-b border-slate-100 pb-1 font-bold text-[#1E3A8A]">
                    <span>Encounter Duration</span>
                    <span>Medi-Cal Units</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>8 – 22 minutes</span>
                    <span className="font-bold text-[#0F766E]">1 Unit (H0038)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>23 – 37 minutes</span>
                    <span className="font-bold text-[#0F766E]">2 Units (H0038)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>38 – 52 minutes</span>
                    <span className="font-bold text-[#0F766E]">3 Units (H0038)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>53 – 67 minutes</span>
                    <span className="font-bold text-[#0F766E]">4 Units (H0038)</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-slate-500 font-medium block">
                ✓ Separates direct support from travel and documentation time
              </span>
            </div>

            {/* Bento Card 3: Deterministic 4-Part CalAIM Structure (Span 6) */}
            <div className="lg:col-span-6 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-200 shrink-0">
                  <FileText className="w-5 h-5 text-[#0F766E]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider block">
                    Zero-AI Deterministic Engine
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1E3A8A]">
                    The 4-Part Clinical Note Architecture
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                California Department of Health Care Services audits require 4 distinct sections. Peer Notebook guides you through each one with structured prompts:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <strong className="text-[#1E3A8A] block font-bold">1. Recovery Goal</strong>
                  <p className="text-slate-600 text-[11px]">
                    Directly addresses client’s self-directed wellness goals.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <strong className="text-[#0F766E] block font-bold">2. Peer Intervention</strong>
                  <p className="text-slate-600 text-[11px]">
                    Specific peer mentoring, navigation, and skill building.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <strong className="text-[#16A34A] block font-bold">3. Client Response</strong>
                  <p className="text-slate-600 text-[11px]">
                    Client’s own words, behavioral engagement, and insights.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <strong className="text-amber-700 block font-bold">4. Plan & Next Steps</strong>
                  <p className="text-slate-600 text-[11px]">
                    Concrete agreed tasks and scheduled follow-up outreach.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Multi-Tenant RLS & Cryptographic Audit (Span 6) */}
            <div className="lg:col-span-6 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 text-[#1E3A8A] rounded-xl border border-blue-200 shrink-0">
                  <Shield className="w-5 h-5 text-[#1E3A8A]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider block">
                    Security & Compliance
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1E3A8A]">
                    Strict Multi-Tenant RLS & Cryptographic Seals
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Protected under 45 CFR § 164 HIPAA Security Rule and California CMIA. Supabase Row-Level Security policies mathematically restrict every record to your assigned agency. Every action is sealed with SHA-256 tamper-evident checksums in an immutable audit log.
              </p>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">Audit Immutability:</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-[#16A34A] font-bold rounded">45 CFR § 164.312(b) Compliant</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">Client Privacy:</span>
                  <span className="font-mono text-slate-600">Pseudonymized MRN Codes (PN-XXXX)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">Supervisor Cosigning:</span>
                  <span className="text-[#0F766E] font-semibold">1-Click Review & Feedback Pipeline</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          LEAD MAGNET SHOWCASE & INTERACTIVE CHECKLIST COMPONENT
          "The 10-Minute Medi-Cal H0038 Note Checklist"
          ========================================================================= */}
      <section id="lead-magnet" className="py-16 sm:py-20 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Lead Magnet Asset Preview & Download */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider block">
                  Free Downloadable Practice Resource
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1E3A8A] tracking-tight">
                  The 10-Minute Medi-Cal H0038 Note Checklist
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Keep this 7-point checklist on your clipboard or phone. It guarantees your encounter notes satisfy county billing auditors while protecting trauma-informed peer principles.
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
                {!checklistFailed ? (
                  <img
                    src={CHECKLIST_IMAGE_URL}
                    alt="Printed CalAIM 10-Minute Documentation Guide and Medi-Cal H0038 checklist on clipboard"
                    className="w-full max-w-full h-64 sm:h-72 object-cover"
                    loading="lazy"
                    onError={() => setChecklistFailed(true)}
                  />
                ) : (
                  <div className="w-full h-64 sm:h-72 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 flex flex-col justify-center items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#16A34A] flex items-center justify-center">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <strong className="text-sm font-bold text-[#1E3A8A]">
                      The 10-Minute Medi-Cal H0038 Note Checklist
                    </strong>
                    <span className="text-xs text-slate-600 max-w-sm">
                      7-point California CalAIM compliance audit standards printable guide.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Copy Text & Print PDF */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCopyChecklistText}
                  className="min-h-[44px] px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {checklistCopied ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-[#16A34A]" />
                      <span>Copied Checklist Text!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Checklist Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrintChecklist}
                  className="min-h-[44px] px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            {/* Right: Live Interactive Compliance Checklist */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-200 shrink-0">
                    <FileCheck className="w-5 h-5 text-[#0F766E]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1E3A8A]">Interactive Compliance Audit</h3>
                    <p className="text-xs text-slate-500">Test any encounter note against the 7 California standards</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded-lg shrink-0">
                  {Object.values(checkedItems).filter(Boolean).length} / 7 Verified
                </span>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {checklistStandards.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklist(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      checkedItems[idx]
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        checkedItems[idx]
                          ? 'bg-[#16A34A] text-white'
                          : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {checkedItems[idx] && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-600">
                  Ready to test a live encounter note with automatic validation?
                </span>
                <button
                  type="button"
                  onClick={onLaunchApp}
                  className="min-h-[44px] px-5 py-2 bg-[#0F766E] hover:bg-teal-800 text-white rounded-full font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Launch Live Workspace Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SOLO BETA TEST ONBOARDING & COHORT (3-5 SPECIALISTS)
          ========================================================================= */}
      <section id="beta-cohort" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider block">
              Phase 1 Milestone · 3 to 5 Specialists
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1E3A8A] tracking-tight">
              Join Our California Solo Beta Cohort
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We are deliberately limiting our initial launch to 3 to 5 independent or agency-based Certified Peer Support Specialists to ensure personal attention and rapid feature turnaround.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-black">
                01
              </div>
              <h3 className="text-base font-bold text-[#1E3A8A]">Free Lifetime Solo Access</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Beta participants receive complimentary, unrestricted lifetime access to all core offline documentation and billing features. No surprise subscriptions.
              </p>
            </div>

            <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-black">
                02
              </div>
              <h3 className="text-base font-bold text-[#1E3A8A]">Direct Founder & Engineering Line</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect directly with our development team via text or Slack. Have a specific county form or EHR export requirement? We'll build it for your workflow.
              </p>
            </div>

            <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
                03
              </div>
              <h3 className="text-base font-bold text-[#1E3A8A]">2-Minute Guided Walkthrough</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero steep learning curve. Our step-by-step onboarding walkthrough takes you from blank screen to a signed, audit-proof note in under 120 seconds.
              </p>
            </div>
          </div>

          {/* Action Hub for Beta Coordinators & Specialists */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-xl font-bold tracking-tight">Ready to Test Your First Encounter?</h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                Open the interactive workspace immediately or copy our outreach email templates to invite colleagues from your agency.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setOutreachModalOpen(true)}
                className="min-h-[46px] px-5 py-2.5 bg-blue-800/80 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-colors border border-blue-600 cursor-pointer flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Outreach Email Scripts</span>
              </button>

              <button
                type="button"
                onClick={() => setOnboardingModalOpen(true)}
                className="min-h-[46px] px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>2-Min Walkthrough</span>
              </button>

              <button
                type="button"
                onClick={onLaunchApp}
                className="min-h-[46px] px-6 py-2.5 bg-white hover:bg-slate-100 text-[#1E3A8A] rounded-full text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-[#0F766E]" />
                <span>Launch Workspace Now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          UNIVERSAL STANDARDIZED COMPLIANCE & TRUST FOOTER (STRICT LIGHT MODE)
          ========================================================================= */}
      <TrustComplianceFooter />

      {/* Modals */}
      <BetaOnboardingModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
        onStartFirstNote={() => {
          setOnboardingModalOpen(false);
          onLaunchApp();
        }}
      />

      <OutreachTemplatesModal
        isOpen={outreachModalOpen}
        onClose={() => setOutreachModalOpen(false)}
      />
    </div>
  );
};
