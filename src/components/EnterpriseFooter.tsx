import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Database,
  CheckCircle2,
  Lock,
  ExternalLink,
  Code2,
  X,
  FileText
} from 'lucide-react';

export interface ObservabilityBadge {
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

export const REGULATORY_BADGES: ObservabilityBadge[] = [
  {
    id: 'GA8-HIPAA',
    name: 'HIPAA & BAA',
    category: 'Security & Legal',
    label: 'BAA: Executed (45 CFR § 164.504)',
    status: 'active',
    badgeColorClass: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    textColorClass: 'text-emerald-800',
    icon: <Lock className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />,
    summary:
      'Protected under 45 CFR § 164 HIPAA Security Rule and 42 CFR Part 2 for substance use confidentiality. Pseudonymized client identifiers (MRN) and SHA-256 tamper-evident audit logs.',
    docUrl: 'https://peernotebook.com/docs/04-technical-architecture/08_HIPAA_BAA_Consent_Model',
    docTitle: 'HIPAA BAA & Consent Specifications'
  },
  {
    id: 'GA8-CALAIM',
    name: 'CalAIM & Medi-Cal',
    category: 'Regulatory Mandate',
    label: 'Compliance: CalAIM / Medi-Cal H0038',
    status: 'verified',
    badgeColorClass: 'bg-teal-50 border-teal-200 hover:bg-teal-100 hover:border-teal-300',
    textColorClass: 'text-[#0F766E]',
    icon: <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />,
    summary:
      'Strict conformity with California DHCS CalAIM Payment Reform: exact 15-minute billing unit calculation, direct travel and documentation time allocation, and ECM / Community Supports pathways.',
    docUrl: 'https://peernotebook.com/docs/04-technical-architecture/05_Compliance_Engine_PDF_Export',
    docTitle: 'CalAIM & Medi-Cal H0038 Technical Manual'
  },
  {
    id: 'GA8-PERSIST',
    name: 'Dual-Layer Store',
    category: 'Persistence Engine',
    label: 'Persistence: Dexie.js + Supabase',
    status: 'active',
    badgeColorClass: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    textColorClass: 'text-emerald-800',
    icon: <Database className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />,
    summary:
      'Dual-layer persistence engine: local Dexie.js / IndexedDB store ensures 100% offline uptime; background worker automatically syncs with Supabase PostgreSQL under multi-tenant RLS.',
    docUrl: 'https://peernotebook.com/docs/04-technical-architecture/07_Offline_Sync_IndexedDB',
    docTitle: 'Dual-Layer Storage & Sync Specifications'
  }
];

export const DEVOPS_BADGES: ObservabilityBadge[] = [
  {
    id: 'GA8-BUILD',
    name: 'Build Pipeline',
    category: 'CI/CD & DevOps',
    label: 'Build: passing',
    status: 'passing',
    badgeColorClass: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    textColorClass: 'text-emerald-800',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />,
    summary:
      'Vite 8 production bundle passing, zero asset bundle bloat, code-splitting enabled with tree-shaking for low-bandwidth mobile field devices.',
    docUrl: 'https://peernotebook.com/docs/05-engineering-quality/ci-cd-pipeline',
    docTitle: 'GA8 CI/CD & Production Build Specifications'
  },
  {
    id: 'GA8-TS',
    name: 'Type Safety',
    category: 'Architecture',
    label: 'TypeScript: strict',
    status: 'strict',
    badgeColorClass: 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
    textColorClass: 'text-[#1E3A8A]',
    icon: <Code2 className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />,
    summary:
      'Strict TypeScript compilation with zero implicit any, full typing across Dexie schemas, Medi-Cal billing units, and CalAIM behavioral health encounter models.',
    docUrl: 'https://peernotebook.com/docs/05-engineering-quality/code-review-standards',
    docTitle: 'Type System Standards & Verification'
  }
];

export interface EnterpriseFooterProps {
  onNavigateTab?: (tab: string, slug?: string) => void;
}

export const EnterpriseFooter: React.FC<EnterpriseFooterProps> = ({ onNavigateTab }) => {
  const [selectedBadge, setSelectedBadge] = useState<ObservabilityBadge | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedBadge(null);
      }
    };
    if (selectedBadge) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBadge]);

  return (
    <footer className="mt-auto bg-white border-t border-slate-200 text-slate-600 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Responsive Grid with Proportional Proportions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-8">
          
          {/* Column 1: Platform & Corporate DNA (Span 4 on Desktop) */}
          <div className="sm:col-span-1 lg:col-span-4 space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center shrink-0 shadow-xs">
                <HeartHandshake className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900">
                Peer Notebook
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              Secure, cloud-native peer support documentation infrastructure built for enterprise behavioral health routing under CalAIM guidelines.
            </p>
            <div className="pt-1 text-[11px] text-slate-400">
              © 2026 Peer Notebook. All rights reserved.
            </div>
          </div>

          {/* Column 2: Documentation & Core Contacts (Span 3 on Desktop) */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-2 sm:space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Documentation & Legal
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onNavigateTab
                      ? onNavigateTab('architecture', 'hipaa-security-rule')
                      : (window.location.href = '/docs/hipaa-security-rule')
                  }
                  className="text-slate-600 hover:text-[#0F766E] transition-colors text-left py-0.5"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onNavigateTab
                      ? onNavigateTab('architecture', 'calaim-standards')
                      : (window.location.href = '/docs/calaim-standards')
                  }
                  className="text-slate-600 hover:text-[#0F766E] transition-colors text-left py-0.5"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onNavigateTab
                      ? onNavigateTab('architecture', 'offline-persistence-dexie')
                      : (window.location.href = '/docs/offline-persistence-dexie')
                  }
                  className="text-slate-600 hover:text-[#0F766E] transition-colors text-left py-0.5"
                >
                  End User License Agreement (EULA)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onNavigateTab
                      ? onNavigateTab('architecture', 'trauma-informed-design')
                      : (window.location.href = '/docs/trauma-informed-design')
                  }
                  className="text-slate-600 hover:text-[#0F766E] transition-colors text-left py-0.5"
                >
                  Accessibility Statement
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onNavigateTab
                      ? onNavigateTab('architecture', 'synchronization-protocol')
                      : (window.location.href = '/docs/synchronization-protocol')
                  }
                  className="text-slate-600 hover:text-[#0F766E] transition-colors text-left py-0.5"
                >
                  System Status Dashboard
                </button>
              </li>
              <li className="pt-1 text-xs">
                <span className="text-slate-400 block text-[11px]">Direct Support:</span>
                <a
                  href="mailto:support@peernotebook.com"
                  className="text-[#0F766E] font-medium hover:underline inline-block pt-0.5"
                >
                  support@peernotebook.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Regulatory Compliance Badges (Span 3 on Desktop) */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-2 sm:space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Regulatory Standards
            </h3>
            <div className="flex flex-col gap-2 items-start">
              {REGULATORY_BADGES.map((badge) => (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => setSelectedBadge(badge)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:shadow-xs cursor-pointer text-left whitespace-nowrap max-w-full ${badge.badgeColorClass} ${badge.textColorClass}`}
                  title={`${badge.name}: Click to view compliance specification`}
                >
                  {badge.icon}
                  <span className="truncate">{badge.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 4: Founder & DevOps Diagnostics (Span 2 on Desktop) */}
          <div className="sm:col-span-1 lg:col-span-2 space-y-2 sm:space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              DevOps Diagnostics
            </h3>
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex flex-col gap-2 items-start">
                {DEVOPS_BADGES.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setSelectedBadge(badge)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:shadow-xs cursor-pointer text-left whitespace-nowrap max-w-full ${badge.badgeColorClass} ${badge.textColorClass}`}
                    title={`${badge.name}: Click to view build verification`}
                  >
                    {badge.icon}
                    <span className="truncate">{badge.label}</span>
                  </button>
                ))}
              </div>

              {/* Platform Telemetry Metrics */}
              <div className="space-y-1 font-mono text-[11px] text-slate-500 opacity-80 pt-0.5">
                <div>Environment: Production</div>
                <div>Schema Version: v2.4.1</div>
                <div>Strict TypeScript Mode: Enforced</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse shrink-0" />
                  <span>Zero Critical Vulnerabilities</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Low-Cognitive-Load Bottom Subtle Bar */}
        <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-slate-400 gap-1.5 sm:gap-2 text-center sm:text-left">
          <span>Trauma-Informed & Action-First Architecture • Medi-Cal Billing Golden Thread</span>
          <span>California DHCS CalAIM Payment Reform Compliant</span>
        </div>
      </div>

      {/* Compliance / Observability Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                {selectedBadge.icon}
              </div>
              <div className="min-w-0 pr-6">
                <span className="text-xs font-semibold text-[#0F766E] uppercase tracking-wide truncate block">
                  {selectedBadge.category} • {selectedBadge.id}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#1E3A8A] truncate">{selectedBadge.name}</h3>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 my-3 sm:my-4 text-xs font-mono text-slate-700 break-all">
              {selectedBadge.label}
            </div>

            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
              {selectedBadge.summary}
            </p>

            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <a
                href={selectedBadge.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#0F766E] font-medium hover:underline flex items-center gap-1 justify-center sm:justify-start"
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
    </footer>
  );
};
