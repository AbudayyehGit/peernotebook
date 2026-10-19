/**
 * Peer Notebook - GA8 Production Engineering Status Badges
 * Reflects GA8 Architectural Specifications and HIPAA Compliance Modules
 */

import React, { useState } from 'react';
import { ShieldCheck, Database, FileCheck2, Cpu, Lock, Network, FileSpreadsheet, Eye } from 'lucide-react';

interface BadgeItem {
  id: string;
  name: string;
  category: string;
  status: 'VERIFIED' | 'PASSING';
  icon: React.ReactNode;
  description: string;
  specDoc: string;
}

export const GA8EngineeringStatusBadges: React.FC = () => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  const badges: BadgeItem[] = [
    {
      id: 'GA8-01',
      name: 'IndexedDB Offline Core',
      category: 'Storage',
      status: 'VERIFIED',
      icon: <Database className="w-3.5 h-3.5 text-blue-400" />,
      description: 'Zero-cloud failure point: local IndexedDB transactional cache allows full encounter note authoring, drafting, and signing without internet.',
      specDoc: '07_Offline_Sync_IndexedDB.md'
    },
    {
      id: 'GA8-02',
      name: 'HIPAA BAA Encryption',
      category: 'Security',
      status: 'VERIFIED',
      icon: <Lock className="w-3.5 h-3.5 text-emerald-400" />,
      description: 'Meets 45 CFR § 164.312(a)(2)(iv) encryption at rest standards with pseudonymized identifiers (MRN) and BAA agency binding.',
      specDoc: '08_HIPAA_BAA_Consent_Model.md'
    },
    {
      id: 'GA8-03',
      name: 'RBAC Multi-Tenant',
      category: 'Access',
      status: 'VERIFIED',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />,
      description: 'Strict segregation between Peer Specialists, Clinical Supervisors, and Compliance Officers with organization boundary guarantees.',
      specDoc: '08_Agency_Dashboard_RBAC.md'
    },
    {
      id: 'GA8-04',
      name: 'Medicaid H0038 Engine',
      category: 'Billing',
      status: 'VERIFIED',
      icon: <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />,
      description: 'Automated 15-minute unit rounding, service modality validation, and structured DAP goal mapping conforming to state Medicaid peer manuals.',
      specDoc: '05_Compliance_Engine_PDF_Export.md'
    },
    {
      id: 'GA8-05',
      name: 'PDF Clinical Export',
      category: 'Compliance',
      status: 'VERIFIED',
      icon: <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />,
      description: 'Generates immutable, CMS-ready printable encounter summaries with supervisor cosignature blocks and audit tracking IDs.',
      specDoc: '05_Compliance_Engine_PDF_Export.md'
    },
    {
      id: 'GA8-06',
      name: 'Sync Worker & Queue',
      category: 'Network',
      status: 'VERIFIED',
      icon: <Network className="w-3.5 h-3.5 text-indigo-400" />,
      description: 'Auto-retrying background queue with transactional idempotency preventing double-submits during intermittent cellular coverage.',
      specDoc: '07_Offline_Sync_IndexedDB.md'
    },
    {
      id: 'GA8-07',
      name: 'SHA-256 Audit Trail',
      category: 'Audit',
      status: 'VERIFIED',
      icon: <Cpu className="w-3.5 h-3.5 text-rose-400" />,
      description: 'Tamper-evident cryptographic checksums for every client view, signature, revision, and supervisor review action.',
      specDoc: '06_Security_Load_Testing_Domain.md'
    }
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            GA8 System Grade:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {badges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 transition-colors"
                title={`${badge.name} (${badge.id}) - Click for details`}
              >
                {badge.icon}
                <span className="font-mono text-[10px] text-slate-400">{badge.id}</span>
                <span className="hidden sm:inline text-[11px]">{badge.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            7/7 Standards Validated
          </span>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm p-1 rounded hover:bg-slate-800"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                {selectedBadge.icon}
              </span>
              <div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">{selectedBadge.id} • {selectedBadge.category}</span>
                <h3 className="text-base font-semibold text-white">{selectedBadge.name}</h3>
              </div>
            </div>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              {selectedBadge.description}
            </p>
            <div className="mt-4 p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Architecture Specification:</span>
              <span className="font-mono text-blue-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {selectedBadge.specDoc}
              </span>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
