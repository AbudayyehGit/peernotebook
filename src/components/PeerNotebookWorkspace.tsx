/**
 * Peer Notebook - Main Clinical & Peer Support Specialist Workspace
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { peerNotebookDB, Client, SessionNote, AuditLogEntry } from '../db/peerNotebookDatabase';
import { ClientManager } from './ClientManager';
import { SessionNoteForm } from './SessionNoteForm';
import { SupervisorDashboard } from './SupervisorDashboard';
import { SettingsPanel } from './SettingsPanel';
import { ExportSessionPDF } from './ExportSessionPDF';
import {
  Users,
  FileText,
  ShieldCheck,
  History,
  Settings,
  BookOpen,
  Plus,
  Clock,
  Download,
  Search,
  ExternalLink,
  Lock,
  Cpu,
  CheckCircle2
} from 'lucide-react';

export type WorkspaceTab = 'clients' | 'notes' | 'new_note' | 'supervisor' | 'audit' | 'architecture' | 'settings';

export const PeerNotebookWorkspace: React.FC = () => {
  const { currentOrg, currentUser, role, canApproveNotes } = useAuth();
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
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'clients'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Peer Roster</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'new_note'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-400 hover:text-white hover:bg-blue-950/40 border border-blue-900/60'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>New Encounter Note</span>
          </button>

          {canApproveNotes && (
            <button
              onClick={() => setActiveTab('supervisor')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'supervisor'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Supervisor QA</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <History className="w-4 h-4" />
            <span>HIPAA Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'architecture'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>GA8 Specs</span>
          </button>
        </div>

        <div>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
                placeholder="Filter by peer name, ID, or goal..."
                value={notesSearch}
                onChange={(e) => setNotesSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={notesFilter}
                onChange={(e) => setNotesFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden"
              >
                <option value="ALL">All Notes ({notes.length})</option>
                <option value="approved">Approved & Cosigned</option>
                <option value="pending_supervisor">Pending Supervisor</option>
                <option value="draft">Drafts</option>
                <option value="revision_requested">Revision Requested</option>
              </select>

              <button
                onClick={() => {
                  setSelectedNoteForEdit(null);
                  setSelectedClientForNote(null);
                  setActiveTab('new_note');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
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
                className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white text-base">{note.clientName}</h4>
                        <span className="font-mono text-xs text-blue-400 bg-blue-950/60 border border-blue-800/60 px-1.5 py-0.5 rounded">
                          {note.clientIdentifier}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {note.encounterDate} • {note.startTime} - {note.endTime} ({note.durationMinutes}m)
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        note.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : note.status === 'pending_supervisor'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : note.status === 'revision_requested'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
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

                  <div className="mt-3 p-3 bg-slate-850/80 rounded-lg border border-slate-800 text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-400 font-medium">Goal:</span>
                      <p className="text-slate-200 truncate">{note.goalAddressed}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Intervention:</span>
                      <p className="text-slate-300 line-clamp-2 leading-relaxed">{note.peerIntervention}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-blue-300">
                    {note.billingCode} • {note.billingUnits} units
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedNoteForExport(note)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs flex items-center gap-1"
                    >
                      <Download className="w-3 h-3 text-teal-400" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => handleEditNote(note)}
                      className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-xs transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-sm">
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
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Immutable HIPAA Security Audit Trail
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                45 CFR § 164.312(b) Cryptographic Event Provenance
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded border border-slate-800">
              {auditLogs.length} Events Logged
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor / Specialist</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Entity</th>
                    <th className="p-3">Tamper-Proof Checksum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {auditLogs.slice(0, 20).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                      <td className="p-3 text-white font-sans font-medium">{log.actorName}</td>
                      <td className="p-3 text-emerald-400 capitalize">{log.actorRole.replace('_', ' ')}</td>
                      <td className="p-3 text-blue-300 font-semibold">{log.action}</td>
                      <td className="p-3 text-slate-300">{log.entityType} ({log.entityId})</td>
                      <td className="p-3 text-slate-500 font-mono text-[10px]">{log.tamperProofChecksum.substring(0, 16)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">GA8 Architecture & Specification White Paper</h3>
              <p className="text-xs text-slate-400">Offline-First Clinical Documentation Standard for Peer Support Specialists</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm space-y-4 leading-relaxed">
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm">1. Executive Overview & Problem Statement</h4>
              <p>
                Peer Support Specialists frequently work in non-traditional clinical environments: community centers, public libraries, emergency department recovery lounges, and street outreach encounters where cellular connectivity is erratic or unavailable. Conventional EHR systems fail because they require persistent cloud connections and crash or lose clinical notes during disconnects.
              </p>
              <p>
                Peer Notebook resolves this via an <strong>Offline-First IndexedDB Architecture</strong> that stores and cryptographically validates all encounter notes locally before safely queuing them for central synchronization.
              </p>
            </div>

            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm">2. Medicaid H0038 Billing Unit Engine</h4>
              <p>
                Medicaid procedure code <strong>H0038</strong> (Self-Help / Peer Support Services) is billed in 15-minute increments (8-22 mins = 1 unit, 23-37 mins = 2 units, 38-52 mins = 3 units, 53-67 mins = 4 units). Peer Notebook automatically calculates exact billing units, verifies modality (Community/Field vs. Face-to-Face Clinic), and captures required supervisor cosignatures.
              </p>
            </div>

            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm">3. HIPAA Security & 42 CFR Part 2 Protections</h4>
              <p>
                To safeguard individuals in substance use recovery, clients are identified by pseudonymized Medical Record Numbers (MRNs like PN-4091). Every client record view and note signature generates an immutable SHA-256 audit entry satisfying 45 CFR § 164.312(b).
              </p>
            </div>
          </div>
        </div>
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
