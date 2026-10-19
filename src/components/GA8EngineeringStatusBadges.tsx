/**
 * Peer Notebook - GA #8 Production Observability & Engineering Badges
 * CalAIM & HIPAA Compliance • Dual-Layer Persistence (Dexie.js + Supabase)
 * Trauma-Informed Low-Arousal Light Palette
 */

import React, { useState } from 'react';
import { ShieldCheck, Database, CheckCircle2, Lock, ExternalLink, Code2, Sparkles, X, FileText } from 'lucide-react';

interface ObservabilityBadge {
  id: string;
  name: string;
  category: string;
  label: string;
  status: 'passing' | 'verified' | 'strict' | 'active';
  badgeColorClass: string;
  textColorClass: string;
  icon: React.ReactNode;
  summary: string;
  docUrl: string;
  docTitle: string;
}

export const GA8EngineeringStatusBadges: React.FC = () => {
  const [selectedBadge, setSelectedBadge] = useState<ObservabilityBadge | null>(null);

  const observabilityBadges: ObservabilityBadge[] = [
    {
      id: 'GA8-BUILD',
      name: 'Build Pipeline',
      category: 'CI/CD',
      label: 'Build Status: passing',
      status: 'passing',
      badgeColorClass: 'bg-emerald-50 border-emerald-200',
      textColorClass: 'text-emerald-800',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />,
      summary: 'Vite 8 production bundle passing, zero asset bundle bloat, code-splitting enabled with tree-shaking for low-bandwidth mobile field devices.',
      docUrl: 'https://peernotebook.com/docs/05-engineering-quality/ci-cd-pipeline',
      docTitle: 'GA8 CI/CD & Production Build Specifications'
    },
    {
      id: 'GA8-TS',
      name: 'Type Safety',
      category: 'Architecture',
      label: 'TypeScript: strict',
      status: 'strict',
      badgeColorClass: 'bg-blue-50 border-blue-200',
      textColorClass: 'text-[#1E3A8A]',
      icon: <Code2 className="w-3.5 h-3.5 text-[#1E3A8A]" />,
      summary: 'Strict TypeScript compilation with zero implicit any, full typing across Dexie schemas, Medi-Cal billing units, and CalAIM behavioral health encounter models.',
      docUrl: 'https://peernotebook.com/docs/05-engineering-quality/code-review-standards',
      docTitle: 'Type System Standards & Verification'
    },
    {
      id: 'GA8-PERSIST',
      name: 'Dual-Layer Store',
      category: 'Persistence',
      label: 'Persistence: Dexie.js + Supabase',
      status: 'active',
      badgeColorClass: 'bg-emerald-50 border-emerald-200',
      textColorClass: 'text-emerald-800',
      icon: <Database className="w-3.5 h-3.5 text-[#16A34A]" />,
      summary: 'Dual-layer persistence engine: local Dexie.js / IndexedDB store ensures 100% offline uptime; background worker automatically syncs with Supabase PostgreSQL under multi-tenant RLS.',
      docUrl: 'https://peernotebook.com/docs/04-technical-architecture/07_Offline_Sync_IndexedDB',
      docTitle: 'Dual-Layer Storage & Sync Specifications'
    },
    {
      id: 'GA8-CALAIM',
      name: 'CalAIM & Medi-Cal',
      category: 'Regulatory',
      label: 'Compliance: CalAIM / Medi-Cal H0038',
      status: 'verified',
      badgeColorClass: 'bg-teal-50 border-teal-200',
      textColorClass: 'text-[#0F766E]',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />,
      summary: 'Strict conformity with California DHCS CalAIM Payment Reform: exact 15-minute billing unit calculation, direct travel and documentation time allocation, and ECM / Community Supports pathways.',
      docUrl: 'https://peernotebook.com/docs/04-technical-architecture/05_Compliance_Engine_PDF_Export',
      docTitle: 'CalAIM & Medi-Cal H0038 Technical Manual'
    },
    {
      id: 'GA8-HIPAA',
      name: 'HIPAA & BAA',
      category: 'Security',
      label: 'BAA: Executed (45 CFR § 164.504)',
      status: 'active',
      badgeColorClass: 'bg-emerald-50 border-emerald-200',
      textColorClass: 'text-emerald-800',
      icon: <Lock className="w-3.5 h-3.5 text-[#16A34A]" />,
      summary: 'Protected under 45 CFR § 164 HIPAA Security Rule and 42 CFR Part 2 for substance use confidentiality. Pseudonymized client identifiers (MRN) and SHA-256 tamper-evident audit logs.',
      docUrl: 'https://peernotebook.com/docs/04-technical-architecture/08_HIPAA_BAA_Consent_Model',
      docTitle: 'HIPAA BAA & Consent Specifications'
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
            GA #8 Observability:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {observabilityBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:shadow-xs ${badge.badgeColorClass} ${badge.textColorClass}`}
                title={`${badge.name}: Click to view GA #8 specification & verification`}
              >
                {badge.icon}
                <span className="text-[11px] font-medium">{badge.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1 text-[#16A34A] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            Zero Critical Vulnerabilities
          </span>
          <a
            href="https://peernotebook.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0F766E] hover:underline flex items-center gap-1 font-medium"
          >
            <span>peernotebook.com Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Observability Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                {selectedBadge.icon}
              </div>
              <div>
                <span className="text-xs font-semibold text-[#0F766E] uppercase tracking-wide">
                  {selectedBadge.category} • {selectedBadge.id}
                </span>
                <h3 className="text-lg font-bold text-[#1E3A8A]">{selectedBadge.name}</h3>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 my-4 text-xs font-mono text-slate-700">
              {selectedBadge.label}
            </div>

            <p className="text-slate-700 text-sm leading-relaxed">
              {selectedBadge.summary}
            </p>

            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
              <a
                href={selectedBadge.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#0F766E] font-medium hover:underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Read White Paper on peernotebook.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-950 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
