/**
 * Peer Notebook - Clinical Supervisor Review & Cosign Dashboard
 * CalAIM & Medi-Cal H0038 Quality Assurance • Soft Slate Off-White Palette
 * Minimum 44px touch targets & Trauma-Informed Container Cards
 */

import React, { useState, useEffect } from 'react';
import { peerNotebookDB, SessionNote } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { AuditLogger } from '../services/auditLogger';
import { syncWorker } from '../services/syncWorker';
import { ShieldCheck, FileCheck, CheckCircle2, Clock, AlertCircle, Download, Filter, FileText, Check, X } from 'lucide-react';
import { ExportSessionPDF } from './ExportSessionPDF';

export const SupervisorDashboard: React.FC = () => {
  const { currentOrg, currentUser } = useAuth();
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<SessionNote | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pending_supervisor');
  const [supervisorFeedback, setSupervisorFeedback] = useState<string>('');
  const [cosignSignature, setCosignSignature] = useState<string>(
    currentUser?.fullName ? `${currentUser.fullName} [LCSW Cosigned]` : 'Dr. Sarah Jenkins, LCSW [Cosigned]'
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [exportNote, setExportNote] = useState<SessionNote | null>(null);

  const loadNotes = async () => {
    const allNotes = await peerNotebookDB.getAllNotes();
    if (currentOrg) {
      setNotes(allNotes.filter(n => n.organizationId === currentOrg.id));
    } else {
      setNotes(allNotes);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [currentOrg]);

  // Aggregate metrics
  const pendingNotes = notes.filter(n => n.status === 'pending_supervisor');
  const approvedNotes = notes.filter(n => n.status === 'approved');
  const totalUnits = notes.reduce((sum, n) => sum + (n.billingUnits || 0), 0);
  const safetyCount = notes.filter(n => n.safetyConcerns).length;

  const [revisionError, setRevisionError] = useState<string | null>(null);

  const handleApprove = async (note: SessionNote) => {
    if (!currentUser || !currentOrg) return;
    setRevisionError(null);

    const updatedNote: SessionNote = {
      ...note,
      status: 'approved',
      supervisorId: currentUser.id,
      supervisorName: currentUser.fullName,
      supervisorSignature: cosignSignature,
      supervisorFeedback: supervisorFeedback.trim() || 'Reviewed and approved for CalAIM & Medi-Cal H0038 reimbursement.',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await peerNotebookDB.saveNote(updatedNote);
    await syncWorker.enqueueMutation('UPDATE', 'session_note', updatedNote.id, updatedNote);

    await AuditLogger.log({
      organizationId: currentOrg.id,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'SUPERVISOR_APPROVAL',
      entityType: 'session_note',
      entityId: updatedNote.id,
      details: {
        noteId: updatedNote.id,
        clientId: updatedNote.clientId,
        billingUnits: updatedNote.billingUnits,
        status: 'approved'
      }
    });

    setActionMessage(`Note for ${note.clientName} successfully cosigned and approved!`);
    setSelectedNote(null);
    setSupervisorFeedback('');
    setRevisionError(null);
    await loadNotes();
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleRequestRevision = async (note: SessionNote) => {
    if (!currentUser || !currentOrg) return;
    if (!supervisorFeedback.trim()) {
      setRevisionError('Please provide supervisory feedback before requesting a revision.');
      return;
    }
    setRevisionError(null);

    const updatedNote: SessionNote = {
      ...note,
      status: 'revision_requested',
      supervisorId: currentUser.id,
      supervisorName: currentUser.fullName,
      supervisorFeedback: supervisorFeedback.trim(),
      updatedAt: new Date().toISOString()
    };

    await peerNotebookDB.saveNote(updatedNote);
    await syncWorker.enqueueMutation('UPDATE', 'session_note', updatedNote.id, updatedNote);

    await AuditLogger.log({
      organizationId: currentOrg.id,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'REVISE_NOTE',
      entityType: 'session_note',
      entityId: updatedNote.id,
      details: {
        feedback: supervisorFeedback.trim()
      }
    });

    setActionMessage(`Revision requested from ${note.authorName}.`);
    setSelectedNote(null);
    setSupervisorFeedback('');
    await loadNotes();
    setTimeout(() => setActionMessage(null), 3000);
  };

  const filteredNotes = notes.filter(n => {
    if (filterStatus === 'ALL') return true;
    return n.status === filterStatus;
  });

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Metric Cards - Pure White (#FFFFFF) with soft ambient drop shadows */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <span className="text-xs font-bold text-slate-500 block mb-1">Awaiting Cosign</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#D97706]">{pendingNotes.length}</span>
            <div className="p-2.5 bg-[#FEF3C7] rounded-xl text-[#D97706] border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block truncate">Clinical review required</span>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <span className="text-xs font-bold text-slate-500 block mb-1">Approved & Cosigned</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#16A34A]">{approvedNotes.length}</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-[#16A34A] border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block truncate">Medi-Cal claim ready</span>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <span className="text-xs font-bold text-slate-500 block mb-1">Total Billable Units</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#1E3A8A]">{totalUnits}</span>
            <div className="p-2 bg-blue-50 rounded-xl text-[#1E3A8A] border border-blue-200">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block truncate">H0038 (15m increments)</span>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <span className="text-xs font-bold text-slate-500 block mb-1">Safety Risk Flags</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-rose-600">{safetyCount}</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600 border border-rose-200">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block truncate">Safety plan documented</span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-[#16A34A] rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Toolbar with 44px min-h touch controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-bold text-[#1E3A8A] text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#0F766E] shrink-0" />
          <span>Supervisor Sign-Off & CalAIM QA Queue</span>
        </h3>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden shadow-[0_2px_6px_rgba(15,23,42,0.03)] truncate cursor-pointer"
          >
            <option value="pending_supervisor">Pending Cosignature ({pendingNotes.length})</option>
            <option value="approved">Approved & Cosigned ({approvedNotes.length})</option>
            <option value="revision_requested">Revision Requested</option>
            <option value="ALL">All Notes ({notes.length})</option>
          </select>
        </div>
      </div>

      {/* List of Notes with Container Cards */}
      <div className="space-y-4">
        {filteredNotes.map((note) => {
          return (
            <div
              key={note.id}
              className="p-5 sm:p-6 bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl transition-all shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#1E3A8A] text-base">{note.clientName}</span>
                  <span className="font-mono text-xs text-[#0F766E] font-semibold">
                    {note.clientIdentifier}
                  </span>
                  {note.mediCalCin && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      · CIN: {note.mediCalCin}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                      note.status === 'pending_supervisor'
                        ? 'bg-[#FEF3C7] text-[#D97706] border border-amber-300/80'
                        : note.status === 'approved'
                        ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        note.status === 'pending_supervisor'
                          ? 'bg-[#D97706]'
                          : note.status === 'approved'
                          ? 'bg-[#16A34A]'
                          : 'bg-rose-600'
                      }`}
                    />
                    <span>
                      {note.status === 'pending_supervisor'
                        ? 'Needs Review'
                        : note.status === 'approved'
                        ? 'Cosigned'
                        : 'Revision'}
                    </span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Encounter: <strong className="text-slate-900">{note.encounterDate}</strong></span>
                  <span>·</span>
                  <span>Units: <strong className="text-[#1E3A8A] font-mono">{note.billingUnits} (H0038)</strong></span>
                  <button
                    type="button"
                    onClick={() => setExportNote(note)}
                    className="min-h-[44px] ml-1 flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-full border border-slate-300 text-xs font-bold transition-all shadow-[0_2px_4px_rgba(15,23,42,0.04)] cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#0F766E]" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* Note Content Snapshot */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-xs space-y-2.5">
                <div>
                  <span className="font-bold text-slate-600 block mb-0.5">CalAIM Goal Addressed:</span>
                  <p className="text-slate-800 leading-relaxed">{note.goalAddressed}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-600 block mb-0.5">Peer Specialist Intervention (CPSS-CA):</span>
                  <p className="text-slate-700 leading-relaxed">{note.peerIntervention}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-600 block mb-0.5">Client Response:</span>
                  <p className="text-slate-700 leading-relaxed">{note.clientResponse}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-600 block mb-0.5">Plan & Action Steps:</span>
                  <p className="text-slate-700 leading-relaxed">{note.planNextSteps}</p>
                </div>
              </div>

              {/* Author & Signature Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 pt-1 gap-3">
                <div>
                  <span>Author: <strong className="text-slate-900">{note.authorName}</strong> ({note.authorCredentials})</span>
                  {note.signedAt && <span className="ml-2 text-[#16A34A] font-semibold">✓ Electronic Signature Verified</span>}
                </div>

                {note.status === 'approved' && note.supervisorSignature && (
                  <div className="text-[#16A34A] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cosigned by {note.supervisorName}</span>
                  </div>
                )}

                {note.status === 'pending_supervisor' && (
                  <button
                    type="button"
                    onClick={() => setSelectedNote(note)}
                    className="min-h-[46px] flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Review & Cosign</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/90 text-slate-500 text-sm shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
            No session notes found matching "{filterStatus}".
          </div>
        )}
      </div>

      {/* Supervisor Review Modal with 44px tap targets */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/25 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-xl w-full max-w-[calc(100vw-1.5rem)] p-5 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 my-auto">
            <button
              type="button"
              onClick={() => setSelectedNote(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className="p-3 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-200/80 shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#1E3A8A] truncate">
                  Clinical Cosignature & QA Review
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  Peer: {selectedNote.clientName} ({selectedNote.clientIdentifier}) · Date: {selectedNote.encounterDate}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex flex-col xs:flex-row justify-between text-slate-700 gap-1">
                <span>Specialist: <strong>{selectedNote.authorName}</strong></span>
                <span>Code: <strong>{selectedNote.billingCode} ({selectedNote.billingUnits} units)</strong></span>
              </div>
              <div className="text-slate-600">
                Setting: <strong className="text-slate-900 capitalize">{selectedNote.modality.replace('_', ' ')}</strong> ({selectedNote.durationMinutes} mins total billable time)
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Clinical QA Notes & Feedback
              </label>
              <textarea
                rows={3}
                value={supervisorFeedback}
                onChange={(e) => setSupervisorFeedback(e.target.value)}
                placeholder="Document supervisory feedback, clinical alignment with CalAIM payment reform, or revision instructions..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Supervisor Electronic Cosignature Stamp
              </label>
              <input
                type="text"
                value={cosignSignature}
                onChange={(e) => setCosignSignature(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
              />
            </div>

            {revisionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{revisionError}</span>
              </div>
            )}

            <div className="flex flex-col xs:flex-row justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleRequestRevision(selectedNote)}
                className="w-full xs:w-auto min-h-[44px] px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-300 text-center transition-colors cursor-pointer"
              >
                Request Revision
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedNote)}
                className="w-full xs:w-auto min-h-[44px] px-6 py-2.5 bg-[#16A34A] hover:bg-green-700 text-white rounded-full text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Cosign & Approve for Claiming</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      {exportNote && (
        <ExportSessionPDF
          note={exportNote}
          onClose={() => setExportNote(null)}
        />
      )}
    </div>
  );
};
