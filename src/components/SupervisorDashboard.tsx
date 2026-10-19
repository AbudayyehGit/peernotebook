/**
 * Peer Notebook - Clinical Supervisor Review & Cosign Dashboard
 * CalAIM & Medi-Cal H0038 Quality Assurance • Soft Slate Off-White Palette
 */

import React, { useState, useEffect } from 'react';
import { peerNotebookDB, SessionNote } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { AuditLogger } from '../services/auditLogger';
import { syncWorker } from '../services/syncWorker';
import { ShieldCheck, FileCheck, CheckCircle2, Clock, AlertCircle, Download, Filter, FileText, Check, Award } from 'lucide-react';
import { ExportSessionPDF } from './ExportSessionPDF';

export const SupervisorDashboard: React.FC = () => {
  const { currentOrg, currentUser, canApproveNotes } = useAuth();
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

  const handleApprove = async (note: SessionNote) => {
    if (!currentUser || !currentOrg) return;

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
    await loadNotes();
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleRequestRevision = async (note: SessionNote) => {
    if (!currentUser || !currentOrg) return;
    if (!supervisorFeedback.trim()) {
      alert('Please provide supervisory feedback for the peer specialist before requesting revision.');
      return;
    }

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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block mb-1">Awaiting Cosign</span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-[#D97706]">{pendingNotes.length}</span>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#D97706]/70 shrink-0" />
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block truncate">Clinical review required</span>
        </div>

        <div className="p-3.5 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block mb-1">Approved & Cosigned</span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-[#16A34A]">{approvedNotes.length}</span>
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#16A34A]/70 shrink-0" />
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block truncate">Medi-Cal claim ready</span>
        </div>

        <div className="p-3.5 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block mb-1">Total Billable Units</span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-[#1E3A8A]">{totalUnits}</span>
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E3A8A]/70 shrink-0" />
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block truncate">H0038 (15m increments)</span>
        </div>

        <div className="p-3.5 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block mb-1">Safety Risk Flags</span>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-rose-600">{safetyCount}</span>
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0" />
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block truncate">Safety plan documented</span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-[#16A34A] rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <h3 className="font-bold text-[#1E3A8A] text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#0F766E] shrink-0" />
          Supervisor Sign-Off & CalAIM QA Queue
        </h3>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden shadow-2xs truncate"
          >
            <option value="pending_supervisor">Pending Cosignature ({pendingNotes.length})</option>
            <option value="approved">Approved & Cosigned ({approvedNotes.length})</option>
            <option value="revision_requested">Revision Requested</option>
            <option value="ALL">All Notes ({notes.length})</option>
          </select>
        </div>
      </div>

      {/* List of Notes */}
      <div className="space-y-3">
        {filteredNotes.map((note) => {
          return (
            <div
              key={note.id}
              className="p-4 sm:p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                  <span className="font-bold text-[#1E3A8A] text-base">{note.clientName}</span>
                  <span className="font-mono text-xs text-[#0F766E] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-semibold">
                    {note.clientIdentifier}
                  </span>
                  {note.mediCalCin && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      CIN: {note.mediCalCin}
                    </span>
                  )}
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      note.status === 'pending_supervisor'
                        ? 'bg-amber-50 text-[#D97706] border border-amber-300'
                        : note.status === 'approved'
                        ? 'bg-emerald-50 text-[#16A34A] border border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border border-rose-300'
                    }`}
                  >
                    {note.status === 'pending_supervisor'
                      ? 'Needs Review'
                      : note.status === 'approved'
                      ? 'Cosigned'
                      : 'Revision'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Encounter: <strong className="text-slate-900">{note.encounterDate}</strong></span>
                  <span>•</span>
                  <span>Units: <strong className="text-[#1E3A8A] font-mono">{note.billingUnits} (H0038)</strong></span>
                  <button
                    onClick={() => setExportNote(note)}
                    className="ml-2 flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* Note Content Snapshot */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-600 block mb-0.5">CalAIM Goal Addressed:</span>
                  <p className="text-slate-800">{note.goalAddressed}</p>
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
                  <p className="text-slate-700">{note.planNextSteps}</p>
                </div>
              </div>

              {/* Author & Signature Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 pt-1 gap-2">
                <div>
                  <span>Author: <strong className="text-slate-900">{note.authorName}</strong> ({note.authorCredentials})</span>
                  {note.signedAt && <span className="ml-2 text-[#16A34A] font-semibold">✓ Electronic Signature Verified</span>}
                </div>

                {note.status === 'approved' && note.supervisorSignature && (
                  <div className="text-[#16A34A] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cosigned by {note.supervisorName}</span>
                  </div>
                )}

                {note.status === 'pending_supervisor' && (
                  <button
                    onClick={() => setSelectedNote(note)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Review & Cosign</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No session notes found matching "{filterStatus}".
          </div>
        )}
      </div>

      {/* Supervisor Review Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-w-[calc(100vw-1.5rem)] p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 my-auto">
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 pr-6">
              <div className="p-2 sm:p-2.5 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-100 shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#1E3A8A] truncate">
                  Clinical Cosignature & QA Review
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  Peer: {selectedNote.clientName} ({selectedNote.clientIdentifier}) • Date: {selectedNote.encounterDate}
                </p>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex flex-col xs:flex-row justify-between text-slate-700 gap-1">
                <span>Specialist: <strong>{selectedNote.authorName}</strong></span>
                <span>Code: <strong>{selectedNote.billingCode} ({selectedNote.billingUnits} units)</strong></span>
              </div>
              <div className="text-slate-600">
                Setting: <strong className="text-slate-900 capitalize">{selectedNote.modality.replace('_', ' ')}</strong> ({selectedNote.durationMinutes} mins total billable time)
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical QA Notes & Feedback
              </label>
              <textarea
                rows={3}
                value={supervisorFeedback}
                onChange={(e) => setSupervisorFeedback(e.target.value)}
                placeholder="Document supervisory feedback, clinical alignment with CalAIM payment reform, or revision instructions..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supervisor Electronic Cosignature Stamp
              </label>
              <input
                type="text"
                value={cosignSignature}
                onChange={(e) => setCosignSignature(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono font-semibold"
              />
            </div>

            <div className="flex flex-col xs:flex-row justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleRequestRevision(selectedNote)}
                className="w-full xs:w-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-300 text-center"
              >
                Request Revision
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedNote)}
                className="w-full xs:w-auto px-5 py-2 bg-[#16A34A] hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5"
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
