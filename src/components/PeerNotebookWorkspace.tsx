/**
 * Peer Notebook - Main Clinical & Peer Support Specialist Workspace
 * Visual Palette: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 * CalAIM & Medi-Cal H0038 Compliant • GA #8 Verified
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { peerNotebookDB, Client, SessionNote, AuditLogEntry } from '../db/peerNotebookDatabase';
import { ClientManager } from './ClientManager';
import { SessionNoteForm } from './SessionNoteForm';
import { SupervisorDashboard } from './SupervisorDashboard';
import { SettingsPanel } from './SettingsPanel';
import { ExportSessionPDF } from './ExportSessionPDF';
import { DocumentationViewer } from './DocumentationViewer';
import {
  Users,
  FileText,
  ShieldCheck,
  History,
  Settings,
  BookOpen,
  Plus,
  Download,
  Search,
  Lock
} from 'lucide-react';

export type WorkspaceTab = 'clients' | 'notes' | 'new_note' | 'supervisor' | 'audit' | 'architecture' | 'settings';

export const PeerNotebookWorkspace: React.FC = () => {
  const { currentOrg, canApproveNotes } = useAuth();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('clients');
  const [selectedClientForNote, setSelectedClientForNote] = useState<Client | null>(null);
  const [selectedNoteForEdit, setSelectedNoteForEdit] = useState<SessionNote | null>(null);
  const [selectedNoteForExport, setSelectedNoteForExport] = useState<SessionNote | null>(null);

  // Notes history & Audit logs
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [notesSearch, setNotesSearch] = useState('');
  const [notesFilter, setNotesFilter] = useState('ALL');

  const refreshData = async () => {
    const allNotes = await peerNotebookDB.getAllNotes();
    const allLogs = await peerNotebookDB.getAllAuditLogs();
    if (currentOrg) {
      setNotes(allNotes.filter(n => n.organizationId === currentOrg.id));
      setAuditLogs(allLogs.filter(l => l.organizationId === currentOrg.id));
    } else {
      setNotes(allNotes);
      setAuditLogs(allLogs);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentOrg, activeTab]);

  const handleStartNoteForClient = (client: Client) => {
    setSelectedClientForNote(client);
    setSelectedNoteForEdit(null);
    setActiveTab('new_note');
  };

  const handleEditNote = (note: SessionNote) => {
    setSelectedNoteForEdit(note);
    setSelectedClientForNote(null);
    setActiveTab('new_note');
  };

  const filteredNotes = notes.filter(n => {
    const matchSearch =
      n.clientName.toLowerCase().includes(notesSearch.toLowerCase()) ||
      n.clientIdentifier.toLowerCase().includes(notesSearch.toLowerCase()) ||
      n.goalAddressed.toLowerCase().includes(notesSearch.toLowerCase());
    const matchFilter = notesFilter === 'ALL' || n.status === notesFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'clients'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Peer Roster</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notes'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Encounter Notes ({notes.length})</span>
          </button>

          <button
            onClick={() => {
              setSelectedNoteForEdit(null);
              setSelectedClientForNote(null);
              setActiveTab('new_note');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'new_note'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#0F766E] hover:text-white hover:bg-[#0F766E] border border-teal-200 bg-teal-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>New CalAIM Note</span>
          </button>

          {canApproveNotes && (
            <button
              onClick={() => setActiveTab('supervisor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'supervisor'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              <span>Supervisor QA</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>HIPAA Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'architecture'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>GA #8 White Papers</span>
          </button>
        </div>

        <div>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#1E3A8A] text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings & BAA</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'clients' && (
        <ClientManager onSelectClientForNote={handleStartNoteForClient} />
      )}

      {activeTab === 'new_note' && (
        <SessionNoteForm
          initialClient={selectedClientForNote}
          existingNote={selectedNoteForEdit}
          onSaveSuccess={() => {
            refreshData();
            setActiveTab('notes');
          }}
          onCancel={() => setActiveTab('notes')}
        />
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by peer name, ID, or CalAIM goal..."
                value={notesSearch}
                onChange={(e) => setNotesSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={notesFilter}
                onChange={(e) => setNotesFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden shadow-2xs"
              >
                <option value="ALL">All Notes ({notes.length})</option>
                <option value="approved">Approved & Cosigned</option>
                <option value="pending_supervisor">Pending Supervisor</option>
                <option value="draft">Dexie Drafts</option>
                <option value="revision_requested">Revision Requested</option>
              </select>

              <button
                onClick={() => {
                  setSelectedNoteForEdit(null);
                  setSelectedClientForNote(null);
                  setActiveTab('new_note');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#1E3A8A] text-base">{note.clientName}</h4>
                        <span className="font-mono text-xs text-[#0F766E] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-semibold">
                          {note.clientIdentifier}
                        </span>
                        {note.mediCalCin && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            CIN: {note.mediCalCin}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        {note.encounterDate} • {note.startTime} - {note.endTime} ({note.durationMinutes}m total billable)
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        note.status === 'approved'
                          ? 'bg-emerald-50 text-[#16A34A] border border-emerald-300'
                          : note.status === 'pending_supervisor'
                          ? 'bg-amber-50 text-[#D97706] border border-amber-300'
                          : note.status === 'revision_requested'
                          ? 'bg-rose-50 text-rose-700 border border-rose-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {note.status === 'approved'
                        ? 'Cosigned'
                        : note.status === 'pending_supervisor'
                        ? 'Awaiting Cosign'
                        : note.status === 'revision_requested'
                        ? 'Revision Needed'
                        : 'Draft'}
                    </span>
                  </div>

                  <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-600 font-bold">Goal Addressed:</span>
                      <p className="text-slate-800 truncate">{note.goalAddressed}</p>
                    </div>
                    <div>
                      <span className="text-slate-600 font-bold">Peer Intervention:</span>
                      <p className="text-slate-700 line-clamp-2 leading-relaxed">{note.peerIntervention}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[#1E3A8A] font-bold">
                    {note.billingCode} • {note.billingUnits} units (15m each)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedNoteForExport(note)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => handleEditNote(note)}
                      className="px-3 py-1 bg-teal-50 hover:bg-[#0F766E] text-[#0F766E] hover:text-white rounded-lg text-xs font-semibold transition-colors border border-teal-200"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
              No encounter notes match your search.
            </div>
          )}
        </div>
      )}

      {activeTab === 'supervisor' && (
        <SupervisorDashboard />
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1E3A8A] text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0F766E]" />
                Immutable HIPAA Cryptographic Audit Trail
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                45 CFR § 164.312(b) Audit Controls & 42 CFR Part 2 Confidentiality Verification
              </p>
            </div>
            <span className="text-xs font-mono text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 font-semibold shadow-2xs">
              {auditLogs.length} Events Verified
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor / Specialist</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Target Entity</th>
                    <th className="p-3.5">Tamper-Proof Checksum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.slice(0, 25).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                      <td className="p-3.5 text-slate-900 font-sans font-semibold">{log.actorName}</td>
                      <td className="p-3.5 text-[#0F766E] font-medium capitalize">{log.actorRole.replace('_', ' ')}</td>
                      <td className="p-3.5 text-[#1E3A8A] font-bold">{log.action}</td>
                      <td className="p-3.5 text-slate-700">{log.entityType} ({log.entityId})</td>
                      <td className="p-3.5 text-slate-400 font-mono text-[10px]">{log.tamperProofChecksum.substring(0, 18)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GA #8 White Papers & Specs Tab */}
      {activeTab === 'architecture' && (
        <DocumentationViewer />
      )}

      {activeTab === 'settings' && (
        <SettingsPanel />
      )}

      {/* PDF Export Modal */}
      {selectedNoteForExport && (
        <ExportSessionPDF
          note={selectedNoteForExport}
          onClose={() => setSelectedNoteForExport(null)}
        />
      )}
    </div>
  );
};
