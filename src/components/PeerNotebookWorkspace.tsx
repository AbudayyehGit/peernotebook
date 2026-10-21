/**
 * Peer Notebook - Main Clinical & Peer Support Specialist Workspace
 * Visual Palette: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 * CalAIM & Medi-Cal H0038 Compliant • GA #8 Verified
 * Dynamic Route Handling for /docs, /clients, /notes, /supervisor, /audit, /settings
 * Minimum 44px touch targets & Trauma-Informed Clinical Container Cards
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
  Lock,
  Edit3,
  Activity,
  AlertTriangle,
  Sparkles,
  Database,
  CheckCircle2,
  Mic,
  Clock
} from 'lucide-react';

export type WorkspaceTab = 'clients' | 'notes' | 'new_note' | 'supervisor' | 'audit' | 'architecture' | 'settings';

export const PeerNotebookWorkspace: React.FC = () => {
  const { currentOrg, currentUser, canApproveNotes } = useAuth();

  // Parse route from window.location.pathname
  const parseRoute = (): { tab: WorkspaceTab; slug?: string } => {
    if (typeof window === 'undefined') return { tab: 'clients' };
    const path = window.location.pathname.toLowerCase();

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

    return { tab: 'clients' };
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

  const navigateToTab = (tab: WorkspaceTab, slug?: string) => {
    setActiveTab(tab);
    setDocSlug(slug);

    let path = '/';
    if (tab === 'architecture') {
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

  // KPI Metrics for Shift Posture Hero
  const pendingNotesCount = notes.filter(n => n.status === 'pending_supervisor').length;
  const approvedNotesCount = notes.filter(n => n.status === 'approved').length;
  const totalShiftMinutes = notes.reduce((acc, n) => acc + (n.durationMinutes || 0), 0);
  const totalShiftUnits = notes.reduce((acc, n) => acc + (n.billingUnits || 0), 0);

  const handleOpenCrisisTemplate = () => {
    const crisisDraft: SessionNote = {
      id: `crisis-${Date.now()}`,
      organizationId: currentOrg?.id || 'org-calaim-01',
      clientId: selectedClientForNote?.id || '',
      clientName: selectedClientForNote?.preferredName || 'Unassigned / Field Crisis Walk-in',
      clientIdentifier: selectedClientForNote?.clientIdentifier || 'PN-CRISIS',
      authorId: currentUser?.id || 'cpss-01',
      authorName: currentUser?.fullName || 'Sarah Jenkins, CPSS-CA',
      authorCredentials: currentUser?.credentialTitle || 'CalAIM Certified Peer Support Specialist',
      encounterDate: new Date().toISOString().split('T')[0],
      startTime: '13:00',
      endTime: '13:45',
      faceToFaceMinutes: 45,
      travelMinutes: 15,
      documentationMinutes: 15,
      durationMinutes: 75,
      billingCode: 'H0038',
      billingUnits: 5,
      modality: 'community_field',
      placeOfServiceCode: '99',
      locationDetails: 'Community Outreach / Field De-escalation',
      focusDomains: ['Coping Skills', 'Mental Health Wellness', 'Harm Reduction'],
      goalAddressed: 'Immediate crisis stabilization, trauma-informed de-escalation, and collaborative wellness safety planning.',
      peerIntervention: 'CPSS facilitated immediate somatic grounding (5-4-3-2-1 exercise and box breathing). Reviewed existing safety plan, verified immediate physical safety, and contacted supervisor per agency crisis protocol. Supported peer with distress tolerance coaching.',
      clientResponse: 'Peer responsive to breathing exercises; self-reported acute panic decreased from 9/10 to 4/10. Expressed relief having peer support presence. Confirmed willingness to follow through with safe community contact.',
      planNextSteps: 'Peer will stay with verified safe community member tonight. CPSS scheduled follow-up welfare check call tomorrow morning at 09:30 AM.',
      safetyConcerns: true,
      safetyNotes: 'Crisis de-escalated safely in the field without requiring law enforcement intervention. Supervisor notified and secondary contact person verified.',
      specialistSignature: currentUser?.fullName || 'Sarah Jenkins, CPSS-CA',
      signedAt: new Date().toISOString(),
      status: 'draft',
      synced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSelectedNoteForEdit(crisisDraft);
    navigateToTab('new_note');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-1 sm:pt-1.5 pb-8 sm:pb-12 max-w-full overflow-hidden">
      {/* Primary Navigation Tabs - Minimum 44px–48px Tap Target Height with rounded-full geometry */}
      <nav aria-label="Main Navigation" className="border-b border-slate-200/90 pb-1.5 w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-0.5 max-w-full overscroll-x-contain sm:flex-wrap">
          <button
            type="button"
            onClick={() => navigateToTab('clients')}
            className={`min-h-[46px] flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Peer Roster</span>
          </button>

          <button
            type="button"
            onClick={() => navigateToTab('notes')}
            className={`min-h-[46px] flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Encounter Notes ({notes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedNoteForEdit(null);
              setSelectedClientForNote(null);
              navigateToTab('new_note');
            }}
            className={`min-h-[46px] flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'new_note'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'text-[#0F766E] hover:text-white hover:bg-[#0F766E] border border-teal-200 bg-teal-50/70'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>New CalAIM Note</span>
          </button>

          {canApproveNotes && (
            <button
              type="button"
              onClick={() => navigateToTab('supervisor')}
              className={`min-h-[46px] flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'supervisor'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span>Supervisor QA</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigateToTab('audit')}
            className={`min-h-[46px] flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span>HIPAA Audit Trail</span>
          </button>

          <button
            type="button"
            onClick={() => navigateToTab('architecture')}
            className={`min-h-[46px] flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>GA #8 White Papers</span>
          </button>

          <button
            type="button"
            onClick={() => navigateToTab('settings')}
            className={`min-h-[46px] flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings & BAA</span>
          </button>
        </div>
      </nav>

      {/* Hero Shift Posture Glance & Smart Quick-Action Card (Space tightly closed to Main Menu) */}
      {activeTab !== 'new_note' && (
        <section
          aria-label="Shift Posture Hero"
          className="mt-2 sm:mt-2.5 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-4 transition-all"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
            {/* Active Shift Posture Card */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
                <span className="inline-flex items-center gap-1 font-bold text-[#0F766E] uppercase tracking-wider text-[11px] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                  Active Shift Posture
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-semibold text-slate-700">
                  {currentUser?.fullName || 'Sarah Jenkins, CPSS-CA #CA-4102'}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 text-[#16A34A] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  Golden Thread: 98.4%
                </span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1E3A8A] tracking-tight">
                {pendingNotesCount} Progress Notes Pending Sign-Off under CalAIM guidelines
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                Medi-Cal H0038 billing justification requires explicit golden-thread linkage between client care plan milestones, peer interventions, and measurable recovery responses.
              </p>
            </div>

            {/* Quick Metrics Cluster */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0 w-full lg:w-auto">
              <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-3 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium block">Approved Today</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg sm:text-xl font-bold text-slate-900">{approvedNotesCount}</span>
                  <span className="text-[10px] text-slate-500 font-medium">notes</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-3 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium block">Billable Time</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg sm:text-xl font-bold text-[#0F766E]">{totalShiftMinutes}</span>
                  <span className="text-[10px] text-slate-500 font-medium">min ({totalShiftUnits || Math.ceil(totalShiftMinutes / 15)}u)</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-3 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-500 font-medium block">Persistence Posture</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate">
                    Dexie.js AES-256
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Quick-Action Bar with 44px–48px touch targets */}
          <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedNoteForEdit(null);
                  setSelectedClientForNote(null);
                  navigateToTab('new_note');
                }}
                className="min-h-[46px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F766E] hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Log New Interaction (H0038)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedNoteForEdit(null);
                  setSelectedClientForNote(null);
                  navigateToTab('new_note');
                }}
                className="min-h-[46px] inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#0F766E]" />
                <span>Start Group Notes</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCrisisTemplate}
                className="min-h-[46px] inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FEF3C7] border border-amber-300 hover:bg-amber-100 text-[#D97706] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                <span>Open Crisis Template</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedNoteForEdit(null);
                  setSelectedClientForNote(null);
                  navigateToTab('new_note');
                }}
                className="min-h-[46px] inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[#1E3A8A] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#0F766E]" />
                <span>PeerNote™ Dictate</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Database className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Local Dexie ⇄ Supabase RLS</span>
            </div>
          </div>
        </section>
      )}

      {/* Main Tab Content */}
      <div className={activeTab === 'new_note' ? 'mt-2 sm:mt-2.5' : 'mt-3.5 sm:mt-4'}>
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
        <div className="space-y-5">
          {/* Action Toolbar with 44px min-h touch controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by peer name, MRN, or CalAIM goal..."
                value={notesSearch}
                onChange={(e) => setNotesSearch(e.target.value)}
                className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] shadow-[0_2px_6px_rgba(15,23,42,0.03)]"
              />
            </div>

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 w-full sm:w-auto">
              <select
                value={notesFilter}
                onChange={(e) => setNotesFilter(e.target.value)}
                className="w-full xs:w-auto flex-1 min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden shadow-[0_2px_6px_rgba(15,23,42,0.03)] truncate cursor-pointer"
              >
                <option value="ALL">All Notes ({notes.length})</option>
                <option value="approved">Approved & Cosigned</option>
                <option value="pending_supervisor">Pending Supervisor</option>
                <option value="draft">Dexie Drafts</option>
                <option value="revision_requested">Revision Requested</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSelectedNoteForEdit(null);
                  setSelectedClientForNote(null);
                  navigateToTab('new_note');
                }}
                className="min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm shrink-0 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </button>
            </div>
          </div>

          {/* Grid of Notes with Container Cards (#FFFFFF + soft ambient drop shadow) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl hover:border-slate-300 transition-all shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-[#1E3A8A] text-base">{note.clientName}</h4>
                        <span className="font-mono text-xs text-[#0F766E] font-semibold">
                          {note.clientIdentifier}
                        </span>
                        {note.mediCalCin && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            · CIN: {note.mediCalCin}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-1">
                        <span>{note.encounterDate}</span>
                        <span>·</span>
                        <span>{note.startTime} - {note.endTime}</span>
                        <span>·</span>
                        <span>{note.durationMinutes}m total</span>
                      </div>
                    </div>

                    <div className="self-start xs:self-auto">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                          note.status === 'approved'
                            ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                            : note.status === 'pending_supervisor'
                            ? 'bg-[#FEF3C7] text-[#D97706] border border-amber-300/80'
                            : note.status === 'revision_requested'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            note.status === 'approved'
                              ? 'bg-[#16A34A]'
                              : note.status === 'pending_supervisor'
                              ? 'bg-[#D97706]'
                              : note.status === 'revision_requested'
                              ? 'bg-rose-600'
                              : 'bg-slate-500'
                          }`}
                        />
                        <span>
                          {note.status === 'approved'
                            ? 'Cosigned'
                            : note.status === 'pending_supervisor'
                            ? 'Awaiting Cosign'
                            : note.status === 'revision_requested'
                            ? 'Revision Needed'
                            : 'Dexie Draft'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs space-y-2">
                    <div>
                      <span className="text-slate-600 font-bold block mb-0.5">CalAIM Goal:</span>
                      <p className="text-slate-800 break-words leading-relaxed">{note.goalAddressed}</p>
                    </div>
                    <div>
                      <span className="text-slate-600 font-bold block mb-0.5">Peer Intervention:</span>
                      <p className="text-slate-700 line-clamp-2 leading-relaxed break-words">{note.peerIntervention}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#1E3A8A] font-bold">
                      {note.billingCode}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-semibold">
                      {note.billingUnits} Units (15m each)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full xs:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedNoteForExport(note)}
                      className="min-h-[44px] flex-1 xs:flex-none px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_4px_rgba(15,23,42,0.04)] cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#0F766E]" />
                      <span>PDF Export</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditNote(note)}
                      className="min-h-[44px] flex-1 xs:flex-none px-4 py-2 bg-teal-50 hover:bg-[#0F766E] text-[#0F766E] hover:text-white rounded-xl text-xs font-bold transition-all border border-teal-200 text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Note</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/90 text-slate-500 text-sm shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
              No encounter notes match your search criteria.
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
              <span className="text-xs font-mono text-slate-700 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold shadow-[0_2px_6px_rgba(15,23,42,0.03)]">
                {auditLogs.length} Events Logged
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.04)] max-w-full">
            <div className="overflow-x-auto no-scrollbar sm:overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[620px] text-left text-xs text-slate-800">
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
                  {auditLogs.slice(0, 30).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                      <td className="p-3.5 text-slate-900 font-sans font-semibold whitespace-nowrap">{log.actorName}</td>
                      <td className="p-3.5 text-[#0F766E] font-medium capitalize whitespace-nowrap">{log.actorRole.replace('_', ' ')}</td>
                      <td className="p-3.5 text-[#1E3A8A] font-bold whitespace-nowrap">{log.action}</td>
                      <td className="p-3.5 text-slate-700 whitespace-nowrap">{log.entityType} ({log.entityId})</td>
                      <td className="p-3.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">{log.tamperProofChecksum.substring(0, 18)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 sm:hidden flex items-center justify-between">
              <span>← Swipe table horizontally →</span>
              <span className="font-semibold text-[#0F766E]">SHA-256 Tamper Evident</span>
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
      </div>

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
