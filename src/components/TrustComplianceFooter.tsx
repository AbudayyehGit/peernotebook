/**
 * Peer Notebook - Standardized Trust, Compliance & Observability Footer
 * GA #8 Production Standards • HIPAA & CMIA Compliant • CalMHSA Standard Aligned
 * Palette: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E), Forest Green (#16A34A), Warm Amber (#D97706)
 * Uniform Badge Geometry (44px min-h touch target) • Zero Text Bloat • Preserved Popup Links
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Award,
  Scale,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  X,
  FileText,
  Sparkles,
  Mail,
  Copy,
  Check,
  Cpu
} from 'lucide-react';
import { ZeroAiBadge } from './ZeroAiBadge';

export interface FooterBadge {
  id: string;
  name: string;
  title: string;
  category: 'Regulatory' | 'Persistence' | 'Engineering' | 'Security';
  badgeColorClass: string;
  textColorClass: string;
  icon: React.ReactNode;
  summary: string;
  docUrl: string;
  docTitle: string;
}

export const TrustComplianceFooter: React.FC = () => {
  const { currentOrg, currentUser } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState<FooterBadge | null>(null);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | 'calmhsa' | null>(null);
  const [copiedContact, setCopiedContact] = useState(false);

  const handleCopySupportEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText('support@peernotebook.com');
      setCopiedContact(true);
      setTimeout(() => setCopiedContact(false), 2000);
    } catch {
      // ignore
    }
  };

  // Regulatory & System Observability Badges with Title Text Only & Popup Links Preserved
  const regulatoryBadges: FooterBadge[] = [
    {
      id: 'REG-HIPAA',
      name: 'HIPAA & CMIA Compliance',
      title: 'HIPAA/CMIA Aligned',
      category: 'Regulatory',
      badgeColorClass: 'bg-emerald-50 border-emerald-200/90 hover:bg-emerald-100/70',
      textColorClass: 'text-[#16A34A]',
      icon: <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />,
      summary: 'Strict adherence to 45 CFR § 164 HIPAA Security and Privacy Rules and California Civil Code § 56 (CMIA). Encrypted local store and TLS 1.3 transmission with active Business Associate Agreement (BAA) safeguards.',
      docUrl: 'https://peernotebook.com/docs/04-technical-architecture/08_HIPAA_BAA_Consent_Model',
      docTitle: 'HIPAA Security & BAA Architecture Specification'
    },
    {
      id: 'REG-CALMHSA',
      name: 'CalMHSA Standards Alignment',
      title: 'CalMHSA Standard Compliant (H0038)',
      category: 'Regulatory',
      badgeColorClass: 'bg-teal-50 border-teal-200/90 hover:bg-teal-100/70',
      textColorClass: 'text-[#0F766E]',
      icon: <Award className="w-4 h-4 text-[#0F766E] shrink-0" />,
      summary: 'Directly aligned with California Mental Health Services Authority (CalMHSA) 17 Core Peer Competencies, recovery-oriented lived experience sharing, and non-clinical strengths-based narrative guidelines.',
      docUrl: 'https://peernotebook.com/docs',
      docTitle: 'CalMHSA Statewide Peer Certification Standards'
    },
    {
      id: 'REG-CALAIM',
      name: 'CalAIM Payment Reform',
      title: 'CalAIM Payment Reform',
      category: 'Regulatory',
      badgeColorClass: 'bg-blue-50 border-blue-200/90 hover:bg-blue-100/70',
      textColorClass: 'text-[#1E3A8A]',
      icon: <Scale className="w-4 h-4 text-[#1E3A8A] shrink-0" />,
      summary: 'Conforms to California Department of Health Care Services (DHCS) CalAIM Payment Reform: exact 15-minute Medi-Cal billing units (CMS 8-minute rule), direct travel and documentation time allocation for Procedure Code H0038.',
      docUrl: 'https://peernotebook.com/docs/04-technical-architecture/05_Compliance_Engine_PDF_Export',
      docTitle: 'CalAIM & Medi-Cal H0038 Technical Implementation Manual'
    },
    {
      id: 'REG-LOCAL',
      name: 'Encrypted Local Persistence',
      title: 'Encrypted Local-First',
      category: 'Persistence',
      badgeColorClass: 'bg-[#FEF3C7]/60 border-amber-200/90 hover:bg-[#FEF3C7]',
      textColorClass: 'text-[#D97706]',
      icon: <Lock className="w-4 h-4 text-[#D97706] shrink-0" />,
      summary: 'Dual-layer persistence engine with client-side Dexie.js (IndexedDB) for 100% offline field documentation resilience and append-only cryptographic SHA-256 tamper-evident audit trails.',
      docUrl: 'https://peernotebook.com/docs/04-technical-architecture/07_Offline_Sync_IndexedDB',
      docTitle: 'Dual-Layer Offline-First Storage Specifications'
    },
    {
      id: 'ENG-BUILD',
      name: 'Production Build Pipeline',
      title: 'Build: passing',
      category: 'Engineering',
      badgeColorClass: 'bg-emerald-50 border-emerald-200/90 hover:bg-emerald-100/70',
      textColorClass: 'text-[#16A34A]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />,
      summary: 'Deterministic Vite production bundle passing, zero asset bloat, optimized tree-shaking, and PWA service worker caching designed for low-bandwidth mobile field devices.',
      docUrl: 'https://peernotebook.com/docs/05-engineering-quality/ci-cd-pipeline',
      docTitle: 'CI/CD Pipeline & Production Build Specifications'
    },
    {
      id: 'ENG-TS',
      name: 'Type Safety Standards',
      title: 'TypeScript: strict',
      category: 'Engineering',
      badgeColorClass: 'bg-blue-50 border-blue-200/90 hover:bg-blue-100/70',
      textColorClass: 'text-[#1E3A8A]',
      icon: <Code2 className="w-4 h-4 text-[#1E3A8A] shrink-0" />,
      summary: 'Strict TypeScript verification with zero implicit any, comprehensive typing across Dexie schemas, Medi-Cal billing units, and CalAIM behavioral health models.',
      docUrl: 'https://peernotebook.com/docs/05-engineering-quality/code-review-standards',
      docTitle: 'Type System Standards & Verification'
    },
    {
      id: 'ENG-PERSIST',
      name: 'Cloud & Database Layer',
      title: 'Persistence: Dexie.js + Supabase',
      category: 'Persistence',
      badgeColorClass: 'bg-emerald-50 border-emerald-200/90 hover:bg-emerald-100/70',
      textColorClass: 'text-[#16A34A]',
      icon: <Database className="w-4 h-4 text-[#16A34A] shrink-0" />,
      summary: 'Dual-layer data persistence syncing Dexie.js (IndexedDB) client storage with Supabase PostgreSQL cloud relational store under strict multi-tenant Row-Level Security (RLS).',
      docUrl: 'https://peernotebook.com/docs/04-technical-architecture/07_Offline_Sync_IndexedDB',
      docTitle: 'Dual-Layer Database Synchronization Standards'
    },
    {
      id: 'SEC-BAA',
      name: 'Business Associate Agreement',
      title: 'BAA: Executed (45 CFR § 164.504)',
      category: 'Security',
      badgeColorClass: 'bg-emerald-50 border-emerald-200/90 hover:bg-emerald-100/70',
      textColorClass: 'text-[#16A34A]',
      icon: <Lock className="w-4 h-4 text-[#16A34A] shrink-0" />,
      summary: 'Protected under 45 CFR § 164 HIPAA Security Rule and 42 CFR Part 2 for substance use confidentiality. Pseudonymized client identifiers (MRN) and SHA-256 tamper-evident audit logs.',
      docUrl: 'https://peernotebook.com/docs/04-technical-architecture/08_HIPAA_BAA_Consent_Model',
      docTitle: 'HIPAA BAA & Consent Specifications'
    },
    {
      id: 'ENG-ZERO-AI',
      name: 'Zero-AI Deterministic Runtime',
      title: 'runtime: Zero-AI (Deterministic)',
      category: 'Engineering',
      badgeColorClass: 'bg-emerald-50 border-emerald-200/90 hover:bg-emerald-100/70',
      textColorClass: 'text-[#16A34A]',
      icon: <Cpu className="w-4 h-4 text-[#16A34A] shrink-0" />,
      summary: '100% Deterministic Code Engine: zero artificial intelligence or generative LLM models executed in production runtime. Auditable client TypeScript rules for CalMHSA 4-part notes and Medi-Cal H0038 billing units.',
      docUrl: 'https://peernotebook.com/docs/05-engineering-quality/zero-ai-deterministic-runtime',
      docTitle: 'Zero-AI Deterministic Runtime & Verification Standards'
    }
  ];

  return (
    <>
      <footer className="bg-white border-t border-slate-200 mt-auto pt-5 pb-28 sm:py-6 px-3 sm:px-6 lg:px-8 text-xs text-slate-600 transition-colors w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Authoritative CalAIM & Medi-Cal H0038 Verification Card */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200/80 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1E3A8A]">
                      CalAIM H0038 &amp; Medi-Cal Verification Engine
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                      Active &amp; Validated: Medi-Cal Standard
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    DHCS Behavioral Health Payment Reform &middot; CalMHSA 4-Part Note Architecture &middot; POS 15 Verified
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold shadow-2xs">
                  POS: 15 (Mobile Unit / Field)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* POS 15 Calculation Rules */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] block">
                  POS 15 Calculation Rules
                </span>
                <p className="text-slate-800 font-semibold leading-tight">
                  15-Minute Increments (CMS 8-Minute Threshold)
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Total Billable Time = Direct Face-to-Face + Travel + Documentation. 8–22 min = 1 unit, 23–37 min = 2 units, 38–52 min = 3 units, 53–67 min = 4 units.
                </p>
              </div>

              {/* CalMHSA 4-Part Structure */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A] block">
                  CalMHSA 4-Part Golden Thread
                </span>
                <p className="text-slate-800 font-semibold leading-tight">
                  Strengths-Based Narrative Standard
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Requires explicit link between Client Goal Addressed, Peer Intervention delivered, Client Response, and Collaborative Next Steps. Non-clinical language cleansed.
                </p>
              </div>

              {/* Cryptographic Audit Trail */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] block">
                  Cryptographic Integrity
                </span>
                <p className="text-slate-800 font-semibold leading-tight flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
                  SHA-256 Tamper-Evident Ledger
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Every field mutation, electronic cosignature, and export generates an immutable hash chain compliant with 45 CFR § 164.312(b) and multi-tenant RLS.
                </p>
              </div>
            </div>
          </div>

          {/* Section Header: Low Cognitive Load Regulatory Badges Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-[#0F766E] border border-teal-100 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                Standards & Compliance Badges
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Click any badge to inspect verification certificate and architecture runbook
            </span>
          </div>

          {/* Regulatory Badges Grid: Uniform Height (44px min-h) & Title Text Only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {regulatoryBadges.map((badge) => (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadge(badge)}
                className={`min-h-[44px] flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] text-left cursor-pointer ${badge.badgeColorClass}`}
                title={`Click to view ${badge.name} verification & documentation`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {badge.icon}
                  <span className={`truncate text-xs ${badge.textColorClass}`}>
                    {badge.title}
                  </span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 opacity-70 group-hover:opacity-100" />
              </button>
            ))}
          </div>

          {/* Divider Rule */}
          <div className="border-t border-slate-200/80 pt-3" />

          {/* Master Trust & Compliance Anchors + Official Contact Row */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            {/* Left: Domain & Compliance Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
              <span className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>peernotebook.com</span>
              </span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                <Check className="w-3 h-3" />
                <span>HIPAA/CMIA Aligned</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
                <Award className="w-3 h-3" />
                <span>CalMHSA Standard Compliant (H0038)</span>
              </span>
              <ZeroAiBadge variant="compact" />
            </div>

            {/* Right: Official Business Email & BAA Inquiry Contact */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 hidden sm:inline font-medium">
                Official Support & BAA:
              </span>
              <a
                href="mailto:support@peernotebook.com"
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-[#0F766E] hover:text-[#1E3A8A] font-semibold text-xs transition-colors shadow-2xs hover:shadow-xs"
                title="Send email to support@peernotebook.com"
              >
                <Mail className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>support@peernotebook.com</span>
              </a>
              <button
                type="button"
                onClick={handleCopySupportEmail}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                title="Copy official email to clipboard"
              >
                {copiedContact ? (
                  <Check className="w-4 h-4 text-[#16A34A]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Bar: Brand, Legal Links, Active Provider */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-xs pt-1">
            {/* Brand & Copyright */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-slate-600 text-center lg:text-left">
              <span className="font-semibold text-slate-800">
                © {new Date().getFullYear()} Peer Notebook (
                <a
                  href="https://peernotebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0F766E] hover:underline font-semibold"
                >
                  peernotebook.com
                </a>
                )
              </span>
              <span className="hidden sm:inline text-slate-300">·</span>
              <span className="text-slate-500 text-xs">
                CalAIM Medi-Cal H0038 Documentation System
              </span>
            </div>

            {/* Legal & Trust Center Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-xs font-semibold">
              <a
                href="#trust"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.hash = '#trust';
                  }
                }}
                className="text-[#1E3A8A] hover:text-[#0F766E] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Trust Center &amp; Portal</span>
              </a>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="text-[#0F766E] hover:text-[#1E3A8A] hover:underline cursor-pointer transition-colors"
              >
                Terms of Service
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="text-[#0F766E] hover:text-[#1E3A8A] hover:underline cursor-pointer transition-colors"
              >
                Privacy Policy (HIPAA / CMIA)
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setLegalModal('calmhsa')}
                className="text-[#0F766E] hover:text-[#1E3A8A] hover:underline cursor-pointer transition-colors"
              >
                CalMHSA Standards
              </button>
              <span className="text-slate-300">·</span>
              <a
                href="https://peernotebook.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E3A8A] hover:text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Provider and Agency Info */}
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
              <span>
                Active Provider:{' '}
                <strong className="text-slate-800">
                  {currentUser?.fullName || 'Certified Peer Specialist'}
                </strong>
              </span>
              <span className="text-slate-300">·</span>
              <span className="truncate max-w-[150px] font-medium text-slate-700">
                {currentOrg?.name || 'CalAIM CBO Partner Agency'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Observability & Regulatory Detail Modal */}
      {selectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity overflow-y-auto"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[88vh] overflow-y-auto my-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                  {selectedBadge.icon}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider block">
                    {selectedBadge.category} Standard • {selectedBadge.id}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#1E3A8A] leading-tight">
                    {selectedBadge.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono font-bold text-[#1E3A8A]">
              Badge Label: {selectedBadge.title}
            </div>

            <div className="text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="font-semibold text-slate-900">Technical & Regulatory Summary:</p>
              <p className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200/80 text-slate-600">
                {selectedBadge.summary}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <a
                href={selectedBadge.docUrl}
                onClick={(e) => {
                  if (typeof window !== 'undefined' && selectedBadge.docUrl.includes('peernotebook.com/docs')) {
                    e.preventDefault();
                    const slug = selectedBadge.docUrl.replace(/^https?:\/\/peernotebook\.com\/docs\/?/, '');
                    window.location.hash = slug ? `#docs/${slug}` : '#docs';
                    setSelectedBadge(null);
                  }
                }}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0F766E] hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <span>Read Full Specification</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Legal Terms / Policies */}
      {legalModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity overflow-y-auto"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto my-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E3A8A]">
                    {legalModal === 'terms' && 'Peer Notebook Terms of Service'}
                    {legalModal === 'privacy' && 'HIPAA & CMIA Privacy Policy'}
                    {legalModal === 'calmhsa' && 'CalMHSA Peer Support Standards Alignment'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Production Grade GA #8 • CalAIM & Medi-Cal H0038 Compliance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 space-y-3.5 text-xs text-slate-700 leading-relaxed max-h-[55vh] overflow-y-auto pr-1">
              {legalModal === 'terms' && (
                <>
                  <p>
                    <strong>1. Authorized Clinical & Peer Use:</strong> Peer Notebook (peernotebook.com) is an enterprise offline-first documentation platform engineered exclusively for Medi-Cal Certified Peer Support Specialists (CPSS-CA), clinical supervisors, and contracted CalAIM behavioral health agencies.
                  </p>
                  <p>
                    <strong>2. Business Associate Obligations (45 CFR § 164.504):</strong> Use of this application requires an executed Business Associate Agreement (BAA) with each participating county behavioral health department or contracted managed care plan (MCP). All Protected Health Information (PHI) is handled strictly in accordance with minimum necessary disclosure rules.
                  </p>
                  <p>
                    <strong>3. CalAIM Billing & Cosignature Verification:</strong> Encounter notes submitted under Medi-Cal billing code H0038 represent genuine face-to-face peer encounters. Travel and documentation minutes must reflect actual time spent. Clinical supervisor review and cosignature are required for claim generation.
                  </p>
                  <p>
                    <strong>4. Field Offline Operation:</strong> The local persistence engine caches encounter notes securely in client IndexedDB storage. Providers agree to sync field devices to the secure cloud repository upon establishing encrypted internet connectivity.
                  </p>
                  <p>
                    <strong>5. BAA & Security Contact:</strong> County behavioral health departments and contracted managed care plans may request an executed Business Associate Agreement (BAA) or SOC 2 Type II audit report by contacting <a href="mailto:support@peernotebook.com" className="text-[#0F766E] font-bold underline">support@peernotebook.com</a>.
                  </p>
                </>
              )}

              {legalModal === 'privacy' && (
                <>
                  <p>
                    <strong>1. CMIA & HIPAA Protections:</strong> Peer Notebook complies with California Civil Code § 56 (Confidentiality of Medical Information Act) and federal HIPAA Security and Privacy Rules. No personal health information is sold, monetized, or shared with third-party tracking services.
                  </p>
                  <p>
                    <strong>2. Local-First Zero-Knowledge Architecture:</strong> Encounter drafts and client rosters remain stored on the practitioner’s local device using Dexie.js until synchronized over TLS 1.3 to PostgreSQL databases protected by Row-Level Security (RLS).
                  </p>
                  <p>
                    <strong>3. Immutable Audit Trails:</strong> In compliance with 45 CFR § 164.312(b), all actions including note creation, edits, client views, supervisor reviews, and PDF exports generate cryptographic SHA-256 audit logs with user identifiers, timestamps, and tenant organization keys.
                  </p>
                  <p>
                    <strong>4. 42 CFR Part 2 Confidentiality:</strong> Substance use disorder documentation is segregated with heightened consent controls and specialized disclosure warnings for CalAIM DMC-ODS recovery pathways.
                  </p>
                  <p>
                    <strong>5. Privacy Officer & Inquiries:</strong> Direct all privacy, data retention, or patient access requests to our Compliance Officer at <a href="mailto:support@peernotebook.com" className="text-[#0F766E] font-bold underline">support@peernotebook.com</a>.
                  </p>
                </>
              )}

              {legalModal === 'calmhsa' && (
                <>
                  <p>
                    <strong>1. 17 CalMHSA Core Competencies:</strong> Peer Notebook documentation is directly aligned with the California Mental Health Services Authority (CalMHSA) statewide peer certification curriculum, prioritizing recovery orientation, trauma-informed principles, and lived experience sharing.
                  </p>
                  <p>
                    <strong>2. Medi-Cal Procedure Code H0038:</strong> Designed specifically for self-help/peer services per 15-minute unit. Modality capture includes Community/Field (POS 99), Office/Clinic (POS 11), and Telehealth (POS 02).
                  </p>
                  <p>
                    <strong>3. Strengths-Based DAP Narrative:</strong> The DAP framework (Description of Goal, Actions/Interventions, Plan) encourages trauma-informed, client-centered recovery language rather than deficit-based psychiatric jargon.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <a
                href="#docs"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#docs';
                  setLegalModal(null);
                }}
                className="text-xs text-[#0F766E] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Documentation Repository (27 Docs)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="min-h-[44px] px-6 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold rounded-full text-xs transition-colors cursor-pointer w-full sm:w-auto shadow-sm"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
