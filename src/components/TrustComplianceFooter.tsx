/**
 * Peer Notebook - Professional Trust & Compliance Footer
 * GA #8 Production Standards • HIPAA & CMIA Compliant • CalMHSA Standard Aligned
 * Palette: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E), Forest Green (#16A34A)
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Award, FileText, CheckCircle2, ExternalLink, X, Scale } from 'lucide-react';

export const TrustComplianceFooter: React.FC = () => {
  const { currentOrg, currentUser } = useAuth();
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'calmhsa' | null>(null);

  return (
    <>
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-600 transition-colors">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Top Row: Trust & Compliance Badges Bar with rounded-2xl geometry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pb-5 border-b border-slate-100">
            {/* Badge 1: HIPAA & CMIA Compliant */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
              <div className="p-2 bg-emerald-50 text-[#16A34A] rounded-xl border border-emerald-200 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[#1E3A8A] text-xs flex items-center gap-1.5">
                  <span>HIPAA & CMIA Compliant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  45 CFR § 164 & Cal. Civ. Code § 56. Business Associate Agreement (BAA) active.
                </p>
              </div>
            </div>

            {/* Badge 2: CalMHSA Standard Aligned */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
              <div className="p-2 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-200 shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[#1E3A8A] text-xs flex items-center gap-1.5">
                  <span>CalMHSA Standard Aligned</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  California Mental Health Services Authority Core Peer Competencies & Code H0038.
                </p>
              </div>
            </div>

            {/* Badge 3: CalAIM Payment Reform */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
              <div className="p-2 bg-blue-50 text-[#1E3A8A] rounded-xl border border-blue-200 shrink-0 mt-0.5">
                <Scale className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[#1E3A8A] text-xs flex items-center gap-1.5">
                  <span>CalAIM Payment Reform</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Exact 15-minute billing increments, travel & documentation time tracking.
                </p>
              </div>
            </div>

            {/* Badge 4: Encrypted Local Store with Warm Orange Complement */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FEF3C7]/40 border border-amber-200/80 shadow-[0_2px_8px_rgba(217,119,6,0.04)]">
              <div className="p-2 bg-[#FEF3C7] text-[#D97706] rounded-xl border border-amber-200 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[#1E3A8A] text-xs flex items-center gap-1.5">
                  <span>Encrypted Local-First</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Field offline resiliency with Dexie.js and immutable SHA-256 audit trails.
                </p>
              </div>
            </div>
          </div>

          {/* Middle Row: Legal Links, Provider & Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs">
              <span className="font-medium text-slate-700">
                © {new Date().getFullYear()} Peer Notebook (<a href="https://peernotebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#0F766E] transition-colors underline font-medium">peernotebook.com</a>). All rights reserved.
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                className="text-[#0F766E] hover:text-[#1E3A8A] hover:underline font-semibold cursor-pointer transition-colors"
              >
                Terms of Service
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="text-[#0F766E] hover:text-[#1E3A8A] hover:underline font-semibold cursor-pointer transition-colors"
              >
                Privacy Policy (HIPAA / CMIA)
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setActiveModal('calmhsa')}
                className="text-[#0F766E] hover:text-[#1E3A8A] hover:underline font-semibold cursor-pointer transition-colors"
              >
                CalMHSA Standards
              </button>
            </div>

            {/* Provider and Agency Info */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
              <span>
                Active Provider: <strong className="text-slate-800">{currentUser?.fullName || 'Alex Rivera, CPSS-CA'}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="truncate max-w-[150px]">{currentOrg?.name || 'Alameda Health System'}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Dialog for Legal Terms / Policies */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E3A8A]">
                    {activeModal === 'terms' && 'Peer Notebook Terms of Service'}
                    {activeModal === 'privacy' && 'HIPAA & CMIA Privacy Policy'}
                    {activeModal === 'calmhsa' && 'CalMHSA Peer Support Standards Alignment'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Production Grade GA #8 • CalAIM & Medi-Cal H0038 Compliance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-700 leading-relaxed">
              {activeModal === 'terms' && (
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
                </>
              )}

              {activeModal === 'privacy' && (
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
                </>
              )}

              {activeModal === 'calmhsa' && (
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

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold rounded-lg text-xs transition-colors"
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
