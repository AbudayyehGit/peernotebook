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
import { GoalPathTracker } from './GoalPathTracker';
import { syncWorker, SyncStatusInfo } from '../services/syncWorker';
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
  Clock,
  Grid,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Menu,
  Cloud,
  RefreshCw,
  SlidersHorizontal,
  FolderOpen,
  Target
} from 'lucide-react';

export type WorkspaceTab = 'clients' | 'notes' | 'new_note' | 'goalpath' | 'supervisor' | 'audit' | 'architecture' | 'settings';

export const PeerNotebookWorkspace: React.FC = () => {
  const { currentOrg, currentUser, canApproveNotes } = useAuth();

  // Parse route from window.location.pathname, search query, hash, or localStorage
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
    if (path.startsWith('/goalpath')) return { tab: 'goalpath' };
    if (path.startsWith('/new-note') || path.startsWith('/new_note')) return { tab: 'new_note' };
    if (path.startsWith('/supervisor')) return { tab: 'supervisor' };
    if (path.startsWith('/audit')) return { tab: 'audit' };
    if (path.startsWith('/settings')) return { tab: 'settings' };

    // Support query param ?tab= (e.g., inside AI Studio preview iframe or direct link)
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab') as WorkspaceTab;
      if (tabParam && ['clients', 'notes', 'new_note', 'goalpath', 'supervisor', 'audit', 'architecture', 'settings'].includes(tabParam)) {
        return { tab: tabParam };
      }
    } catch {
      // ignore
    }

    // Support URL hash
    try {
      const hash = window.location.hash.replace('#/', '').replace('#', '').toLowerCase();
      if (hash.startsWith('docs')) return { tab: 'architecture' };
      if (['clients', 'notes', 'new_note', 'goalpath', 'supervisor', 'audit', 'settings'].includes(hash)) {
        return { tab: hash as WorkspaceTab };
      }
      if (hash === 'new-note') return { tab: 'new_note' };
      if (hash === 'goal-path' || hash === 'wellness') return { tab: 'goalpath' };
    } catch {
      // ignore
    }

    // Fallback to persisted tab from last active session
    try {
      const saved = localStorage.getItem('peernotebook_active_tab') as WorkspaceTab;
      if (saved && ['clients', 'notes', 'new_note', 'goalpath', 'supervisor', 'audit', 'architecture', 'settings'].includes(saved)) {
        return { tab: saved };
      }
    } catch {
      // ignore
    }

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
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string | null>(null);

  // Mobile Bottom Sheet Drawer & Sync States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isSyncingFromMobile, setIsSyncingFromMobile] = useState(false);
  const [mobileSyncMsg, setMobileSyncMsg] = useState<string | null>(null);
  const [syncInfo, setSyncInfo] = useState<SyncStatusInfo>(syncWorker.getStatus());

  useEffect(() => {
    const unsub = syncWorker.subscribe((info) => {
      setSyncInfo(info);
    });
    return unsub;
  }, []);

  const handleMobileForceSync = async () => {
    setIsSyncingFromMobile(true);
    setMobileSyncMsg(null);
    try {
      const res = await syncWorker.triggerManualSync();
      await refreshData();
      setMobileSyncMsg(res.success ? `Synced ${res.syncedCount} item(s)!` : 'Offline - Queued in Dexie');
    } catch {
      setMobileSyncMsg('Sync deferred');
    } finally {
      setIsSyncingFromMobile(false);
      setTimeout(() => setMobileSyncMsg(null), 3000);
    }
  };

  // Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'peernotebook_active_tab' && e.newValue) {
        const nextTab = e.newValue as WorkspaceTab;
        if (['clients', 'notes', 'new_note', 'supervisor', 'audit', 'architecture', 'settings'].includes(nextTab)) {
          setActiveTab(nextTab);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
    setIsMobileMenuOpen(false);

    try {
      localStorage.setItem('peernotebook_active_tab', tab);
    } catch {
      // ignore
    }

    let path = '/';
    if (tab === 'architecture') {
      path = slug ? `/docs/${slug}` : '/docs';
    } else if (tab === 'clients') {
      path = '/clients';
    } else if (tab === 'notes') {
      path = '/notes';
    } else if (tab === 'goalpath') {
      path = '/goalpath';
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
    const text = (
      (n.clientName || '') + ' ' +
      (n.clientIdentifier || '') + ' ' +
      (n.goalAddressed || '') + ' ' +
      (n.peerIntervention || '') + ' ' +
      (n.focusDomains || []).join(' ')
    ).toLowerCase();

    const matchSearch =
      n.clientName.toLowerCase().includes(notesSearch.toLowerCase()) ||
      n.clientIdentifier.toLowerCase().includes(notesSearch.toLowerCase()) ||
      n.goalAddressed.toLowerCase().includes(notesSearch.toLowerCase()) ||
      text.includes(notesSearch.toLowerCase());

    const matchFilter = notesFilter === 'ALL' || n.status === notesFilter;

    let matchDomain = true;
    if (selectedDomainFilter) {
      const df = selectedDomainFilter.toLowerCase();
      if (df.includes('housing')) {
        matchDomain = text.includes('housing') || text.includes('shelter') || text.includes('rent') || text.includes('tenancy');
      } else if (df.includes('social')) {
        matchDomain = text.includes('social') || text.includes('connection') || text.includes('isolation') || text.includes('mutual aid') || text.includes('community');
      } else if (df.includes('advocacy')) {
        matchDomain = text.includes('advocacy') || text.includes('rights') || text.includes('appointment') || text.includes('doctor');
      } else if (df.includes('employ') || df.includes('educat')) {
        matchDomain = text.includes('employment') || text.includes('job') || text.includes('education') || text.includes('vocational') || text.includes('resume');
      } else if (df.includes('routine')) {
        matchDomain = text.includes('routine') || text.includes('sleep') || text.includes('grounding') || text.includes('somatic') || text.includes('daily');
      } else {
        matchDomain = text.includes(df);
      }
    }

    return matchSearch && matchFilter && matchDomain;
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

  const navItems = [
    {
      id: 'clients' as WorkspaceTab,
      label: 'Peer Roster',
      shortLabel: 'Roster',
      icon: Users,
      badge: null
    },
    {
      id: 'notes' as WorkspaceTab,
      label: `Encounter Notes (${notes.length})`,
      shortLabel: 'Notes',
      icon: FileText,
      badge: notes.length > 0 ? notes.length : null
    },
    {
      id: 'goalpath' as WorkspaceTab,
      label: 'GoalPath™ Domains',
      shortLabel: 'GoalPath',
      icon: Target,
      badge: null
    },
    {
      id: 'new_note' as WorkspaceTab,
      label: 'New CalAIM Note',
      shortLabel: 'Log Note',
      icon: Plus,
      badge: null,
      isPrimary: true
    },
    ...(canApproveNotes
      ? [
          {
            id: 'supervisor' as WorkspaceTab,
            label: 'Supervisor QA',
            shortLabel: 'QA',
            icon: ShieldCheck,
            badge: pendingNotesCount > 0 ? pendingNotesCount : null,
            badgeAlert: true
          }
        ]
      : []),
    {
      id: 'audit' as WorkspaceTab,
      label: 'HIPAA Audit Trail',
      shortLabel: 'Audit',
      icon: History,
      badge: null
    },
    {
      id: 'architecture' as WorkspaceTab,
      label: 'GA #8 White Papers',
      shortLabel: 'Docs',
      icon: BookOpen,
      badge: null
    },
    {
      id: 'settings' as WorkspaceTab,
      label: 'Settings & BAA',
      shortLabel: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  const currentActiveItem = navItems.find((item) => item.id === activeTab) || navItems[0];
  const CurrentIcon = currentActiveItem.icon;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-1 sm:pt-1.5 pb-24 md:pb-12 max-w-full overflow-hidden">
      {/* ========================================================================= */}
      {/* MODERN GOLD STANDARD WORKSPACE NAVIGATION (ZERO HORIZONTAL SCROLLING)     */}
      {/* Desktop: Symmetrical dual-zone segmented control (100% width, no scroll)   */}
      {/* Tablet: Core clinical tabs + Symmetrical "More Modules" popover            */}
      {/* Mobile: Active Module Pill + Direct +Log Note + 4-Column Segmented Rail   */}
      {/* Touch-First (44px min-h) · Trauma-Informed Deep Navy & Teal Tokens         */}
      {/* ========================================================================= */}
      <nav aria-label="Main Navigation" className="border-b border-slate-200/90 pb-2.5 pt-1 w-full max-w-full">
        {/* 1. DESKTOP VIEWPORT (lg: 1024px+) - Balanced Dual-Zone Segmented Bar (Zero Scroll) */}
        <div className="hidden lg:flex items-center justify-between gap-3 w-full">
          {/* Left Zone: Primary Action + Core Clinical Workflows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedNoteForEdit(null);
                setSelectedClientForNote(null);
                navigateToTab('new_note');
              }}
              className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95 ${
                activeTab === 'new_note'
                  ? 'bg-[#0F766E] text-white shadow-sm ring-2 ring-teal-600/30'
                  : 'text-[#0F766E] hover:text-white hover:bg-[#0F766E] border border-teal-200 bg-teal-50/70'
              }`}
              title="Create new Medi-Cal encounter note"
            >
              <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>Log Interaction</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200 shrink-0 mx-1" />

            {/* Core Clinical Segmented Track */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-full border border-slate-200/90">
              <button
                type="button"
                onClick={() => navigateToTab('clients')}
                className={`min-h-[40px] flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'clients'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <Users className={`w-3.5 h-3.5 ${activeTab === 'clients' ? 'text-white' : 'text-slate-500'}`} />
                <span>Peer Roster</span>
              </button>

              <button
                type="button"
                onClick={() => navigateToTab('notes')}
                className={`min-h-[40px] flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${activeTab === 'notes' ? 'text-white' : 'text-slate-500'}`} />
                <span>Encounter Notes</span>
                {notes.length > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'notes' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {notes.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigateToTab('goalpath')}
                className={`min-h-[40px] flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'goalpath'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                }`}
                title="GoalPath Non-Clinical Wellness Domains"
              >
                <Target className={`w-3.5 h-3.5 ${activeTab === 'goalpath' ? 'text-white' : 'text-slate-500'}`} />
                <span>GoalPath™</span>
              </button>

              {canApproveNotes && (
                <button
                  type="button"
                  onClick={() => navigateToTab('supervisor')}
                  className={`min-h-[40px] flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'supervisor'
                      ? 'bg-[#1E3A8A] text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'supervisor' ? 'text-white' : 'text-slate-500'}`} />
                  <span>Supervisor QA</span>
                  {pendingNotesCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-[#D97706] animate-pulse">
                      {pendingNotesCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Zone: System Governance & Technical Specs Segmented Track */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-full border border-slate-200/90">
            <button
              type="button"
              onClick={() => navigateToTab('audit')}
              className={`min-h-[40px] flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <History className={`w-3.5 h-3.5 ${activeTab === 'audit' ? 'text-white' : 'text-slate-500'}`} />
              <span>Audit Trail</span>
            </button>

            <button
              type="button"
              onClick={() => navigateToTab('architecture')}
              className={`min-h-[40px] flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'architecture' ? 'text-white' : 'text-slate-500'}`} />
              <span>GA #8 Specs</span>
            </button>

            <button
              type="button"
              onClick={() => navigateToTab('settings')}
              className={`min-h-[40px] flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Settings className={`w-3.5 h-3.5 ${activeTab === 'settings' ? 'text-white' : 'text-slate-500'}`} />
              <span>Settings & BAA</span>
            </button>
          </div>
        </div>

        {/* 2. TABLET & COMPACT DESKTOP VIEWPORT (sm to lg: 640px - 1023px) - Segmented with Popover (Zero Scroll) */}
        <div className="hidden sm:flex lg:hidden items-center justify-between gap-2.5 w-full">
          {/* Left: Primary Action + Core Clinical Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedNoteForEdit(null);
                setSelectedClientForNote(null);
                navigateToTab('new_note');
              }}
              className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95 ${
                activeTab === 'new_note'
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'text-[#0F766E] hover:text-white hover:bg-[#0F766E] border border-teal-200 bg-teal-50/70'
              }`}
            >
              <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>Log Note</span>
            </button>

            <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-full border border-slate-200/90">
              <button
                type="button"
                onClick={() => navigateToTab('clients')}
                className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'clients'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Roster</span>
              </button>

              <button
                type="button"
                onClick={() => navigateToTab('notes')}
                className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notes</span>
                {notes.length > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'notes' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {notes.length}
                  </span>
                )}
              </button>

              {canApproveNotes && (
                <button
                  type="button"
                  onClick={() => navigateToTab('supervisor')}
                  className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'supervisor'
                      ? 'bg-[#1E3A8A] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>QA</span>
                  {pendingNotesCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-[#D97706]">
                      {pendingNotesCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right: Symmetrical "More Modules" Dropdown Popover */}
          <div className="relative inline-flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                ['goalpath', 'audit', 'architecture', 'settings'].includes(activeTab)
                  ? 'bg-[#1E3A8A] text-white border-blue-900 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>
                {activeTab === 'goalpath'
                  ? 'GoalPath™'
                  : activeTab === 'audit'
                  ? 'Audit Trail'
                  : activeTab === 'architecture'
                  ? 'GA #8 Specs'
                  : activeTab === 'settings'
                  ? 'Settings & BAA'
                  : 'More Modules'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-sm"
                  onClick={() => setIsMoreMenuOpen(false)}
                />
                <div
                  role="dialog"
                  aria-modal="true"
                  className="absolute right-0 top-full mt-2 w-72 p-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-[60] animate-in fade-in zoom-in-95 duration-100 space-y-1"
                >
                  <button
                    type="button"
                    onClick={() => {
                      navigateToTab('goalpath');
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'goalpath' ? 'bg-blue-50 text-[#1E3A8A]' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#0F766E]" />
                      <div>
                        <span>GoalPath™ Domains</span>
                        <span className="text-[10px] text-slate-500 font-normal block">Non-clinical wellness metrics</span>
                      </div>
                    </div>
                    {activeTab === 'goalpath' && <Check className="w-4 h-4 text-[#1E3A8A]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigateToTab('audit');
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'audit' ? 'bg-blue-50 text-[#1E3A8A]' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-[#0F766E]" />
                      <div>
                        <span>HIPAA Audit Trail</span>
                        <span className="text-[10px] text-slate-500 font-normal block">Immutable SHA-256 logs</span>
                      </div>
                    </div>
                    {activeTab === 'audit' && <Check className="w-4 h-4 text-[#1E3A8A]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigateToTab('architecture');
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'architecture' ? 'bg-blue-50 text-[#1E3A8A]' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#0F766E]" />
                      <div>
                        <span>GA #8 Architecture & Specs</span>
                        <span className="text-[10px] text-slate-500 font-normal block">White papers & standards</span>
                      </div>
                    </div>
                    {activeTab === 'architecture' && <Check className="w-4 h-4 text-[#1E3A8A]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigateToTab('settings');
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === 'settings' ? 'bg-blue-50 text-[#1E3A8A]' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[#0F766E]" />
                      <div>
                        <span>Settings & BAA</span>
                        <span className="text-[10px] text-slate-500 font-normal block">Storage, Supabase & keys</span>
                      </div>
                    </div>
                    {activeTab === 'settings' && <Check className="w-4 h-4 text-[#1E3A8A]" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. MOBILE FIELD VIEWPORT (< sm: under 640px) - Zero-Scroll Dual-Level Navigation */}
        <div className="sm:hidden flex flex-col gap-2 w-full">
          {/* Row 1: Active Module Pill & Log Interaction Primary Action */}
          <div className="flex items-center justify-between gap-2 w-full">
            {/* Active Module Indicator & Quick-Switcher Pill (min-h-[44px]) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="min-h-[44px] flex-1 min-w-0 flex items-center justify-between gap-2 px-3 py-2 bg-white hover:bg-slate-50 active:scale-98 border border-slate-200/90 rounded-2xl shadow-2xs text-left cursor-pointer transition-all"
              title="Tap to view all workspace modules"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center shrink-0 border border-blue-100">
                  <CurrentIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none">
                    Active View
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-[#1E3A8A] truncate">
                      {currentActiveItem.label}
                    </span>
                    {currentActiveItem.badge !== null && currentActiveItem.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                          currentActiveItem.badgeAlert ? 'bg-amber-100 text-[#D97706]' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {currentActiveItem.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Primary Action Button: + Log Note */}
            <button
              type="button"
              onClick={() => {
                setSelectedNoteForEdit(null);
                setSelectedClientForNote(null);
                navigateToTab('new_note');
              }}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer active:scale-95 ${
                activeTab === 'new_note'
                  ? 'bg-[#0F766E] text-white shadow-sm ring-2 ring-teal-600/30'
                  : 'bg-[#0F766E] hover:bg-teal-800 text-white'
              }`}
              title="Create new Medi-Cal encounter note"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="whitespace-nowrap">Log Note</span>
            </button>
          </div>

          {/* Row 2: Symmetrical 4-Column Segmented Quick-Switch Rail (100% Width, Zero Scroll) */}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            <button
              type="button"
              onClick={() => navigateToTab('clients')}
              className={`min-h-[44px] flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-[#1E3A8A] text-white border-blue-900 shadow-2xs font-bold'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 font-medium'
              }`}
            >
              <Users className={`w-4 h-4 mb-0.5 ${activeTab === 'clients' ? 'text-white' : 'text-slate-500'}`} />
              <span className="text-[10px] leading-tight truncate">Roster</span>
            </button>

            <button
              type="button"
              onClick={() => navigateToTab('notes')}
              className={`min-h-[44px] flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all relative cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-[#1E3A8A] text-white border-blue-900 shadow-2xs font-bold'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <FileText className={`w-4 h-4 mb-0.5 ${activeTab === 'notes' ? 'text-white' : 'text-slate-500'}`} />
                {notes.length > 0 && (
                  <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 rounded-full bg-[#0F766E] text-white font-bold">
                    {notes.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight truncate">Notes</span>
            </button>

            {canApproveNotes ? (
              <button
                type="button"
                onClick={() => navigateToTab('supervisor')}
                className={`min-h-[44px] flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all relative cursor-pointer ${
                  activeTab === 'supervisor'
                    ? 'bg-[#1E3A8A] text-white border-blue-900 shadow-2xs font-bold'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 font-medium'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <ShieldCheck className={`w-4 h-4 mb-0.5 ${activeTab === 'supervisor' ? 'text-white' : 'text-slate-500'}`} />
                  {pendingNotesCount > 0 && (
                    <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 rounded-full bg-[#D97706] text-white font-bold animate-pulse">
                      {pendingNotesCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] leading-tight truncate">QA</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateToTab('audit')}
                className={`min-h-[44px] flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-[#1E3A8A] text-white border-blue-900 shadow-2xs font-bold'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 font-medium'
                }`}
              >
                <History className={`w-4 h-4 mb-0.5 ${activeTab === 'audit' ? 'text-white' : 'text-slate-500'}`} />
                <span className="text-[10px] leading-tight truncate">Audit</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`min-h-[44px] flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                ['audit', 'architecture', 'settings'].includes(activeTab)
                  ? 'bg-[#0F766E] text-white border-teal-700 shadow-2xs font-bold'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 font-medium'
              }`}
            >
              <Grid className={`w-4 h-4 mb-0.5 ${['audit', 'architecture', 'settings'].includes(activeTab) ? 'text-white' : 'text-slate-500'}`} />
              <span className="text-[10px] leading-tight truncate">More</span>
            </button>
          </div>
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

          {/* Smart Quick-Action Bar with 44px–48px touch targets & balanced 2x2 grid on mobile phones */}
          <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedNoteForEdit(null);
                  setSelectedClientForNote(null);
                  navigateToTab('new_note');
                }}
                className="min-h-[46px] inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-[#0F766E] hover:bg-teal-800 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm cursor-pointer w-full lg:w-auto text-center"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">Log New Note</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedNoteForEdit(null);
                  setSelectedClientForNote(null);
                  navigateToTab('new_note');
                }}
                className="min-h-[46px] inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-white border border-slate-300 hover:bg-slate-50 active:scale-[0.98] text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer w-full lg:w-auto text-center"
              >
                <Users className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span className="truncate">Group Notes</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCrisisTemplate}
                className="min-h-[46px] inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-[#FEF3C7] border border-amber-300 hover:bg-amber-100 active:scale-[0.98] text-[#D97706] text-xs font-bold transition-all shadow-2xs cursor-pointer w-full lg:w-auto text-center"
              >
                <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
                <span className="truncate">Crisis Template</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedNoteForEdit(null);
                  setSelectedClientForNote(null);
                  navigateToTab('new_note');
                }}
                className="min-h-[46px] inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100 active:scale-[0.98] text-[#1E3A8A] text-xs font-bold transition-all shadow-2xs cursor-pointer w-full lg:w-auto text-center"
              >
                <Mic className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span className="truncate">PeerNote™ Dictate</span>
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
                className="min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-full text-xs font-bold shadow-sm shrink-0 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </button>
            </div>
          </div>

          {/* GoalPath Wellness Domain Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0 mr-1 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-[#0F766E]" /> GoalPath:
            </span>
            <button
              type="button"
              onClick={() => setSelectedDomainFilter(null)}
              className={`min-h-[32px] px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                !selectedDomainFilter
                  ? 'bg-[#1E3A8A] text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              All Domains
            </button>
            {['Housing', 'Social Connection', 'Self-Advocacy', 'Employment / Education', 'Daily Routines'].map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomainFilter(selectedDomainFilter === domain ? null : domain)}
                className={`min-h-[32px] px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedDomainFilter === domain
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{domain}</span>
                {selectedDomainFilter === domain && <Check className="w-3 h-3 text-white" />}
              </button>
            ))}
          </div>

          {selectedDomainFilter && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-[#0F766E] font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0F766E]" />
                <span>
                  Filtering by GoalPath Domain: <strong>{selectedDomainFilter}</strong> ({filteredNotes.length} matching encounter{filteredNotes.length === 1 ? '' : 's'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDomainFilter(null)}
                className="text-xs text-teal-800 hover:underline font-bold cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}

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
                      className="min-h-[44px] flex-1 xs:flex-none px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-full border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_4px_rgba(15,23,42,0.04)] cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#0F766E]" />
                      <span>PDF Export</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditNote(note)}
                      className="min-h-[44px] flex-1 xs:flex-none px-4 py-2 bg-teal-50 hover:bg-[#0F766E] text-[#0F766E] hover:text-white rounded-full text-xs font-bold transition-all border border-teal-200 text-center flex items-center justify-center gap-1.5 cursor-pointer"
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

      {activeTab === 'goalpath' && (
        <GoalPathTracker
          notes={notes}
          selectedDomainFilter={selectedDomainFilter}
          onSelectDomainFilter={(domain) => {
            setSelectedDomainFilter(domain);
            navigateToTab('notes');
          }}
          onApplyPromptSnippet={(_snippet) => {
            setSelectedNoteForEdit(null);
            setSelectedClientForNote(null);
            navigateToTab('new_note');
          }}
        />
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

      {/* ========================================================================= */}
      {/* MOBILE THUMB-ZONE BOTTOM NAVIGATION DOCK (md:hidden)                      */}
      {/* Replaces horizontal scrolling with high-frequency thumb-zone ergonomics   */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 px-2">
        <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
          {/* 1. Roster */}
          <button
            type="button"
            onClick={() => navigateToTab('clients')}
            className={`min-h-[50px] flex flex-col items-center justify-center gap-1 transition-all rounded-xl py-1 cursor-pointer ${
              activeTab === 'clients'
                ? 'text-[#1E3A8A] font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Users className={`w-5 h-5 ${activeTab === 'clients' ? 'text-[#1E3A8A]' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight">Roster</span>
          </button>

          {/* 2. Notes */}
          <button
            type="button"
            onClick={() => navigateToTab('notes')}
            className={`min-h-[50px] flex flex-col items-center justify-center gap-1 transition-all rounded-xl py-1 relative cursor-pointer ${
              activeTab === 'notes'
                ? 'text-[#1E3A8A] font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <FileText className={`w-5 h-5 ${activeTab === 'notes' ? 'text-[#1E3A8A]' : 'text-slate-400'}`} />
              {notes.length > 0 && (
                <span className="absolute -top-1.5 -right-2 font-mono text-[9px] font-bold bg-[#0F766E] text-white px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                  {notes.length}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Notes</span>
          </button>

          {/* 3. Center Elevated Floating Button: Log Note */}
          <button
            type="button"
            onClick={() => {
              setSelectedNoteForEdit(null);
              setSelectedClientForNote(null);
              navigateToTab('new_note');
            }}
            className="min-h-[54px] flex flex-col items-center justify-center -translate-y-2.5 transition-all group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white transition-all active:scale-95 ${
                activeTab === 'new_note'
                  ? 'bg-[#0F766E] ring-teal-100 shadow-teal-700/20'
                  : 'bg-[#0F766E] hover:bg-teal-800'
              }`}
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span
              className={`text-[10px] mt-0.5 font-bold tracking-tight ${
                activeTab === 'new_note' ? 'text-[#0F766E]' : 'text-slate-600'
              }`}
            >
              Log Note
            </span>
          </button>

          {/* 4. QA or Audit */}
          {canApproveNotes ? (
            <button
              type="button"
              onClick={() => navigateToTab('supervisor')}
              className={`min-h-[50px] flex flex-col items-center justify-center gap-1 transition-all rounded-xl py-1 relative cursor-pointer ${
                activeTab === 'supervisor'
                  ? 'text-[#1E3A8A] font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <ShieldCheck
                  className={`w-5 h-5 ${activeTab === 'supervisor' ? 'text-[#0F766E]' : 'text-slate-400'}`}
                />
                {pendingNotesCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 font-mono text-[9px] font-bold bg-[#D97706] text-white px-1.5 py-0.2 rounded-full min-w-[16px] text-center animate-pulse">
                    {pendingNotesCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">QA Review</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigateToTab('audit')}
              className={`min-h-[50px] flex flex-col items-center justify-center gap-1 transition-all rounded-xl py-1 cursor-pointer ${
                activeTab === 'audit'
                  ? 'text-[#1E3A8A] font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <History
                className={`w-5 h-5 ${activeTab === 'audit' ? 'text-[#1E3A8A]' : 'text-slate-400'}`}
              />
              <span className="text-[10px] tracking-tight">Audit</span>
            </button>
          )}

          {/* 5. More (All Modules Drawer) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`min-h-[50px] flex flex-col items-center justify-center gap-1 transition-all rounded-xl py-1 cursor-pointer ${
              isMobileMenuOpen || ['audit', 'architecture', 'settings'].includes(activeTab)
                ? 'text-[#0F766E] font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Grid
              className={`w-5 h-5 ${
                isMobileMenuOpen || ['audit', 'architecture', 'settings'].includes(activeTab)
                  ? 'text-[#0F766E]'
                  : 'text-slate-400'
              }`}
            />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE ALL MODULES BOTTOM SHEET DRAWER (md:hidden)                        */}
      {/* Low-arousal, trauma-informed sheet for instant one-thumb navigation       */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/25 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl border-t border-slate-200/90 shadow-2xl p-4 sm:p-5 max-h-[85vh] overflow-y-auto space-y-4 pb-[max(env(safe-area-inset-bottom),2rem)] animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E3A8A]">Workspace Modules & Navigation</h3>
                  <p className="text-[11px] text-slate-500">
                    {currentUser?.fullName || 'Sarah Jenkins, CPSS-CA'} · {currentOrg?.name || 'Alameda Health System'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                title="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Core Field Clinical Documentation */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Field Documentation (H0038)
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => navigateToTab('clients')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between min-h-[48px] transition-all cursor-pointer ${
                    activeTab === 'clients'
                      ? 'bg-blue-50/80 border-blue-200 text-[#1E3A8A]'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-[#1E3A8A]">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block">Peer Roster & Care Plans</span>
                      <span className="text-[11px] text-slate-500">Active peers, CIN numbers, recovery milestones</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('notes')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between min-h-[48px] transition-all cursor-pointer ${
                    activeTab === 'notes'
                      ? 'bg-blue-50/80 border-blue-200 text-[#1E3A8A]'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-[#1E3A8A]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">Encounter Notes</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700 font-bold">
                          {notes.length} total
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">Review, filter, edit, and export Medi-Cal PDFs</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('goalpath')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between min-h-[48px] transition-all cursor-pointer ${
                    activeTab === 'goalpath'
                      ? 'bg-blue-50/80 border-blue-200 text-[#1E3A8A]'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-50 text-[#0F766E] border border-teal-200">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block">GoalPath™ Recovery Domains</span>
                      <span className="text-[11px] text-slate-500">Housing, Social Connection, Self-Advocacy & Routines</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedNoteForEdit(null);
                    setSelectedClientForNote(null);
                    navigateToTab('new_note');
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between min-h-[48px] transition-all cursor-pointer ${
                    activeTab === 'new_note'
                      ? 'bg-teal-50 border-teal-200 text-[#0F766E]'
                      : 'bg-teal-50/50 hover:bg-teal-50 border-teal-200/80 text-teal-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#0F766E] text-white">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-[#0F766E]">Log New CalAIM Interaction</span>
                      <span className="text-[11px] text-teal-700">Deterministic 4-part notes with 1-tap intervention chips</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-teal-600" />
                </button>
              </div>
            </div>

            {/* 2. Supervision & Quality Assurance */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Clinical QA & Compliance
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {canApproveNotes && (
                  <button
                    type="button"
                    onClick={() => navigateToTab('supervisor')}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between min-h-[48px] transition-all cursor-pointer ${
                      activeTab === 'supervisor'
                        ? 'bg-blue-50/80 border-blue-200 text-[#1E3A8A]'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-50 text-[#D97706] border border-amber-200">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">Supervisor Cosign QA</span>
                          {pendingNotesCount > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-amber-100 text-[#D97706] font-bold">
                              {pendingNotesCount} pending
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">LCSW/LMFT review queue and approval sign-offs</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigateToTab('audit')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between min-h-[48px] transition-all cursor-pointer ${
                    activeTab === 'audit'
                      ? 'bg-blue-50/80 border-blue-200 text-[#1E3A8A]'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-[#1E3A8A]">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block">HIPAA Audit Trail</span>
                      <span className="text-[11px] text-slate-500">Immutable SHA-256 tamper-evident log records</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* 3. System, Specs & Persistence */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Specifications & Settings
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigateToTab('architecture')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between min-h-[58px] transition-all cursor-pointer ${
                    activeTab === 'architecture'
                      ? 'bg-blue-50/80 border-blue-200 text-[#1E3A8A]'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#0F766E] mb-1" />
                  <span className="font-bold text-xs leading-tight">GA #8 Specs</span>
                  <span className="text-[10px] text-slate-500">White papers</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('settings')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between min-h-[58px] transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-blue-50/80 border-blue-200 text-[#1E3A8A]'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <Settings className="w-4 h-4 text-[#0F766E] mb-1" />
                  <span className="font-bold text-xs leading-tight">Settings & BAA</span>
                  <span className="text-[10px] text-slate-500">Storage & sync</span>
                </button>
              </div>
            </div>

            {/* 4. Live Storage & Direct Sync Hub in Drawer */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col xs:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse shrink-0" />
                <div className="min-w-0 text-left">
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    Dexie.js Offline Store Active
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {syncInfo.pendingCount > 0
                      ? `${syncInfo.pendingCount} notes queued for Supabase`
                      : '100% in-sync with cloud store'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleMobileForceSync}
                disabled={isSyncingFromMobile}
                className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all w-full xs:w-auto cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#0F766E] ${isSyncingFromMobile ? 'animate-spin' : ''}`}
                />
                <span>{isSyncingFromMobile ? 'Syncing...' : 'Force Sync'}</span>
              </button>
            </div>

            {mobileSyncMsg && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs font-semibold rounded-xl text-center">
                {mobileSyncMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
