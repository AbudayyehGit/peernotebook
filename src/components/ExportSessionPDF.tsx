/**
 * Peer Notebook - Encrypted JSON & PDF Client Chart Export Utility
 * Conforms to Medi-Cal H0038 / CalAIM Behavioral Health Payment Reform
 * Standard: GA #8 • Web Crypto AES-GCM 256-Bit Encrypted Archives
 * Soft Slate (#F8FAFC) & Deep Navy (#1E3A8A) Trauma-Informed Styling
 * Minimum 48px Touch Targets & Immutable Audit Trail Logging
 */

import React, { useRef, useState } from 'react';
import { SessionNote } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { AuditLogger } from '../services/auditLogger';
import { usePrivacyMode } from '../context/PrivacyModeContext';
import { Printer, Download, FileText, X, Lock, ShieldCheck, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExportSessionPDFProps {
  note: SessionNote;
  onClose: () => void;
}

// AES-GCM 256-bit client-side encryption helper using standard Web Crypto API
async function encryptPayloadWithPassword(payload: string, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(payload)
  );

  const packageObj = {
    format: 'PeerNotebook_Encrypted_Chart_Archive',
    version: '1.0-GA8',
    cipher: 'AES-GCM-256',
    kdf: 'PBKDF2-SHA256',
    iterations: 100000,
    saltHex: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
    ivHex: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
    ciphertextHex: Array.from(new Uint8Array(ciphertextBuffer)).map(b => b.toString(16).padStart(2, '0')).join(''),
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(packageObj, null, 2);
}

export const ExportSessionPDF: React.FC<ExportSessionPDFProps> = ({ note, onClose }) => {
  const { currentOrg, currentUser } = useAuth();
  const { isPrivacyMode, maskName } = usePrivacyMode();
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Encrypted JSON Export State
  const [showEncryptModal, setShowEncryptModal] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [encryptError, setEncryptError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const displayName = isPrivacyMode
    ? maskName(note.clientName, note.clientIdentifier, note.clientId)
    : note.clientName;

  const handlePrint = async () => {
    if (currentUser) {
      await AuditLogger.log({
        organizationId: currentOrg?.id,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'EXPORT_PDF',
        entityType: 'session_note',
        entityId: note.id,
        details: {
          printMethod: 'browser_window_print',
          calaimPathway: 'Medi-Cal H0038',
          fieldPrivacyMode: isPrivacyMode
        }
      });
    }

    window.print();
  };

  const handleDownloadPlainJSON = async () => {
    if (currentUser) {
      await AuditLogger.log({
        organizationId: currentOrg?.id,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'EXPORT_PDF',
        entityType: 'session_note',
        entityId: note.id,
        details: { downloadMethod: 'json_export', encrypted: false }
      });
    }

    const exportData = {
      ...note,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.fullName || 'Peer Specialist'
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `calaim-encounter-${note.clientIdentifier}-${note.encounterDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccessMessage('Plain JSON encounter chart downloaded.');
    setTimeout(() => setExportSuccessMessage(null), 3500);
  };

  const handleDownloadEncryptedArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase || passphrase.length < 8) {
      setEncryptError('Passphrase must be at least 8 characters long for HIPAA encryption.');
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setEncryptError('Passphrases do not match. Please re-enter.');
      return;
    }

    setIsExporting(true);
    setEncryptError(null);

    try {
      const exportArchivePayload = JSON.stringify({
        system: 'Peer Notebook GA #8',
        licensee: 'Peer Notebook LLC',
        clinicalStandard: 'CalAIM Medi-Cal H0038',
        sessionNote: note,
        clientMetadata: {
          clientIdentifier: note.clientIdentifier,
          mediCalCin: note.mediCalCin,
          displayName
        },
        exportedBy: {
          specialistId: currentUser?.id,
          specialistName: currentUser?.fullName,
          credentials: currentUser?.credentialTitle,
          organization: currentOrg?.name || 'Independent 1099 Practitioner'
        },
        exportedAt: new Date().toISOString()
      }, null, 2);

      const encryptedData = await encryptPayloadWithPassword(exportArchivePayload, passphrase);

      if (currentUser) {
        await AuditLogger.log({
          organizationId: currentOrg?.id,
          actorId: currentUser.id,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'EXPORT_PDF',
          entityType: 'session_note',
          entityId: note.id,
          details: {
            downloadMethod: 'encrypted_json_archive',
            cipher: 'AES-GCM-256',
            kdf: 'PBKDF2-SHA256-100k'
          }
        });
      }

      const blob = new Blob([encryptedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', `chart-encrypted-${note.clientIdentifier}-${note.encounterDate}.enc.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);

      setShowEncryptModal(false);
      setPassphrase('');
      setConfirmPassphrase('');
      setExportSuccessMessage('AES-256 Encrypted chart archive generated & downloaded safely.');
      setTimeout(() => setExportSuccessMessage(null), 4000);
    } catch (err) {
      setEncryptError('Encryption failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col my-auto">
        {/* Controls Bar (Hidden during print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 print:hidden shrink-0 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 rounded-xl border border-teal-200 text-[#0F766E]">
              <FileText className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="font-bold text-[#1E3A8A] text-sm sm:text-base">
                Medi-Cal / CalAIM Encounter Chart Export
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {note.clientIdentifier} · {note.encounterDate} · {displayName}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowEncryptModal(true)}
              className="flex-1 sm:flex-none min-h-[48px] flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-[#D97706] rounded-full text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
              title="Export AES-256 Encrypted JSON Archive"
            >
              <Lock className="w-4 h-4 text-[#D97706]" />
              <span>Encrypted Backup</span>
            </button>

            <button
              onClick={handleDownloadPlainJSON}
              className="flex-1 sm:flex-none min-h-[48px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
              title="Download standard JSON format"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>JSON Chart</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none min-h-[48px] flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Export Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {exportSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-[#16A34A] flex items-center gap-2 my-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
            <span>{exportSuccessMessage}</span>
          </div>
        )}

        {/* Printable Paper Document */}
        <div className="overflow-y-auto mt-4 pr-1 max-w-full">
          <div
            ref={printAreaRef}
            className="bg-white text-slate-900 p-4 sm:p-8 rounded-xl border border-slate-200 text-xs font-sans leading-normal print:p-0 print:border-none print:shadow-none max-w-full overflow-hidden"
          >
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#1E3A8A]">
                    {currentOrg?.name || 'Independent Peer Support Practice'}
                  </h1>
                  <p className="text-slate-600 text-[10px] sm:text-[11px] mt-0.5">
                    CalAIM Behavioral Health Payment Reform • NPI: {currentOrg?.npi || currentUser?.npi || '1982019482'} • Medi-Cal Provider ID: {currentOrg?.medicaidProviderId || 'CA-MC-948102'}
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 bg-teal-50 text-[#0F766E] font-mono text-[10px] font-bold rounded border border-teal-200">
                    CALAIM MEDI-CAL H0038
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Doc ID: {note.id}</p>
                </div>
              </div>
            </div>

            {/* Encounter & Client Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-3.5 sm:p-4 rounded-lg border border-slate-200 mb-6 text-[11px]">
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px] block">Peer / Client</span>
                <span className="font-bold text-slate-900 text-sm">{displayName}</span>
                <span className="font-mono text-slate-600 block mt-0.5">
                  Identifier: {note.clientIdentifier} {note.mediCalCin ? `• Medi-Cal CIN: ${note.mediCalCin}` : ''}
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
                <span className="text-slate-500 uppercase font-semibold text-[10px] block">Place of Service</span>
                <span className="font-bold text-slate-900">
                  Code {note.placeOfServiceCode || '15'} - {note.placeOfServiceCode === '15' ? 'Mobile Unit / Community Outreach' : 'Community'}
                </span>
                <span className="text-slate-600 block text-[10px] truncate">{note.locationDetails || 'Client Community Location'}</span>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <span className="text-slate-500 uppercase font-semibold text-[10px] block">CalAIM Billing Units</span>
                <span className="font-mono font-bold text-[#0F766E] text-sm">
                  {note.billingUnits || 3} Units ({note.durationMinutes || 45} Total Minutes)
                </span>
                <span className="text-slate-600 block text-[10px]">H0038 CMS 15-Min Conversion</span>
              </div>
            </div>

            {/* California SB 803 Core Competencies Compliance Block */}
            {note.sb803Competencies && note.sb803Competencies.length > 0 && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 mb-4 text-[11px]">
                <span className="text-[#1E3A8A] uppercase font-bold text-[10px] block mb-1">
                  California SB 803 / CalMHSA Core Competencies ({note.sb803Competencies.length} Tagged)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {note.sb803Competencies.map((compId) => (
                    <span key={compId} className="px-2 py-0.5 bg-white border border-blue-300 rounded font-semibold text-slate-800 text-[10px]">
                      {compId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4-Part CalAIM Note Body */}
            <div className="space-y-4">
              {/* Part 1: Recovery Goal */}
              <div className="border border-slate-200 rounded-lg p-3 sm:p-4 bg-white">
                <h4 className="font-bold text-[#1E3A8A] text-xs uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>1. Strengths-Based Recovery Goal Addressed</span>
                  <span className="text-slate-400 font-mono text-[10px]">CalAIM Req #1</span>
                </h4>
                <p className="text-slate-800 leading-relaxed text-xs sm:text-[13px]">{note.goalAddressed}</p>
              </div>

              {/* Part 2: Peer Intervention */}
              <div className="border border-slate-200 rounded-lg p-3 sm:p-4 bg-white">
                <h4 className="font-bold text-[#1E3A8A] text-xs uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>2. Peer Support Intervention & Lived Experience Coaching</span>
                  <span className="text-slate-400 font-mono text-[10px]">CalAIM Req #2</span>
                </h4>
                <p className="text-slate-800 leading-relaxed text-xs sm:text-[13px] whitespace-pre-wrap">{note.peerIntervention}</p>
              </div>

              {/* Part 3: Client Response */}
              <div className="border border-slate-200 rounded-lg p-3 sm:p-4 bg-white">
                <h4 className="font-bold text-[#1E3A8A] text-xs uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>3. Client Response & Direct Recovery Feedback</span>
                  <span className="text-slate-400 font-mono text-[10px]">CalAIM Req #3</span>
                </h4>
                <p className="text-slate-800 leading-relaxed text-xs sm:text-[13px] whitespace-pre-wrap">{note.clientResponse}</p>
              </div>

              {/* Part 4: Plan & Next Steps */}
              <div className="border border-slate-200 rounded-lg p-3 sm:p-4 bg-white">
                <h4 className="font-bold text-[#1E3A8A] text-xs uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>4. Collaborative Plan & Next Steps</span>
                  <span className="text-slate-400 font-mono text-[10px]">CalAIM Req #4</span>
                </h4>
                <p className="text-slate-800 leading-relaxed text-xs sm:text-[13px]">{note.planNextSteps}</p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-6 pt-4 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Specialist Electronic Signature</span>
                <span className="font-bold text-slate-900 text-sm block font-serif italic mt-1">
                  /s/ {note.specialistSignature || note.authorName}
                </span>
                <span className="text-slate-600 block">{note.authorCredentials}</span>
                <span className="text-slate-500 font-mono text-[10px] block mt-0.5">
                  Signed: {note.signedAt || note.createdAt}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Supervisor QA Review / Cosignature</span>
                {note.supervisorSignature ? (
                  <>
                    <span className="font-bold text-slate-900 text-sm block font-serif italic mt-1">
                      /s/ {note.supervisorSignature}
                    </span>
                    <span className="text-slate-600 block">{note.supervisorName} (Clinical Supervisor)</span>
                    <span className="text-slate-500 font-mono text-[10px] block mt-0.5">
                      Approved: {note.approvedAt}
                    </span>
                  </>
                ) : (
                  <div className="mt-1 p-2 bg-slate-100 rounded text-slate-500 text-[10px]">
                    Pending supervisor cosignature (or Solo 1099 direct billing verification)
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Footer on Printed Document */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
              <span>Confidential Healthcare Record • California CMIA § 56.10 & 45 CFR § 164.502</span>
              <span>Generated by Peer Notebook (peernotebook.com)</span>
            </div>
          </div>
        </div>

        {/* Encrypted JSON Password Modal */}
        {showEncryptModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-[#1E3A8A]">
                  <Lock className="w-5 h-5 text-[#D97706]" />
                  <span>Secure Encrypted JSON Export</span>
                </div>
                <button
                  onClick={() => setShowEncryptModal(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Create a passphrase to encrypt this encounter chart using client-side <strong>AES-GCM 256-bit</strong> encryption. The recipient will need this passphrase to decrypt and read the archive.
              </p>

              <form onSubmit={handleDownloadEncryptedArchive} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Encryption Passphrase (min 8 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter strong encryption passphrase"
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Passphrase
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassphrase}
                    onChange={(e) => setConfirmPassphrase(e.target.value)}
                    placeholder="Re-enter passphrase"
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                  />
                </div>

                {encryptError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{encryptError}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEncryptModal(false)}
                    className="min-h-[48px] px-4 py-2 border border-slate-300 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isExporting}
                    className="min-h-[48px] px-5 py-2.5 bg-[#D97706] hover:bg-amber-700 text-white rounded-full text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isExporting ? 'Encrypting...' : 'Download Encrypted Archive'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
