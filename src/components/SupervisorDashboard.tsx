/**
 * Peer Notebook - Clinical Supervisor Review & Cosign Dashboard
 * Conforms to Medicaid Cosignature Mandates & GA8 Technical Specifications
 */

import React, { useState, useEffect } from 'react';
import { peerNotebookDB, SessionNote } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { AuditLogger } from '../services/auditLogger';
import { syncWorker } from '../services/syncWorker';
import { ShieldCheck, FileCheck, CheckCircle2, Clock, AlertCircle, MessageSquare, Download, Filter, FileText, Check } from 'lucide-react';
import { ExportSessionPDF } from './ExportSessionPDF';

export const SupervisorDashboard: React.FC = () => {
  const { currentOrg, currentUser, canApproveNotes } = useAuth();
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<SessionNote | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pending_supervisor');
  const [supervisorFeedback, setSupervisorFeedback] = useState<string>('');
  const [cosignSignature, setCosignSignature] = useState<string>(
    currentUser?.fullName ? `${currentUser.fullName} [Supervisor Cosigned]` : 'Dr. Sarah Jenkins, LICSW [Cosigned]'
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
      supervisorFeedback: supervisorFeedback.trim() || 'Reviewed and approved for Medicaid compliance.',
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
      alert('Please provide feedback for the peer specialist before requesting revision.');
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
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Awaiting Cosign</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-amber-400">{pendingNotes.length}</span>
            <Clock className="w-5 h-5 text-amber-400/80" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Requires clinical review</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Approved & Cosigned</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-400">{approvedNotes.length}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400/80" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Medicaid claim ready</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Total Billing Units</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-400">{totalUnits}</span>
            <FileText className="w-5 h-5 text-blue-400/80" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">H0038 (15m increments)</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-400 block mb-1">Safety Risk Flags</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-rose-400">{safetyCount}</span>
            <AlertCircle className="w-5 h-5 text-rose-400/80" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Requires safety protocol</span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-white text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          Supervisor Sign-Off & QA Queue
        </h3>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden"
          >
            <option value="pending_supervisor">Pending Cosignature ({pendingNotes.length})</option>
            <option value="approved">Approved / Cosigned ({approvedNotes.length})</option>
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
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-white text-base">{note.clientName}</span>
                  <span className="font-mono text-xs text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded">
                    {note.clientIdentifier}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      note.status === 'pending_supervisor'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : note.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {note.status === 'pending_supervisor'
                      ? 'Needs Review'
                      : note.status === 'approved'
                      ? 'Cosigned'
                      : 'Revision'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Encounter: <strong className="text-slate-200">{note.encounterDate}</strong></span>
                  <span>•</span>
                  <span>Units: <strong className="text-blue-300 font-mono">{note.billingUnits} (H0038)</strong></span>
                  <button
                    onClick={() => setExportNote(note)}
                    className="ml-2 flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs transition-colors"
                  >
                    <Download className="w-3 h-3 text-teal-400" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* Note Content Snapshot */}
              <div className="bg-slate-850/70 p-3.5 rounded-lg border border-slate-800/80 text-xs space-y-2">
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Recovery Goal Addressed:</span>
                  <p className="text-slate-200">{note.goalAddressed}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Peer Intervention (CPSS):</span>
                  <p className="text-slate-300 leading-relaxed">{note.peerIntervention}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Client Response:</span>
                  <p className="text-slate-300 leading-relaxed">{note.clientResponse}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Plan & Next Steps:</span>
                  <p className="text-slate-300">{note.planNextSteps}</p>
                </div>
              </div>

              {/* Author & Signature Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 pt-1 gap-2">
                <div>
                  <span>Author: <strong className="text-slate-200">{note.authorName}</strong> ({note.authorCredentials})</span>
                  {note.signedAt && <span className="ml-2 text-emerald-400">✓ Signed electronically</span>}
                </div>

                {note.status === 'approved' && note.supervisorSignature && (
                  <div className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cosigned by {note.supervisorName}</span>
                  </div>
                )}

                {note.status === 'pending_supervisor' && (
                  <button
                    onClick={() => setSelectedNote(note)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition-colors"
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
          <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-sm">
            No session notes found matching "{filterStatus}".
          </div>
        )}
      </div>

      {/* Supervisor Review Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Clinical Cosignature & Quality Review
                </h3>
                <p className="text-xs text-slate-400">
                  Peer: {selectedNote.clientName} ({selectedNote.clientIdentifier}) • Date: {selectedNote.encounterDate}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Specialist: <strong>{selectedNote.authorName}</strong></span>
                <span>Code: <strong>{selectedNote.billingCode} ({selectedNote.billingUnits} units)</strong></span>
              </div>
              <div className="text-slate-400">
                Modality: <strong className="text-slate-200 capitalize">{selectedNote.modality.replace('_', ' ')}</strong> ({selectedNote.durationMinutes} mins)
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Supervisor Feedback / QA Notes
              </label>
              <textarea
                rows={3}
                value={supervisorFeedback}
                onChange={(e) => setSupervisorFeedback(e.target.value)}
                placeholder="Add clinical observation, documentation commendation, or specific revision directives..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Supervisor Electronic Cosignature Stamp
              </label>
              <input
                type="text"
                value={cosignSignature}
                onChange={(e) => setCosignSignature(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleRequestRevision(selectedNote)}
                className="px-4 py-2 bg-rose-900/60 hover:bg-rose-900 text-rose-200 rounded-lg text-xs font-medium border border-rose-700/60"
              >
                Request Revision
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedNote)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cosign & Approve</span>
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
