/**
 * Peer Notebook - CalAIM Offline Supervisor Attestation & Cryptographic Cosignature
 * Sprint 1 Deliverable: SP1-02
 * Conforms to:
 *  - California Welfare & Institutions Code § 14045.5
 *  - CalMHSA / DHCS CalAIM Peer Support Services (H0038) Guidelines
 *  - 45 CFR § 164.312(c)(1) Cryptographic Integrity & Electronic Signatures
 * 
 * Flow:
 *  1. Displays full CalAIM 4-part encounter note preview.
 *  2. Presents statutory clinical supervisor attestation text.
 *  3. Computes local SHA-256 cryptographic attestation hash over encounter payload.
 *  4. Binds electronic signature to the hash in IndexedDB (Dexie.js).
 *  5. Enqueues mutation into syncWorker for Supabase cloud sync upon reconnection.
 *  6. Writes immutable chained audit entry to AuditTrail.
 */

import React, { useState, useEffect } from 'react';
import { SessionNote, peerNotebookDB } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { usePrivacyMode } from '../context/PrivacyModeContext';
import { syncWorker } from '../services/syncWorker';
import { AuditTrail, computeSha256 } from '../services/AuditTrail';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Hash,
  Award,
  UserCheck
} from 'lucide-react';

export interface SupervisorSignOffProps {
  note: SessionNote | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (approvedNote: SessionNote) => void;
}

export const STATUTORY_CALAIM_ATTESTATION = 
  "Under penalty of perjury, I attest that I am an authorized clinical supervisor (LCSW, LMFT, LPCC, Licensed Psychologist, or Licensed Physician) overseeing Medi-Cal Peer Support Services in accordance with CalAIM guidelines and California Welfare and Institutions Code § 14045.5. I have reviewed this encounter record, verified medical necessity and alignment with the peer recovery plan, and affirm that the face-to-face, travel, and documentation minutes recorded are true and accurate.";

export const SupervisorSignOff: React.FC<SupervisorSignOffProps> = ({
  note,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, currentOrg } = useAuth();
  const { isPrivacyMode, maskName } = usePrivacyMode();

  const [supervisorName, setSupervisorName] = useState(currentUser?.fullName || '');
  const [supervisorNpi, setSupervisorNpi] = useState(currentUser?.npi || '1982049182');
  const [licenseNumber, setLicenseNumber] = useState(currentUser?.licenseNumber || 'LCSW #94102');
  const [feedback, setFeedback] = useState('');
  const [signatureConfirmation, setSignatureConfirmation] = useState(false);
  const [typedSignature, setTypedSignature] = useState(currentUser?.fullName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedHash, setGeneratedHash] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setSupervisorName(currentUser.fullName);
      setTypedSignature(currentUser.fullName);
      if (currentUser.npi) setSupervisorNpi(currentUser.npi);
      if (currentUser.licenseNumber) setLicenseNumber(currentUser.licenseNumber);
    }
    setError(null);
    setGeneratedHash(null);
    setSignatureConfirmation(false);
    setFeedback('');
  }, [note, currentUser, isOpen]);

  if (!isOpen || !note) return null;

  const handleAttestAndSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Active supervisor authentication required.');
      return;
    }
    if (!signatureConfirmation || !typedSignature.trim()) {
      setError('Please type your legal electronic signature and confirm the statutory attestation.');
      return;
    }
    if (!supervisorNpi.trim() || supervisorNpi.trim().length < 10) {
      setError('A valid 10-digit National Provider Identifier (NPI) is required for Medi-Cal cosignature.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const attestationTimestamp = new Date().toISOString();

      // Canonical payload for local SHA-256 cryptographic binding
      const attestationCanonicalPayload = [
        note.id,
        note.clientId,
        note.clientIdentifier,
        note.encounterDate,
        note.durationMinutes,
        note.billingUnits,
        note.billingCode,
        currentUser.id,
        supervisorNpi.trim(),
        licenseNumber.trim(),
        attestationTimestamp,
        STATUTORY_CALAIM_ATTESTATION
      ].join('::');

      // Compute SHA-256 local hash
      const attestationHash = await computeSha256(attestationCanonicalPayload);
      const signatureFormatted = `SHA256:${attestationHash}:${typedSignature.trim()} [${licenseNumber.trim()}]`;

      // Update Session Note with cryptographic cosignature
      const updatedNote: SessionNote = {
        ...note,
        status: 'approved',
        supervisorId: currentUser.id,
        supervisorName: supervisorName.trim() || currentUser.fullName,
        supervisorSignature: signatureFormatted,
        supervisorFeedback: feedback.trim() || 'Reviewed and approved under CalAIM Medi-Cal H0038 statutory standards.',
        approvedAt: attestationTimestamp,
        updatedAt: attestationTimestamp,
        synced: false // Marked for offline sync worker
      };

      // 1. Save directly into Dexie.js (local IndexedDB)
      await peerNotebookDB.saveNote(updatedNote);

      // 2. Queue mutation for Supabase / Cloud sync upon network connectivity
      await syncWorker.enqueueMutation('UPDATE', 'session_note', updatedNote.id, updatedNote);

      // 3. Write immutable chained audit entry
      await AuditTrail.recordNoteSignOff(
        updatedNote,
        {
          id: currentUser.id,
          fullName: currentUser.fullName,
          role: currentUser.role,
          organizationId: currentOrg?.id || note.organizationId,
          npi: supervisorNpi.trim()
        },
        attestationHash
      );

      setGeneratedHash(attestationHash);
      setIsSubmitting(false);

      // Notify caller after slight pause so user sees hash receipt
      setTimeout(() => {
        onSuccess(updatedNote);
      }, 1200);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError((err as Error).message || 'Failed to complete cryptographic sign-off.');
    }
  };

  const handleCopyHash = () => {
    if (!generatedHash) return;
    navigator.clipboard.writeText(generatedHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl relative my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400 text-teal-950 uppercase tracking-wider">
                  CalAIM H0038
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  Encounter #{note.clientIdentifier}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
                Clinical Supervisor Attestation & Cosignature
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-blue-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAttestAndSign} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {generatedHash && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Encounter Approved & Cryptographically Sealed!</span>
              </div>
              <p className="text-xs text-emerald-700">
                Local SHA-256 cryptographic attestation hash bound into Dexie.js and queued for Supabase sync upon reconnection:
              </p>
              <div className="flex items-center justify-between gap-2 p-2.5 bg-white border border-emerald-300 rounded-xl font-mono text-[11px] text-slate-800 break-all">
                <span>{generatedHash}</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="px-2 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Encounter Summary Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Client</p>
                <p className="text-sm font-bold text-slate-900">
                  {maskName(note.clientName, note.clientIdentifier, note.clientId)} ({note.clientIdentifier})
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date of Service</p>
                <p className="text-sm font-semibold text-slate-800">{note.encounterDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Face-to-Face</p>
                <p className="text-sm font-bold text-slate-900">{note.faceToFaceMinutes || 0} min</p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Travel / Doc</p>
                <p className="text-sm font-bold text-slate-900">
                  {(note.travelMinutes || 0) + (note.documentationMinutes || 0)} min
                </p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Billing Units</p>
                <p className="text-sm font-bold text-[#0F766E]">{note.billingUnits || 0} Units</p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Specialist</p>
                <p className="text-xs font-bold text-slate-800 truncate">{note.authorName}</p>
              </div>
            </div>

            <div className="text-xs space-y-1.5 pt-1">
              <p className="text-slate-700">
                <strong className="text-slate-900">Goal Addressed:</strong> {note.goalAddressed}
              </p>
              <p className="text-slate-700">
                <strong className="text-slate-900">Peer Intervention:</strong> {note.peerIntervention}
              </p>
            </div>
          </div>

          {/* Statutory Attestation Box */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E3A8A]">
              <Lock className="w-4 h-4 text-[#1E3A8A]" />
              <span>CalAIM Statutory Supervisory Attestation</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              &ldquo;{STATUTORY_CALAIM_ATTESTATION}&rdquo;
            </p>
          </div>

          {/* Supervisor Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supervisor Name *
              </label>
              <input
                type="text"
                required
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supervisor NPI (10-Digit) *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={supervisorNpi}
                onChange={(e) => setSupervisorNpi(e.target.value.replace(/\D/g, ''))}
                placeholder="1982049182"
                className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical License / Credential *
              </label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="LCSW #98214"
                className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          {/* QA Feedback */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supervisory Feedback / Quality Assurance Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Excellent strengths-based framing of housing stabilization goals. Compliant with Medi-Cal H0038."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900"
            />
          </div>

          {/* Signature and Confirmation Checkbox */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Type Full Legal Name to Electronically Sign *
              </label>
              <input
                type="text"
                required
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins, LCSW"
                className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-serif"
              />
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={signatureConfirmation}
                onChange={(e) => setSignatureConfirmation(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-[#0F766E] rounded-md border-slate-300 focus:ring-[#0F766E]"
              />
              <span className="text-xs text-slate-700 leading-normal">
                I hereby declare that this electronic signature is the legally binding equivalent of my handwritten signature and confirm that I have reviewed the clinical documentation above.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[44px] px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !signatureConfirmation || !typedSignature.trim() || !!generatedHash}
              className="min-h-[44px] px-5 py-2.5 bg-[#0F766E] hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Computing Cryptographic Attestation...' : 'Attest & Cosign Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
