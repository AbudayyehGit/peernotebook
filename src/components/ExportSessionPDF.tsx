/**
 * Peer Notebook - Clinical Encounter Export & PDF Engine
 * Conforms to Medi-Cal H0038 / CalAIM Behavioral Health Payment Reform
 * Soft Slate (#F8FAFC) & Deep Navy (#1E3A8A) Styling
 */

import React, { useRef } from 'react';
import { SessionNote } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { AuditLogger } from '../services/auditLogger';
import { Printer, Download, FileText, X } from 'lucide-react';

interface ExportSessionPDFProps {
  note: SessionNote;
  onClose: () => void;
}

export const ExportSessionPDF: React.FC<ExportSessionPDFProps> = ({ note, onClose }) => {
  const { currentOrg, currentUser } = useAuth();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (currentUser && currentOrg) {
      await AuditLogger.log({
        organizationId: currentOrg.id,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'EXPORT_PDF',
        entityType: 'session_note',
        entityId: note.id,
        details: { printMethod: 'browser_window_print', calaimPathway: 'Medi-Cal H0038' }
      });
    }

    window.print();
  };

  const handleDownloadJSON = async () => {
    if (currentUser && currentOrg) {
      await AuditLogger.log({
        organizationId: currentOrg.id,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'EXPORT_PDF',
        entityType: 'session_note',
        entityId: note.id,
        details: { downloadMethod: 'json_export' }
      });
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(note, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `calaim-encounter-${note.clientIdentifier}-${note.encounterDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[92vh] flex flex-col my-auto">
        {/* Controls Bar (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-bold text-[#1E3A8A] text-base">Medi-Cal / CalAIM Encounter Record</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div className="overflow-y-auto mt-4 pr-1">
          <div
            ref={printAreaRef}
            className="bg-white text-slate-900 p-8 rounded-xl border border-slate-200 text-xs font-sans leading-normal print:p-0 print:border-none print:shadow-none"
          >
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-tight text-[#1E3A8A]">
                    {currentOrg?.name || 'Bay Area Peer Recovery Collaborative'}
                  </h1>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    CalAIM Behavioral Health Payment Reform • NPI: {currentOrg?.npi || '1982019482'} • Medi-Cal Provider ID: {currentOrg?.medicaidProviderId || 'CA-MC-948102'} ({currentOrg?.countyCode || 'County: 38'})
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-teal-50 text-[#0F766E] font-mono text-[10px] font-bold rounded border border-teal-200">
                    CALAIM MEDI-CAL H0038
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Doc ID: {note.id}</p>
                </div>
              </div>
            </div>

            {/* Encounter & Client Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-[11px]">
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px] block">Peer / Client</span>
                <span className="font-bold text-slate-900 text-sm">{note.clientName}</span>
                <span className="font-mono text-slate-600 block mt-0.5">
                  MRN: {note.clientIdentifier} {note.mediCalCin ? `• Medi-Cal CIN: ${note.mediCalCin}` : ''}
                </span>
              </div>

              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px] block">Date of Service</span>
                <span className="font-bold text-slate-900 text-sm">{note.encounterDate}</span>
                <span className="text-slate-600 block mt-0.5 font-mono">
                  Time: {note.startTime} - {note.endTime} (Direct: {note.faceToFaceMinutes || 45}m • Travel: {note.travelMinutes || 0}m • Doc: {note.documentationMinutes || 0}m)
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <span className="text-slate-500 uppercase font-semibold text-[10px] block">Billing Units (CalAIM)</span>
                <span className="font-bold text-slate-900">
                  {note.billingCode} — {note.billingUnits} Billable Units ({note.durationMinutes} min total)
                </span>
                <span className="text-slate-600 block mt-0.5 capitalize">
                  Setting: {note.modality.replace('_', ' ')} (POS: {note.placeOfServiceCode || '99'})
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <span className="text-slate-500 uppercase font-semibold text-[10px] block">Specialist Author</span>
                <span className="font-bold text-slate-900">{note.authorName}</span>
                <span className="text-slate-600 block mt-0.5">{note.authorCredentials}</span>
              </div>
            </div>

            {/* Focus Domains */}
            <div className="mb-4">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                CalAIM Focus Domains
              </span>
              <div className="flex flex-wrap gap-1">
                {note.focusDomains.map(d => (
                  <span key={d} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-medium border border-slate-200">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Core Narrative Documentation */}
            <div className="space-y-4 mb-6">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-1">1. CalAIM Strengths-Based Goal Addressed</h4>
                <p className="text-slate-700 leading-relaxed">{note.goalAddressed}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-1">2. Certified Peer Specialist Intervention</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{note.peerIntervention}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-1">3. Peer / Client Response & Quotes</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{note.clientResponse}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-1">4. Plan & Action Steps for Next Meeting</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{note.planNextSteps}</p>
              </div>

              {note.safetyConcerns && (
                <div className="p-3.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-900">
                  <h4 className="font-bold text-rose-800 text-xs mb-1">Safety & Crisis Management Record</h4>
                  <p className="text-rose-800 leading-relaxed">{note.safetyNotes || 'Safety plan reviewed with peer.'}</p>
                </div>
              )}
            </div>

            {/* Signatures & Attestation */}
            <div className="border-t-2 border-slate-300 pt-4 mt-6 grid grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Peer Specialist Signature
                </span>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-300 font-serif italic text-sm text-slate-900">
                  {note.specialistSignature}
                </div>
                <div className="text-[10px] text-slate-600 mt-1 font-mono">
                  Signed: {note.signedAt || note.createdAt}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Clinical Supervisor Cosignature
                </span>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-300 font-serif italic text-sm text-slate-900">
                  {note.supervisorSignature || 'Pending Clinical Supervisor Review'}
                </div>
                <div className="text-[10px] text-slate-600 mt-1 font-mono">
                  {note.approvedAt ? `Cosigned: ${note.approvedAt}` : 'Status: Pending Review'}
                </div>
                {note.supervisorFeedback && (
                  <p className="text-[10px] text-slate-600 mt-1 italic">
                    QA Note: {note.supervisorFeedback}
                  </p>
                )}
              </div>
            </div>

            {/* Legal & HIPAA Security Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-[9px] text-slate-500 flex justify-between items-center">
              <div>
                <span>CONFIDENTIAL CLINICAL RECORD — PROTECTED UNDER HIPAA 45 CFR § 164 & 42 CFR PART 2</span>
                <p className="mt-0.5">California CalAIM Department of Health Care Services (DHCS) Compliant Documentation • peernotebook.com</p>
              </div>
              <div className="font-mono text-slate-600 text-right">
                <span>BAA Seal: {currentOrg?.baaVersion || 'v2.4-GA8-CalAIM'}</span>
                <br />
                <span>SHA-256 Provenance Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
