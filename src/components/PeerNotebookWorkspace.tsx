/**
 * Peer Notebook - Main Clinical & Peer Support Specialist Workspace
 * Visual Palette: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 * CalAIM & Medi-Cal H0038 Compliant • GA #8 Verified
 * Dynamic Route Handling for /docs, /clients, /notes, /supervisor, /audit, /settings
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
import { PeerDashboardShell } from './PeerDashboardShell';
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
  Lock,
  Activity
} from 'lucide-react';

export type WorkspaceTab = 'dashboard' | 'clients' | 'notes' | 'new_note' | 'supervisor' | 'audit' | 'architecture' | 'settings';

export interface PeerNotebookWorkspaceProps {
  onTabChange?: (tab: WorkspaceTab) => void;
}

export const PeerNotebookWorkspace: React.FC<PeerNotebookWorkspaceProps> = ({ onTabChange }) => {
  const { currentOrg, canApproveNotes } = useAuth();
  
  // Parse route from window.location.pathname
  const parseRoute = (): { tab: WorkspaceTab; slug?: string } => {
    if (typeof window === 'undefined') return { tab: 'dashboard' };
    const path = window.location.pathname.toLowerCase();

    if (path === '/' || path === '' || path.startsWith('/dashboard')) return { tab: 'dashboard' };
    if (path.startsWith('/docs')) {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const slug = parts.length > 1 ? parts.slice(1).join('/') : undefined;
      return { tab: 'architecture', slug };
    }
    if (path.startsWith('/clients')) return { tab: 'clients' };
    if (path.startsWith('/notes')) return { tab: 'notes' };
    if (path.startsWith('/new-note') || path.startsWith('/new_note')) return { tab: 'new_note' };
    if (path.startsWith('/supervisor')) return { tab: 'supervisor' };
    if (path.startsWith('/audit')) return { tab: 'audit' };
    if (path.startsWith('/settings')) return { tab: 'settings' };

    return { tab: 'dashboard' };
  };

  const initialRoute = parseRoute();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialRoute.tab);
  const [docSlug, setDocSlug] = useState<string | undefined>(initialRoute.slug);
  const [selectedClientForNote, setSelectedClientForNote] = useState<Client | null>(null);
  const [selectedNoteForEdit, setSelectedNoteForEdit] = useState<SessionNote | null>(null);
  const [selectedNoteForExport, setSelectedNoteForExport] = useState<SessionNote | null>(null);

  // Notes history & Audit logs
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [notesSearch, setNotesSearch] = useState('');
  const [notesFilter, setNotesFilter] = useState('ALL');

  // Notify parent of tab changes
  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);

  // Handle browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRoute();
      setActiveTab(route.tab);
      setDocSlug(route.slug);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToTab = (tab: WorkspaceTab | string, slug?: string) => {
    setActiveTab(tab as WorkspaceTab);
    setDocSlug(slug);

    let path = '/';
    if (tab === 'dashboard') {
      path = '/';
    } else if (tab === 'architecture') {
      path = slug ? `/docs/${slug}` : '/docs';
    } else if (tab === 'clients') {
      path = '/clients';
    } else if (tab === 'notes') {
      path = '/notes';
    } else if (tab === 'new_note') {
      path = '/new-note';
    } else if (tab === 'supervisor') {
      path = '/supervisor';
    } else if (tab === 'audit') {
      path = '/audit';
    } else if (tab === 'settings') {
      path = '/settings';
    }

    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

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
    navigateToTab('new_note');
  };

  const handleEditNote = (note: SessionNote) => {
    setSelectedNoteForEdit(note);
    setSelectedClientForNote(null);
    navigateToTab('new_note');
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
    <div className="w-full max-w-full overflow-x-hidden flex flex-col">
      {/* Primary Navigation Tabs - Smooth Horizontal Touch Scroll on Mobile */}
      <div className="bg-white border-b border-slate-200 sticky top-14 sm:top-16 z-30 shadow-2xs w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full overscroll-x-contain sm:flex-wrap">
            <button
              onClick={() => navigateToTab('dashboard')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-[#0F766E] hover:text-[#0c625c] hover:bg-teal-50 bg-teal-50/60 border border-teal-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>H0038 Action Dashboard</span>
            </button>

            <button
              onClick={() => navigateToTab('clients')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'clients'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Peer Roster</span>
            </button>

            <button
              onClick={() => navigateToTab('notes')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
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
                navigateToTab('new_note');
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
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
                onClick={() => navigateToTab('supervisor')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
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
              onClick={() => navigateToTab('audit')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>HIPAA Audit Trail</span>
            </button>

            <button
              onClick={() => navigateToTab('architecture')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'architecture'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>GA #8 White Papers</span>
            </button>

            <button
              onClick={() => navigateToTab('settings')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings & BAA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'dashboard' ? (
        <PeerDashboardShell onNavigateTab={navigateToTab} />
      ) : (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden w-full">
          {activeTab === 'clients' && (
            <ClientManager onSelectClientForNote={handleStartNoteForClient} />
          )}

          {activeTab === 'new_note' && (
            <SessionNoteForm
              initialClient={selectedClientForNote}
              existingNote={selectedNoteForEdit}
              onSaveSuccess={() => {
                refreshData();
                navigateToTab('notes');
              }}
              onCancel={() => navigateToTab('notes')}
            />
          )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by peer name, ID, or CalAIM goal..."
                value={notesSearch}
                onChange={(e) => setNotesSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] shadow-2xs"
              />
            </div>

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
              <select
                value={notesFilter}
                onChange={(e) => setNotesFilter(e.target.value)}
                className="w-full xs:w-auto flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden shadow-2xs truncate"
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
                  navigateToTab('new_note');
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0"
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
                className="p-4 sm:p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
                      className={`text-[10px] xs:text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 self-start xs:self-auto ${
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

                  <div className="mt-3 p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-600 font-bold">Goal Addressed:</span>
                      <p className="text-slate-800 break-words">{note.goalAddressed}</p>
                    </div>
                    <div>
                      <span className="text-slate-600 font-bold">Peer Intervention:</span>
                      <p className="text-slate-700 line-clamp-2 leading-relaxed break-words">{note.peerIntervention}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-[#1E3A8A] font-bold text-[11px] sm:text-xs">
                    {note.billingCode} • {note.billingUnits} units (15m each)
                  </span>

                  <div className="flex items-center gap-1.5 w-full xs:w-auto justify-end">
                    <button
                      onClick={() => setSelectedNoteForExport(note)}
                      className="flex-1 xs:flex-none px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => handleEditNote(note)}
                      className="flex-1 xs:flex-none px-3 py-1 bg-teal-50 hover:bg-[#0F766E] text-[#0F766E] hover:text-white rounded-lg text-xs font-semibold transition-colors border border-teal-200 text-center"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-[#1E3A8A] text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0F766E] shrink-0" />
                Immutable HIPAA Cryptographic Audit Trail
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                45 CFR § 164.312(b) Audit Controls & 42 CFR Part 2 Confidentiality Verification
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-mono text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 font-semibold shadow-2xs">
                {auditLogs.length} Events Verified
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-w-full">
            <div className="overflow-x-auto no-scrollbar sm:overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[620px] text-left text-xs text-slate-800">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 sm:p-3.5">Timestamp</th>
                    <th className="p-3 sm:p-3.5">Actor / Specialist</th>
                    <th className="p-3 sm:p-3.5">Role</th>
                    <th className="p-3 sm:p-3.5">Action</th>
                    <th className="p-3 sm:p-3.5">Target Entity</th>
                    <th className="p-3 sm:p-3.5">Tamper-Proof Checksum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.slice(0, 25).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 sm:p-3.5 text-slate-500 whitespace-nowrap">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                      <td className="p-3 sm:p-3.5 text-slate-900 font-sans font-semibold whitespace-nowrap">{log.actorName}</td>
                      <td className="p-3 sm:p-3.5 text-[#0F766E] font-medium capitalize whitespace-nowrap">{log.actorRole.replace('_', ' ')}</td>
                      <td className="p-3 sm:p-3.5 text-[#1E3A8A] font-bold whitespace-nowrap">{log.action}</td>
                      <td className="p-3 sm:p-3.5 text-slate-700 whitespace-nowrap">{log.entityType} ({log.entityId})</td>
                      <td className="p-3 sm:p-3.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">{log.tamperProofChecksum.substring(0, 18)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 sm:hidden flex items-center justify-between">
              <span>← Swipe table horizontally →</span>
              <span>SHA-256 Tamper Evident</span>
            </div>
          </div>
        </div>
      )}

      {/* GA #8 White Papers & Specs Tab with Slug Binding */}
      {activeTab === 'architecture' && (
        <DocumentationViewer
          initialSlug={docSlug}
          onSlugChange={(slug) => {
            setDocSlug(slug);
            const path = `/docs/${slug}`;
            if (window.location.pathname !== path) {
              window.history.pushState(null, '', path);
            }
          }}
        />
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
      )}
    </div>
  );
};
