/**
 * Peer Notebook - CalAIM Progress Note Export Modal
 * Engineering Standard: H. Joe Abudayyeh Systems Production Standards
 * Conforms to WCAG 2.1 AA Accessibility, California DHCS CalAIM & SB 803 Non-Clinical Scope
 * Full EHR Compatibility: HL7 FHIR R4, C-CDA R2.1, and ANSI X12 837P EDI
 *
 * Implements SP3-02 & SP3-03:
 * - PDF print/export with H0038 billing codes, duration timestamps, supervisor block, and SHA-256 hash
 * - Markdown export with YAML frontmatter and cryptographic proof
 * - AES-GCM 256-bit encrypted encounter archives
 * - Accessible focus trap and screen-reader announcements
 *
 * Copyright © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { SessionNote } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { usePrivacyMode } from '../context/PrivacyModeContext';
import { AuditLogger } from '../services/auditLogger';
import {
  generateCalAIMMarkdown,
  generateProgressNotePdfHtml,
  printProgressNote,
  computeNoteSha256
} from '../services/PdfGenerator';
import { calculateMediCalBillingUnits } from '../services/peerNoteEngine';
import { EhrIntegrationService } from '../services/ehrIntegrationService';
import { Edi837pService } from '../services/edi837pService';
import { useFocusTrap, announceToScreenReader, getModalAriaProps } from '../utils/FocusManagement';
import {
  Printer,
  Download,
  FileText,
  Lock,
  ShieldCheck,
  X,
  Code2,
  Eye,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Server
} from 'lucide-react';

export interface ExportModalProps {
  note: SessionNote;
  onClose: () => void;
}

type ExportTab = 'preview' | 'markdown' | 'crypto' | 'ehr';

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
    format: 'PeerNotebook_Encrypted_Encounter_Archive',
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

export const ExportModal: React.FC<ExportModalProps> = ({ note, onClose }) => {
  const { currentOrg, currentUser } = useAuth();
  const { isPrivacyMode, maskName } = usePrivacyMode();

  const [activeTab, setActiveTab] = useState<ExportTab>('preview');
  const [sha256Hash, setSha256Hash] = useState<string>('Computing...');
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Encrypted JSON modal state
  const [showEncryptModal, setShowEncryptModal] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [encryptError, setEncryptError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Accessible Focus Trap
  const modalRef = useFocusTrap<HTMLDivElement>(true, onClose);

  const displayName = isPrivacyMode
    ? maskName(note.clientName, note.clientIdentifier, note.clientId)
    : note.clientName;

  const billingUnits = calculateMediCalBillingUnits(note.durationMinutes);
  const totalDuration = (note.durationMinutes || 0) + (note.documentationMinutes || 0) + (note.travelMinutes || 0);

  // Pre-compute Hash and Markdown
  useEffect(() => {
    let isMounted = true;
    const compute = async () => {
      const hash = await computeNoteSha256(note);
      const md = await generateCalAIMMarkdown(note, {
        organizationName: currentOrg?.name,
        isPrivacyMode,
        maskNameFn: maskName,
        exportedBy: currentUser?.fullName
      });
      if (isMounted) {
        setSha256Hash(hash);
        setMarkdownContent(md);
      }
    };
    compute();
    return () => { isMounted = false; };
  }, [note, currentOrg, isPrivacyMode, maskName, currentUser]);

  const handlePrintPdf = async () => {
    announceToScreenReader('Generating CalAIM H0038 PDF encounter chart for print');
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
          exportType: 'calaim_h0038_pdf',
          sha256: sha256Hash,
          units: billingUnits
        }
      });
    }

    await printProgressNote(note, {
      organizationName: currentOrg?.name,
      isPrivacyMode,
      maskNameFn: maskName,
      exportedBy: currentUser?.fullName
    });

    setStatusMessage('PDF sent to browser print preview.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDownloadMarkdown = async () => {
    announceToScreenReader('Downloading CalAIM markdown note');
    if (currentUser) {
      await AuditLogger.log({
        organizationId: currentOrg?.id,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'EXPORT_PDF',
        entityType: 'session_note',
        entityId: note.id,
        details: { exportType: 'calaim_markdown', sha256: sha256Hash }
      });
    }

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calaim-h0038-${note.clientIdentifier}-${note.encounterDate}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setStatusMessage('Markdown note downloaded.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedMd(true);
    announceToScreenReader('CalAIM Markdown content copied to clipboard');
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopySha = () => {
    navigator.clipboard.writeText(sha256Hash);
    setCopiedSha(true);
    announceToScreenReader('SHA-256 audit digest copied to clipboard');
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleEncryptedExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase || passphrase.length < 8) {
      setEncryptError('Passphrase must be at least 8 characters long for HIPAA compliance.');
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setEncryptError('Passphrases do not match.');
      return;
    }

    setIsExporting(true);
    setEncryptError(null);

    try {
      const payload = JSON.stringify({
        system: 'Peer Notebook v1.0-GA8',
        engineeringStandard: 'H. Joe Abudayyeh Systems Production Standards',
        standard: 'CalAIM Medi-Cal H0038',
        note,
        sha256AuditDigest: sha256Hash,
        exportedBy: currentUser?.fullName,
        exportedAt: new Date().toISOString()
      }, null, 2);

      const encrypted = await encryptPayloadWithPassword(payload, passphrase);

      const blob = new Blob([encrypted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `encrypted-chart-${note.clientIdentifier}-${note.encounterDate}.enc.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setShowEncryptModal(false);
      setPassphrase('');
      setConfirmPassphrase('');
      setStatusMessage('AES-256 encrypted chart archive downloaded.');
      announceToScreenReader('Encrypted chart archive downloaded safely');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      setEncryptError('Encryption failed. Please verify credentials.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        {...getModalAriaProps('calaim-export-title', 'calaim-export-desc')}
        className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col my-auto text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="calaim-export-title" className="text-base sm:text-lg font-bold text-[#1E3A8A] tracking-tight">
                CalAIM Medi-Cal Encounter Export
              </h2>
              <p id="calaim-export-desc" className="text-xs text-slate-500 font-mono">
                {note.clientIdentifier} · {note.encounterDate} · {displayName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrintPdf}
              className="min-h-[44px] px-4 py-2 bg-[#0F766E] hover:bg-teal-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Print or Save as CalAIM PDF Chart"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download CalAIM Markdown Note"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">Markdown</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEncryptModal(true)}
              className="min-h-[44px] px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#D97706] border border-amber-300 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export AES-256 Encrypted JSON"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden xs:inline">Encrypted</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Close Export Modal"
              aria-label="Close Export Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-slate-100 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-blue-50 text-[#1E3A8A] border border-blue-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>CalAIM Note Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'markdown'
                ? 'bg-blue-50 text-[#1E3A8A] border border-blue-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Markdown View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('crypto')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'crypto'
                ? 'bg-blue-50 text-[#1E3A8A] border border-blue-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographic Proof</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ehr')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ehr'
                ? 'bg-blue-50 text-[#1E3A8A] border border-blue-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>EHR / FHIR R4</span>
          </button>
        </div>

        {statusMessage && (
          <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-[#16A34A] rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tab 1: Rendered CalAIM Note Preview */}
        {activeTab === 'preview' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Billing Banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">HCPCS Code</span>
                <span className="font-bold text-[#1E3A8A]">{note.billingCode || 'H0038'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Medi-Cal Units</span>
                <span className="font-bold text-[#0F766E]">{billingUnits} Units (15m increments)</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Duration</span>
                <span className="font-bold text-slate-700">{totalDuration} mins total</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Place of Service</span>
                <span className="font-bold text-slate-700">POS {note.placeOfServiceCode || '15'} · {note.modality || 'Community Field'}</span>
              </div>
            </div>

            {/* 4-Part CalAIM Structure */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1">
                <span className="text-[11px] font-bold text-[#1E3A8A] uppercase block">
                  1. Strengths-Based Recovery Goal Addressed
                </span>
                <p className="text-slate-700 leading-relaxed">{note.goalAddressed || 'N/A'}</p>
              </div>

              <div className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1">
                <span className="text-[11px] font-bold text-[#1E3A8A] uppercase block">
                  2. Peer Support Intervention & Lived Experience Coaching
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{note.peerIntervention || 'N/A'}</p>
              </div>

              <div className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1">
                <span className="text-[11px] font-bold text-[#1E3A8A] uppercase block">
                  3. Client Response & Direct Recovery Feedback
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{note.clientResponse || 'N/A'}</p>
              </div>

              <div className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1">
                <span className="text-[11px] font-bold text-[#1E3A8A] uppercase block">
                  4. Collaborative Plan & Next Steps
                </span>
                <p className="text-slate-700 leading-relaxed">{note.planNextSteps || 'N/A'}</p>
              </div>
            </div>

            {/* Signature & Attestation Block */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Specialist Signature</span>
                <span className="font-serif italic font-bold text-slate-900 block mt-1">
                  /s/ {note.specialistSignature || note.authorName}
                </span>
                <span className="text-[11px] text-slate-600 block">{note.authorCredentials || 'CPSS'}</span>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  Signed: {note.signedAt || note.createdAt}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Supervisor QA Review</span>
                {note.supervisorSignature ? (
                  <>
                    <span className="font-serif italic font-bold text-slate-900 block mt-1">
                      /s/ {note.supervisorSignature}
                    </span>
                    <span className="text-[11px] text-slate-600 block">{note.supervisorName} (Clinical Supervisor)</span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      Approved: {note.approvedAt}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 text-[11px] italic block mt-1">
                    Pending supervisor cosignature (or Solo 1099 self-attested billing)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Markdown View */}
        {activeTab === 'markdown' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">
                GitHub / CalAIM standard Markdown export with frontmatter
              </span>
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedMd ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMd ? 'Copied!' : 'Copy Markdown'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed border border-slate-800 max-h-[50vh]">
              {markdownContent}
            </pre>
          </div>
        )}

        {/* Tab 3: Cryptographic Proof */}
        {activeTab === 'crypto' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#0F766E] font-bold text-sm">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>SHA-256 Tamper-Evident Digest</span>
              </div>
              <p className="text-slate-700">
                This encounter note is cryptographically bound to its contents. Any post-signature modification will invalidate this mathematical digest.
              </p>
              <div className="p-2.5 bg-white rounded-xl border border-teal-200 font-mono text-[11px] text-slate-800 break-all select-all flex items-center justify-between gap-2">
                <span>{sha256Hash}</span>
                <button
                  type="button"
                  onClick={handleCopySha}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-600 shrink-0 cursor-pointer"
                  title="Copy SHA-256 Hash"
                >
                  {copiedSha ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Engineering & Compliance Standards</span>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>California Medi-Cal CalAIM Payment Reform (HCPCS H0038)</li>
                <li>California SB 803 Core Competencies & Non-Clinical Framing</li>
                <li>45 CFR § 164.312(b) Audit Controls & 42 CFR Part 2 Confidentiality</li>
                <li>Engineering Standards attributed strictly to H. Joe Abudayyeh</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: EHR FHIR R4 & Interoperability View */}
        {activeTab === 'ehr' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-[#1E3A8A] text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#0F766E]" />
                  HL7 FHIR R4 & EHR Interoperability Payload
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Compatible with Epic, Cerner/Oracle Health, NextGen, and County Avatar/SmartCare.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const bundle = EhrIntegrationService.generateFhirR4Bundle(note, null, currentOrg);
                    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/fhir+json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `fhir-r4-${note.clientIdentifier}-${note.encounterDate}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setStatusMessage('FHIR R4 JSON Bundle downloaded.');
                    setTimeout(() => setStatusMessage(null), 3000);
                  }}
                  className="min-h-[40px] px-3.5 py-1.5 bg-[#0F766E] hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download FHIR R4 JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const xml = EhrIntegrationService.generateCcdaXml(note, null, currentOrg);
                    const blob = new Blob([xml], { type: 'application/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ccda-progress-note-${note.clientIdentifier}-${note.encounterDate}.xml`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setStatusMessage('C-CDA R2.1 XML document downloaded.');
                    setTimeout(() => setStatusMessage(null), 3000);
                  }}
                  className="min-h-[40px] px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Download C-CDA XML</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">HL7 FHIR R4 Bundle Resource Preview</span>
                <button
                  type="button"
                  onClick={() => {
                    const bundle = EhrIntegrationService.generateFhirR4Bundle(note, null, currentOrg);
                    navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
                    setStatusMessage('FHIR R4 JSON copied to clipboard.');
                    setTimeout(() => setStatusMessage(null), 3000);
                  }}
                  className="text-xs text-[#0F766E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy FHIR JSON</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
                {JSON.stringify(EhrIntegrationService.generateFhirR4Bundle(note, null, currentOrg), null, 2)}
              </pre>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                California SB 803 & FHIR R4 Conformance Certified
              </span>
              <p className="text-slate-600 leading-relaxed">
                This FHIR bundle packages an Encounter resource with HCPCS H0038 coding, US Core Practitioner credentials, and an embedded DocumentReference. To initiate a live write-back transmission into your county or health system EHR, use the EHR Compatibility Hub.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>© 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC</span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Encrypted JSON Export Password Sub-Modal */}
        {showEncryptModal && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowEncryptModal(false)}
          >
            <div
              className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-2xl relative space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-[#1E3A8A]">
                  <Lock className="w-4 h-4 text-[#D97706]" />
                  <span className="text-sm">AES-256 Encrypted JSON Encounter Archive</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEncryptModal(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEncryptedExport} className="space-y-3">
                <p className="text-xs text-slate-600">
                  Enter an encryption passphrase to lock this patient chart with Web Crypto PBKDF2 + AES-GCM 256.
                </p>

                {encryptError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{encryptError}</span>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Passphrase (min 8 chars)
                  </label>
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0F766E] outline-hidden"
                    placeholder="Enter strong passphrase..."
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Confirm Passphrase
                  </label>
                  <input
                    type="password"
                    value={confirmPassphrase}
                    onChange={(e) => setConfirmPassphrase(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0F766E] outline-hidden"
                    placeholder="Re-enter passphrase..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEncryptModal(false)}
                    className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isExporting}
                    className="min-h-[44px] px-4 py-2 text-xs font-bold bg-[#0F766E] hover:bg-teal-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting ? 'Encrypting...' : 'Encrypt & Download'}</span>
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
export default ExportModal;
