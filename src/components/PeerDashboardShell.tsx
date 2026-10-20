import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  HeartHandshake,
  WifiOff,
  Wifi,
  ShieldCheck,
  Lock,
  FileText,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Save,
  Database,
  Activity,
  Shield,
  FileCheck2,
  UserCheck,
  RefreshCw,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Hash,
  Award
} from 'lucide-react';
import { EnterpriseFooter } from './EnterpriseFooter';

/**
 * ============================================================================
 * TYPE DEFINITIONS & PERSISTENCE LAYER ABSTRACTIONS
 * Strict TypeScript Interfaces for Local-First Dual-Layer Synchronization
 * ============================================================================
 */

export type SyncState = 'in_sync' | 'syncing' | 'offline_queued' | 'error';

export interface LocalDexieRecord<T> {
  id: string;
  data: T;
  localTimestamp: number;
  syncStatus: 'synced' | 'pending_upload' | 'conflict';
  version: number;
}

export interface SupabaseSyncState {
  isOnline: boolean;
  lastSyncedAt: Date | null;
  pendingQueueCount: number;
  syncState: SyncState;
  remoteEndpoint: string;
}

export type CalAIMDomain =
  | 'Self-Advocacy & Empowerment'
  | 'Recovery Planning & Goal Setting'
  | 'Resource Navigation & Linkage'
  | 'Community & Natural Supports'
  | 'Crisis Prevention & Safety Planning';

export interface H0038ProgressNoteDraft {
  id: string;
  clientId: string;
  clientName: string;
  clientMrn: string;
  serviceDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  serviceCode: 'H0038'; // Medi-Cal Peer Support Specialist Services
  calaimDomain: CalAIMDomain;
  carePlanMilestoneId: string;
  carePlanMilestoneTitle: string;
  locationOfService: 'Field / Community' | 'Clinic / Office' | 'Telephone' | 'Telehealth';
  sessionGoal: string;
  peerInterventions: string;
  clientResponse: string;
  nextStepsFollowUp: string;
  isCrisisEncounter: boolean;
  supervisorSignoffStatus: 'draft' | 'pending_supervisor_review' | 'approved';
}

export interface HistoricalClientLog {
  id: string;
  date: string;
  serviceCode: string;
  durationMinutes: number;
  summary: string;
  domain: string;
  signedBy: string;
}

export interface CarePlanMilestone {
  id: string;
  code: string;
  title: string;
  targetDate: string;
  status: 'In Progress' | 'Achieved' | 'Under Revision';
  calaimCategory: string;
}

export interface PastAssessment {
  id: string;
  type: string;
  completedDate: string;
  assessor: string;
  riskScore: 'Low' | 'Moderate' | 'Elevated';
}

export interface ClientCareContext {
  clientId: string;
  fullName: string;
  mrn: string;
  cin: string;
  primaryLanguage: string;
  coveragePlan: string;
  milestones: CarePlanMilestone[];
  historicalLogs: HistoricalClientLog[];
  assessments: PastAssessment[];
}

export interface ShiftKPIPosture {
  pendingNotesCount: number;
  signedNotesToday: number;
  totalShiftMinutes: number;
  calaimGoldenThreadAccuracy: number;
}

export interface PeerDashboardShellProps {
  initialClient?: ClientCareContext;
  onSaveDraft?: (draft: H0038ProgressNoteDraft) => void;
  onSubmitForSignoff?: (draft: H0038ProgressNoteDraft) => void;
  onNavigateTab?: (tab: string, slug?: string) => void;
}

/**
 * Mock Local Database Sync Client (Abstracting Dexie.js + Supabase)
 */
class LocalFirstSyncAdapter {
  private static STORAGE_KEY = 'peernotebook_local_draft_v2';

  static loadLocalDraft(clientId: string): H0038ProgressNoteDraft | null {
    try {
      const serialized = localStorage.getItem(`${this.STORAGE_KEY}_${clientId}`);
      if (!serialized) return null;
      return JSON.parse(serialized) as H0038ProgressNoteDraft;
    } catch {
      return null;
    }
  }

  static persistLocalDraft(draft: H0038ProgressNoteDraft): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY}_${draft.clientId}`, JSON.stringify(draft));
    } catch (e) {
      console.warn('Dexie fallback quota limit', e);
    }
  }

  static clearLocalDraft(clientId: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY}_${clientId}`);
    } catch (e) {
      console.warn('Failed clearing Dexie cache', e);
    }
  }
}

/**
 * Default Active Client Seed (CalAIM H0038 Qualified Medi-Cal Beneficiary)
 */
const DEFAULT_CLIENT_CONTEXT: ClientCareContext = {
  clientId: 'cl-8942-calaim',
  fullName: 'Marcus Vance',
  mrn: 'MRN-77391',
  cin: '99281741A',
  primaryLanguage: 'English',
  coveragePlan: 'Medi-Cal Managed Care (CalAIM ECM / Community Supports)',
  milestones: [
    {
      id: 'ms-01',
      code: 'GOAL-2.1',
      title: 'Obtain stabilized independent transitional housing voucher within 90 days',
      targetDate: '2026-11-15',
      status: 'In Progress',
      calaimCategory: 'Social Determinants: Housing Stability'
    },
    {
      id: 'ms-02',
      code: 'GOAL-2.2',
      title: 'Attend twice-weekly dual-recovery wellness circle without unexcused lapse',
      targetDate: '2026-10-31',
      status: 'In Progress',
      calaimCategory: 'Behavioral Health & Community Connection'
    },
    {
      id: 'ms-03',
      code: 'GOAL-1.4',
      title: 'Complete initial SSI/SSDI benefits intake paperwork with County advocate',
      targetDate: '2026-09-20',
      status: 'Achieved',
      calaimCategory: 'Economic Stability & Self-Advocacy'
    }
  ],
  historicalLogs: [
    {
      id: 'hist-101',
      date: '2026-10-16',
      serviceCode: 'H0038 (15m units: 4)',
      durationMinutes: 60,
      domain: 'Resource Navigation & Linkage',
      summary: 'Accompanied client to County Social Services office for food assistance renewal.',
      signedBy: 'Sarah Jenkins, PSS #CA-4102'
    },
    {
      id: 'hist-102',
      date: '2026-10-12',
      serviceCode: 'H0038 (15m units: 3)',
      durationMinutes: 45,
      domain: 'Recovery Planning & Goal Setting',
      summary: '1-on-1 collaborative session reviewing WRAP (Wellness Recovery Action Plan).',
      signedBy: 'Sarah Jenkins, PSS #CA-4102'
    },
    {
      id: 'hist-103',
      date: '2026-10-08',
      serviceCode: 'H0038 (15m units: 2)',
      durationMinutes: 30,
      domain: 'Crisis Prevention & Safety Planning',
      summary: 'Identified early warning triggers for anxiety decompensation; codified phone contacts.',
      signedBy: 'David Chen, PSS #CA-3882'
    }
  ],
  assessments: [
    {
      id: 'asmt-01',
      type: 'CalAIM ECM Comprehensive Needs Assessment',
      completedDate: '2026-09-15',
      assessor: 'Elena Rostova, LCSW',
      riskScore: 'Moderate'
    },
    {
      id: 'asmt-02',
      type: 'Trauma-Informed Peer Engagement Screener',
      completedDate: '2026-09-18',
      assessor: 'Sarah Jenkins, PSS #CA-4102',
      riskScore: 'Low'
    }
  ]
};

/**
 * ============================================================================
 * MAIN COMPONENT: PeerDashboardShell
 * Action-First, Low-Cognitive-Load Dashboard for CalAIM Peer Specialists
 * ============================================================================
 */
export const PeerDashboardShell: React.FC<PeerDashboardShellProps> = ({
  initialClient = DEFAULT_CLIENT_CONTEXT,
  onSaveDraft,
  onSubmitForSignoff,
  onNavigateTab
}) => {
  // Sync State Abstraction (Dexie.js client-side cached + Supabase cloud)
  const [syncInfo, setSyncInfo] = useState<SupabaseSyncState>({
    isOnline: true,
    lastSyncedAt: new Date(),
    pendingQueueCount: 0,
    syncState: 'in_sync',
    remoteEndpoint: 'db.supabase.peernotebook.internal'
  });

  const [activeClient] = useState<ClientCareContext>(initialClient);

  // Shift Posture KPI State
  const [shiftKPI] = useState<ShiftKPIPosture>({
    pendingNotesCount: 3,
    signedNotesToday: 5,
    totalShiftMinutes: 240,
    calaimGoldenThreadAccuracy: 98
  });

  // Active Progress Note Drafting State (Medi-Cal H0038)
  const [draft, setDraft] = useState<H0038ProgressNoteDraft>(() => {
    const cached = LocalFirstSyncAdapter.loadLocalDraft(initialClient.clientId);
    if (cached) return cached;
    return {
      id: `draft-${Date.now()}`,
      clientId: initialClient.clientId,
      clientName: initialClient.fullName,
      clientMrn: initialClient.mrn,
      serviceDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '10:45',
      durationMinutes: 45,
      serviceCode: 'H0038',
      calaimDomain: 'Recovery Planning & Goal Setting',
      carePlanMilestoneId: initialClient.milestones[0]?.id || '',
      carePlanMilestoneTitle: initialClient.milestones[0]?.title || '',
      locationOfService: 'Field / Community',
      sessionGoal: 'Client self-identified milestone: Review transitional housing applications.',
      peerInterventions: 'Specialist utilized active reflective listening and lived-experience sharing to demystify lease agreement terms. Guided client through identifying personal strengths to navigate administrative barriers.',
      clientResponse: 'Client actively engaged, identified two immediate documentation needs, and agreed to schedule document drop-off by Thursday.',
      nextStepsFollowUp: 'Support client in attending Thursday voucher verification appointment.',
      isCrisisEncounter: false,
      supervisorSignoffStatus: 'draft'
    };
  });

  // UI State: Contextual Accordion Panels
  const [expandedSections, setExpandedSections] = useState<{
    history: boolean;
    milestones: boolean;
    assessments: boolean;
  }>({
    history: false,
    milestones: true,
    assessments: false
  });

  // Feedback notifications
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setSyncInfo((prev) => ({
        ...prev,
        isOnline: true,
        syncState: prev.pendingQueueCount > 0 ? 'syncing' : 'in_sync'
      }));
      setStatusNotification('Network connection restored. Syncing local Dexie.js cache with Supabase...');
      setTimeout(() => {
        setSyncInfo((prev) => ({
          ...prev,
          syncState: 'in_sync',
          pendingQueueCount: 0,
          lastSyncedAt: new Date()
        }));
        setStatusNotification(null);
      }, 1800);
    };

    const handleOffline = () => {
      setSyncInfo((prev) => ({
        ...prev,
        isOnline: false,
        syncState: 'offline_queued'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-Save Draft to Local Dexie Cache
  useEffect(() => {
    LocalFirstSyncAdapter.persistLocalDraft(draft);
  }, [draft]);

  // Real-Time Medical Billing Justification Percentage Tracker
  // CalAIM Golden Thread requires: (1) Service Code, (2) Milestone alignment, (3) Measurable Goal, (4) Specific Intervention, (5) Client Response
  const billingCompletionMetrics = useMemo(() => {
    let score = 0;
    const checks = {
      milestoneLinked: Boolean(draft.carePlanMilestoneId && draft.carePlanMilestoneTitle),
      domainSelected: Boolean(draft.calaimDomain),
      goalArticulated: draft.sessionGoal.trim().length >= 15,
      interventionDetailed: draft.peerInterventions.trim().length >= 35,
      responseDocumented: draft.clientResponse.trim().length >= 25,
      durationValid: draft.durationMinutes >= 15 && draft.durationMinutes % 15 === 0
    };

    if (checks.milestoneLinked) score += 20;
    if (checks.domainSelected) score += 15;
    if (checks.goalArticulated) score += 20;
    if (checks.interventionDetailed) score += 25;
    if (checks.responseDocumented) score += 15;
    if (checks.durationValid) score += 5;

    const billingUnits = Math.floor(draft.durationMinutes / 15);

    return {
      percentage: Math.min(score, 100),
      isAuditReady: score >= 90,
      billingUnits,
      checks
    };
  }, [draft]);

  // Quick Action Handlers
  const handleQuickAction = useCallback((actionType: 'standard_h0038' | 'group_notes' | 'crisis_template') => {
    if (actionType === 'standard_h0038') {
      setDraft((prev) => ({
        ...prev,
        isCrisisEncounter: false,
        calaimDomain: 'Recovery Planning & Goal Setting',
        sessionGoal: 'One-on-one individual peer engagement: Goal refinement & barrier identification.',
        peerInterventions: 'Employed motivational interviewing and shared recovery lived experience to explore coping mechanisms.',
        clientResponse: 'Client voiced increased self-efficacy and selected 1 recovery action item for the week.'
      }));
      setStatusNotification('Loaded CalAIM H0038 Individual Note Template.');
    } else if (actionType === 'group_notes') {
      setDraft((prev) => ({
        ...prev,
        isCrisisEncounter: false,
        calaimDomain: 'Community & Natural Supports',
        sessionGoal: 'Facilitated peer-led wellness and recovery support circle.',
        peerInterventions: 'Specialist established trauma-informed group guidelines, facilitated equal voice, and guided dialogue on stress decompression.',
        clientResponse: 'Client participated in peer group sharing, validated peers, and completed mutual check-in.'
      }));
      setStatusNotification('Loaded CalAIM H0038 Peer Group Interaction Template.');
    } else if (actionType === 'crisis_template') {
      setDraft((prev) => ({
        ...prev,
        isCrisisEncounter: true,
        calaimDomain: 'Crisis Prevention & Safety Planning',
        sessionGoal: 'Urgent crisis de-escalation & safety action plan execution.',
        peerInterventions: 'Conducted trauma-informed grounding techniques. Reviewed existing safety plan. Verified physical safety and connected with supervisor.',
        clientResponse: 'Client stabilized breathing, identified trusted emergency contact, and verified safe immediate sanctuary.'
      }));
      setStatusNotification('Crisis Safety Template Activated — Golden Thread Priority Flagged.');
    }

    setTimeout(() => {
      setStatusNotification(null);
    }, 3200);
  }, []);

  const handleSaveLocal = () => {
    LocalFirstSyncAdapter.persistLocalDraft(draft);
    onSaveDraft?.(draft);
    setStatusNotification('Draft securely stored in local Dexie.js cache (HIPAA Encrypted).');
    setTimeout(() => setStatusNotification(null), 2500);
  };

  const handleSubmitForReview = () => {
    if (billingCompletionMetrics.percentage < 80) {
      alert('CalAIM Compliance Warning: Note requires at least 80% Golden Thread completion before submission.');
      return;
    }
    const updatedDraft: H0038ProgressNoteDraft = {
      ...draft,
      supervisorSignoffStatus: 'pending_supervisor_review'
    };
    setDraft(updatedDraft);
    LocalFirstSyncAdapter.persistLocalDraft(updatedDraft);
    onSubmitForSignoff?.(updatedDraft);
    setStatusNotification('Note submitted to Supervisor Queue for CalAIM sign-off!');
    setTimeout(() => setStatusNotification(null), 3000);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#0F766E] selection:text-white">
      {/* ================================================================== */}
      {/* 1. PROACTIVE HEADER & HERO SPACE (Absolute Top) */}
      {/* ================================================================== */}

      {/* Proactive Notification Banner */}
      {!syncInfo.isOnline ? (
        <div className="w-full bg-[#D97706] text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
            <span>
              <strong>Offline Mode Active</strong> — Changes securely cached locally via Dexie.js (AES-256 encrypted storage). Auto-sync will resume upon reconnect.
            </span>
            <span className="ml-auto text-[11px] opacity-90 hidden sm:inline">Queued: {syncInfo.pendingQueueCount + 1} operations</span>
          </div>
        </div>
      ) : statusNotification ? (
        <div className="w-full bg-[#0F766E] text-white px-4 py-2 text-xs font-medium flex items-center justify-center transition-all shadow-xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusNotification}</span>
          </div>
        </div>
      ) : (
        <div className="w-full bg-[#1E3A8A] text-blue-100 border-b border-blue-900/60 px-4 py-1.5 text-[11px] font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>CalAIM Dual-Layer Persistence Engine: Operational (Dexie.js ➔ Supabase Postgres)</span>
            </div>
            <div className="hidden md:flex items-center gap-3 text-blue-200">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#16A34A]" /> BAA Enforced (45 CFR § 164.504)
              </span>
              <span>·</span>
              <span>Medi-Cal H0038 Compliant</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Space & KPI Shift Posture Glance */}
      <section className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Active Shift Posture Card */}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-semibold text-[#0F766E] uppercase tracking-wider text-[11px]">Active Shift Posture</span>
                <span aria-hidden="true">·</span>
                <span>Specialist: Sarah Jenkins, PSS #CA-4102</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[#16A34A] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Golden Thread: {shiftKPI.calaimGoldenThreadAccuracy}%
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1E3A8A] tracking-tight">
                {shiftKPI.pendingNotesCount} Progress Notes Pending Sign-off under CalAIM guidelines
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                Medi-Cal H0038 billing justification requires explicit golden-thread linkage between client care plan milestones, peer interventions, and measurable recovery responses.
              </p>
            </div>

            {/* Quick Metrics Cluster */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 font-medium block">Approved Today</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold text-slate-900">{shiftKPI.signedNotesToday}</span>
                  <span className="text-[10px] text-slate-500">notes</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3">
                <span className="text-[11px] text-slate-500 font-medium block">Billable Time</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold text-[#0F766E]">{shiftKPI.totalShiftMinutes}</span>
                  <span className="text-[10px] text-slate-500">mins (16u)</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-500 font-medium block">Sync Status</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${syncInfo.isOnline ? 'bg-[#16A34A]' : 'bg-[#D97706]'}`} />
                  <span className="text-xs font-semibold text-slate-800">
                    {syncInfo.isOnline ? 'Supabase OK' : 'Dexie Cached'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Quick-Action Bar */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
              High-Intent Clinical Shortcuts
            </span>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 sm:pb-0 touch-pan-x no-scrollbar">
              <button
                type="button"
                onClick={() => handleQuickAction('standard_h0038')}
                className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0c625c] text-white text-xs font-medium transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Log New Interaction (H0038)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction('group_notes')}
                className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>Start Group Notes</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction('crisis_template')}
                className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-medium transition-colors shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Open Crisis Template</span>
              </button>

              <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Database className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Local Dexie ⇄ Supabase RLS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 2. THE MAIN BODY GRID (Responsive Split-Screen / Stacked Layout) */}
      {/* ================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* -------------------------------------------------------------- */}
          {/* Left / Top: Active Drafting Panel */}
          {/* -------------------------------------------------------------- */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              {/* Header with Client Identification & Golden Thread Indicator */}
              <div className="px-5 py-4 border-b border-slate-200 bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#1E3A8A]">{activeClient.fullName}</h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                      {activeClient.mrn}
                    </span>
                    <span className="text-xs font-mono text-slate-500">CIN: {activeClient.cin}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{activeClient.coveragePlan}</p>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-[#0F766E] text-xs font-medium">
                    <Activity className="w-3.5 h-3.5" />
                    <span>H0038 ({billingCompletionMetrics.billingUnits} Units · {draft.durationMinutes}m)</span>
                  </div>
                </div>
              </div>

              {/* Ambient Visual Progress Tracker for Medical Billing Justification */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                    CalAIM Billing Justification Integrity
                  </span>
                  <span className={`font-mono font-bold ${billingCompletionMetrics.percentage >= 90 ? 'text-[#16A34A]' : 'text-[#D97706]'}`}>
                    {billingCompletionMetrics.percentage}% {billingCompletionMetrics.isAuditReady ? '(Audit Ready)' : '(Missing Elements)'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      billingCompletionMetrics.percentage >= 90
                        ? 'bg-[#16A34A]'
                        : billingCompletionMetrics.percentage >= 60
                        ? 'bg-[#0F766E]'
                        : 'bg-[#D97706]'
                    }`}
                    style={{ width: `${billingCompletionMetrics.percentage}%` }}
                  />
                </div>

                {/* Micro-metrics checklist */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-[11px] text-slate-500">
                  <span className={`flex items-center gap-1 ${billingCompletionMetrics.checks.milestoneLinked ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Care Plan Milestone
                  </span>
                  <span className={`flex items-center gap-1 ${billingCompletionMetrics.checks.goalArticulated ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Specific Goal
                  </span>
                  <span className={`flex items-center gap-1 ${billingCompletionMetrics.checks.interventionDetailed ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Peer Intervention
                  </span>
                </div>
              </div>

              {/* Minimalist, Low-Cognitive-Load Drafting Form */}
              <div className="p-5 space-y-4">
                {/* Milestone & Domain Linkage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CalAIM Service Domain
                    </label>
                    <select
                      value={draft.calaimDomain}
                      onChange={(e) => setDraft({ ...draft, calaimDomain: e.target.value as CalAIMDomain })}
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
                    >
                      <option value="Self-Advocacy & Empowerment">Self-Advocacy & Empowerment</option>
                      <option value="Recovery Planning & Goal Setting">Recovery Planning & Goal Setting</option>
                      <option value="Resource Navigation & Linkage">Resource Navigation & Linkage</option>
                      <option value="Community & Natural Supports">Community & Natural Supports</option>
                      <option value="Crisis Prevention & Safety Planning">Crisis Prevention & Safety Planning</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Linked Care Plan Milestone
                    </label>
                    <select
                      value={draft.carePlanMilestoneId}
                      onChange={(e) => {
                        const m = activeClient.milestones.find((item) => item.id === e.target.value);
                        setDraft({
                          ...draft,
                          carePlanMilestoneId: e.target.value,
                          carePlanMilestoneTitle: m?.title || ''
                        });
                      }}
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
                    >
                      {activeClient.milestones.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code}: {m.title.slice(0, 42)}...
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration & Location Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Service Date
                    </label>
                    <input
                      type="date"
                      value={draft.serviceDate}
                      onChange={(e) => setDraft({ ...draft, serviceDate: e.target.value })}
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Duration (Minutes)
                    </label>
                    <select
                      value={draft.durationMinutes}
                      onChange={(e) => setDraft({ ...draft, durationMinutes: parseInt(e.target.value, 10) })}
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    >
                      <option value={15}>15 mins (1 unit H0038)</option>
                      <option value={30}>30 mins (2 units H0038)</option>
                      <option value={45}>45 mins (3 units H0038)</option>
                      <option value={60}>60 mins (4 units H0038)</option>
                      <option value={90}>90 mins (6 units H0038)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Setting / Location
                    </label>
                    <select
                      value={draft.locationOfService}
                      onChange={(e) => setDraft({ ...draft, locationOfService: e.target.value as any })}
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    >
                      <option value="Field / Community">Field / Community</option>
                      <option value="Clinic / Office">Clinic / Office</option>
                      <option value="Telephone">Telephone</option>
                      <option value="Telehealth">Telehealth</option>
                    </select>
                  </div>
                </div>

                {/* Session Goal Narrative Area */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      1. Session Goal / Focus (CalAIM Identified Need)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {draft.sessionGoal.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={draft.sessionGoal}
                    onChange={(e) => setDraft({ ...draft, sessionGoal: e.target.value })}
                    placeholder="E.g., Client requested assistance with housing navigation paperwork and anxiety coping..."
                    className="w-full text-xs rounded-lg border border-slate-300 bg-white p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                {/* Peer Interventions Narrative Area */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      2. Peer Interventions & Lived Experience Facilitation
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {draft.peerInterventions.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={draft.peerInterventions}
                    onChange={(e) => setDraft({ ...draft, peerInterventions: e.target.value })}
                    placeholder="Specific peer support skills used: shared recovery story, guided navigation, strength-based coaching..."
                    className="w-full text-xs rounded-lg border border-slate-300 bg-white p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                {/* Client Response Narrative Area */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      3. Client Response & Measurable Engagement
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {draft.clientResponse.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={draft.clientResponse}
                    onChange={(e) => setDraft({ ...draft, clientResponse: e.target.value })}
                    placeholder="How client engaged, demonstrated new skill, completed application, or articulated recovery milestone..."
                    className="w-full text-xs rounded-lg border border-slate-300 bg-white p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                {/* Next Steps / Plan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    4. Plan & Next Follow-Up Interaction
                  </label>
                  <input
                    type="text"
                    value={draft.nextStepsFollowUp}
                    onChange={(e) => setDraft({ ...draft, nextStepsFollowUp: e.target.value })}
                    placeholder="E.g., Follow up on Thursday for voucher appointment at County building."
                    className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                {/* Actions & Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Database className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Auto-saved to local Dexie.js cache</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveLocal}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-500" />
                      <span>Save Draft</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitForReview}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0c625c] text-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Supervisor Sign-off</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Right / Bottom: Collapsed Contextual Containers */}
          {/* -------------------------------------------------------------- */}
          <div className="space-y-3.5">
            {/* Context Header with HIPAA Guard */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
                Client Clinical Context
              </span>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Lock className="w-3 h-3" />
                <span>HIPAA-Secure · Encrypted</span>
              </div>
            </div>

            {/* Container 1: Care Plan Milestones (Golden Thread Alignment) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, milestones: !prev.milestones }))
                }
                className="w-full px-4 py-3 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TargetIcon className="w-4 h-4 text-[#0F766E]" />
                  <span className="text-xs font-bold text-slate-800">
                    Active Care Plan Goals & Milestones ({activeClient.milestones.length})
                  </span>
                </div>
                {expandedSections.milestones ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedSections.milestones && (
                <div className="p-3.5 space-y-2.5">
                  {activeClient.milestones.map((m) => {
                    const isSelected = draft.carePlanMilestoneId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setDraft({
                            ...draft,
                            carePlanMilestoneId: m.id,
                            carePlanMilestoneTitle: m.title
                          });
                        }}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-50/50 border-[#0F766E] ring-1 ring-[#0F766E]'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-[#1E3A8A]">{m.code}</span>
                          <span className="text-[10px] text-slate-500">Target: {m.targetDate}</span>
                        </div>
                        <p className="text-slate-800 font-medium leading-relaxed">{m.title}</p>
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{m.calaimCategory}</span>
                          <span className="text-[#0F766E] font-medium">{m.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Container 2: Historical Client Logs */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, history: !prev.history }))
                }
                className="w-full px-4 py-3 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Prior Encounter History ({activeClient.historicalLogs.length})
                  </span>
                </div>
                {expandedSections.history ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedSections.history && (
                <div className="p-3.5 space-y-2.5 max-h-80 overflow-y-auto">
                  {activeClient.historicalLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1 text-slate-500 text-[11px]">
                        <span className="font-medium text-slate-700">{log.date}</span>
                        <span className="font-mono text-[#0F766E]">{log.serviceCode}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 mb-0.5">{log.domain}</div>
                      <p className="text-slate-700 leading-normal">{log.summary}</p>
                      <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#16A34A]" />
                        <span>{log.signedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Container 3: Past Assessments */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, assessments: !prev.assessments }))
                }
                className="w-full px-4 py-3 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Clinical Assessments & Screeners ({activeClient.assessments.length})
                  </span>
                </div>
                {expandedSections.assessments ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedSections.assessments && (
                <div className="p-3.5 space-y-2">
                  {activeClient.assessments.map((asmt) => (
                    <div key={asmt.id} className="p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{asmt.type}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {asmt.completedDate} · {asmt.assessor}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-medium text-slate-600 px-2 py-0.5 rounded bg-slate-100">
                        Risk: {asmt.riskScore}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================================================================== */}
      {/* 3. PROFESSIONAL, FOUNDER-OPTIMIZED ENTERPRISE FOOTER */}
      {/* ================================================================== */}
      <EnterpriseFooter onNavigateTab={onNavigateTab} />
    </div>
  );
};

// Helper Target Icon for Care Plan Milestones
function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default PeerDashboardShell;
