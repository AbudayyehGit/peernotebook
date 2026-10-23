/**
 * Peer Notebook - Zero-AI Runtime Badge Component
 * GA Production Standard • 100% Deterministic Code Engine
 * Visual: Deep Navy (#1E3A8A), Muted Teal (#0F766E), Forest Green (#16A34A)
 * Compliant with Medi-Cal H0038 & HIPAA 45 CFR § 164 Integrity Standards
 */

import React, { useState } from 'react';
import { ShieldCheck, Cpu, CheckCircle2, Lock, X, ExternalLink, Code2, AlertCircle } from 'lucide-react';

export interface ZeroAiBadgeProps {
  variant?: 'header' | 'footer' | 'pill' | 'card' | 'compact';
  className?: string;
}

export const ZeroAiBadge: React.FC<ZeroAiBadgeProps> = ({
  variant = 'pill',
  className = ''
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`min-h-[36px] px-2.5 sm:px-3 py-1 rounded-full bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${className}`}
          title="Verified Zero-AI Runtime Engine: 100% Deterministic Client Logic (Click to Inspect)"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
          </span>
          <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono font-bold tracking-tight">Zero-AI (Deterministic)</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`min-h-[32px] px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] border border-emerald-200 text-[10px] font-bold font-mono inline-flex items-center gap-1 transition-colors cursor-pointer ${className}`}
          title="runtime: Zero-AI (Deterministic)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
          <span>runtime: Zero-AI</span>
        </button>
      )}

      {variant === 'pill' && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`min-h-[44px] px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/90 text-[#16A34A] text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center justify-between gap-2 cursor-pointer ${className}`}
          title="Click to view Zero-AI verification & clinical determinism documentation"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span className="truncate">runtime: Zero-AI (Deterministic)</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
        </button>
      )}

      {variant === 'footer' && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`min-h-[44px] flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] text-left cursor-pointer bg-emerald-50 border-emerald-200/90 hover:bg-emerald-100/70 text-[#16A34A] ${className}`}
          title="Click to inspect Zero-AI Deterministic Runtime Guarantee"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Cpu className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span className="truncate text-xs">
              runtime: Zero-AI (Deterministic)
            </span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 opacity-70 group-hover:opacity-100" />
        </button>
      )}

      {variant === 'card' && (
        <div
          onClick={() => setModalOpen(true)}
          className={`p-4 bg-white border border-emerald-200 rounded-2xl shadow-sm hover:border-emerald-300 transition-all cursor-pointer space-y-2 ${className}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-[#16A34A] rounded-xl border border-emerald-200">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1E3A8A] block">Zero-AI Runtime Engine</span>
                <span className="text-[10px] font-mono font-bold text-[#16A34A]">100% Deterministic Code</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              AUDIT READY
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Zero LLMs or generative models in the execution path. All notes and H0038 billing calculations execute via deterministic TypeScript logic.
          </p>
        </div>
      )}

      {/* Zero-AI Deterministic Architecture Verification Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-7 relative space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3.5 pr-8">
              <div className="p-3 bg-emerald-50 text-[#16A34A] rounded-2xl border border-emerald-200 shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                    100% DETERMINISTIC
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#1E3A8A] font-mono text-[10px] font-bold">
                    ZERO RUNTIME AI
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#1E3A8A] mt-1 tracking-tight">
                  Zero-AI Runtime Architecture
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Peer Notebook Operational Constraint & Audit Guarantee
                </p>
              </div>
            </div>

            {/* Core Verification Pillars */}
            <div className="space-y-3 pt-1 text-xs text-slate-700 leading-relaxed">
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200/90 space-y-1">
                <strong className="text-slate-900 font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  Deterministic Code Execution
                </strong>
                <p className="text-[11px] text-slate-600 pl-5">
                  Every 4-part Medi-Cal note validation, 15-minute billing unit calculation (CMS 8-minute rule for HCPCS H0038 / POS 15), and vocabulary substitution runs through transparent, auditable client-side TypeScript functions.
                </p>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200/90 space-y-1">
                <strong className="text-slate-900 font-bold flex items-center gap-1.5 text-xs">
                  <Lock className="w-4 h-4 text-[#0F766E] shrink-0" />
                  Zero PHI Leakage to Third-Party AI APIs
                </strong>
                <p className="text-[11px] text-slate-600 pl-5">
                  Unlike EHR tools that stream patient records to external cloud LLM providers, Peer Notebook never transmits protected health information (PHI) to artificial intelligence inference endpoints.
                </p>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200/90 space-y-1">
                <strong className="text-slate-900 font-bold flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                  Zero Hallucination Clinical Liability
                </strong>
                <p className="text-[11px] text-slate-600 pl-5">
                  By eliminating generative models from runtime documentation, specialists avoid AI confabulation and compliance disallowances during county and Medi-Cal audits.
                </p>
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                peernotebook.com • Verified GA Standard
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-[44px] px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
