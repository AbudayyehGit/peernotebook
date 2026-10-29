/**
 * Peer Notebook - Interactive Checklist State Engine
 * GA #8 Production Standard • Local-First Durability
 * Manages real-time state for:
 * 1. CalAIM H0038 7-Point Note Compliance Audit Checklist
 * 2. SDLC Master Engineering & Deployment Verification Checklist
 * Synchronizes across localStorage (safeStorage) and Dexie.js IndexedDB sessions.
 */

import { safeStorage } from '../utils/safeStorage';

export interface ChecklistItem {
  id: string;
  category: 'calaim_audit' | 'sdlc_deployment';
  title: string;
  description: string;
  completed: boolean;
  isRequired: boolean;
  updatedAt?: string;
}

const STORAGE_KEY_CALAIM = 'peernotebook_checklist_calaim_v1';
const STORAGE_KEY_SDLC = 'peernotebook_checklist_sdlc_v1';

export const DEFAULT_CALAIM_CHECKLIST: ChecklistItem[] = [
  {
    id: 'calaim_goal',
    category: 'calaim_audit',
    title: '1. CalAIM Medical Necessity & Recovery Goal Linkage',
    description: 'Encounter directly references the peer client’s active recovery goal (e.g. permanent supportive housing, harm reduction, community navigation) rather than general conversation.',
    completed: true,
    isRequired: true
  },
  {
    id: 'calaim_scope',
    category: 'calaim_audit',
    title: '2. Clear Peer Specialist Scope of Practice (Non-Clinical)',
    description: 'Intervention clearly highlights peer-delivered support (lived experience modeling, mutual empowerment, crisis de-escalation) and explicitly avoids licensed psychotherapeutic terminology.',
    completed: true,
    isRequired: true
  },
  {
    id: 'calaim_quote',
    category: 'calaim_audit',
    title: '3. Direct Quotation of Client’s Own Words',
    description: 'The "Client Response" section includes at least one authentic verbatim quote from the peer reflecting their emotional state, self-advocacy, or personal insight.',
    completed: true,
    isRequired: true
  },
  {
    id: 'calaim_intervention',
    category: 'calaim_audit',
    title: '4. Concrete, Actionable Peer Intervention Named',
    description: 'Specific interventions are stated (e.g. "Reviewed housing voucher application step-by-step; practiced role-playing landlord phone interview").',
    completed: false,
    isRequired: true
  },
  {
    id: 'calaim_time',
    category: 'calaim_audit',
    title: '5. Accurate 3-Way Time Allocation',
    description: 'Direct face-to-face minutes, travel time, and documentation minutes are tracked separately to verify Medi-Cal payment reform compliance.',
    completed: false,
    isRequired: true
  },
  {
    id: 'calaim_units',
    category: 'calaim_audit',
    title: '6. Strict H0038 15-Minute Billing Unit Conversion',
    description: 'Total duration is converted accurately using California DHCS 15-minute rules (8–22 min = 1 unit; 23–37 min = 2 units; 38–52 min = 3 units; 53–67 min = 4 units).',
    completed: false,
    isRequired: true
  },
  {
    id: 'calaim_signature',
    category: 'calaim_audit',
    title: '7. Specialist Credential Signature & Date Stamp',
    description: 'Encounter is signed with your legal name and CPSS-CA or trainee credential immediately upon completion with electronic attestation.',
    completed: false,
    isRequired: true
  }
];

export const DEFAULT_SDLC_CHECKLIST: ChecklistItem[] = [
  {
    id: 'sdlc_phase1',
    category: 'sdlc_deployment',
    title: 'Phase 1: Planning, Strategy & Domain Compliance',
    description: 'CalAIM documentation workflows, zero-AI deterministic PWA architecture, and Medi-Cal H0038 requirements mapped.',
    completed: true,
    isRequired: true
  },
  {
    id: 'sdlc_phase2',
    category: 'sdlc_deployment',
    title: 'Phase 2: UI/UX Design System & Theme Integration',
    description: 'Trauma-informed clinical color palette (Slate, Navy, Teal, Amber), WCAG 2.1 AA 48px touch targets, and mobile viewports verified.',
    completed: true,
    isRequired: true
  },
  {
    id: 'sdlc_phase3',
    category: 'sdlc_deployment',
    title: 'Phase 3: Core PWA Offline Storage & Sync Engine',
    description: 'Dexie.js IndexedDB local vault persistence, background Supabase bi-directional sync worker, and JSON backup portability.',
    completed: true,
    isRequired: true
  },
  {
    id: 'sdlc_phase4',
    category: 'sdlc_deployment',
    title: 'Phase 4: Standalone Repository & Vercel Pipeline',
    description: 'Isolated standalone repository (peernotebook), Vercel production build scripts, and custom domain peernotebook.com SSL resolution.',
    completed: true,
    isRequired: true
  },
  {
    id: 'sdlc_phase5',
    category: 'sdlc_deployment',
    title: 'Phase 5: Resend Email Pipeline & Zero Silent Failures',
    description: 'Automated 6-digit registration OTP verification, lead waitlist notifications to support@peernotebook.com, and daily telemetry digests.',
    completed: true,
    isRequired: true
  },
  {
    id: 'sdlc_phase6',
    category: 'sdlc_deployment',
    title: 'Phase 6: CBO Interoperability & General Availability',
    description: 'HL7 FHIR R4, HL7 v2.x, and C-CDA XML clinical exports; dual-path subscription onboarding; ISO 9001 and W3C code validation.',
    completed: true,
    isRequired: true
  },
  {
    id: 'sdlc_phase7',
    category: 'sdlc_deployment',
    title: 'Phase 7: California SB 803 17 Core Competencies',
    description: 'Mapped all 17 CalMHSA / SB 803 competencies with plain-English documentation prompts and in-note tagging.',
    completed: true,
    isRequired: true
  },
  {
    id: 'sdlc_phase8',
    category: 'sdlc_deployment',
    title: 'Phase 8: CBO Onboarding & Governance Dashboard (/admin/dashboard)',
    description: 'Guided 6-step Medi-Cal provider checklist, BAA tracking, NPI configuration, and CalAIM monthly capacity tracker.',
    completed: true,
    isRequired: true
  },
  {
    id: 'sdlc_phase9',
    category: 'sdlc_deployment',
    title: 'Phase 9: Engineering Telemetry Portal (/engineering/monitoring)',
    description: 'Real-time IndexedDB metrics, sync queue latency, SHA-256 audit log integrity validator, and 5-check diagnostic suite.',
    completed: true,
    isRequired: true
  },
  {
    id: 'sdlc_phase10',
    category: 'sdlc_deployment',
    title: 'Phase 10: 1099 Contractor vs. W-2 Employee Classification',
    description: 'Dual-path onboarding toggles, IRS $0.67/mi mileage tracking, hourly rate configuration, and supervisor cosignature routing.',
    completed: true,
    isRequired: true
  }
];

type ChecklistListener = () => void;

class ChecklistStateManager {
  private listeners: Set<ChecklistListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY_CALAIM || e.key === STORAGE_KEY_SDLC) {
          this.notifyListeners();
        }
      });
    }
  }

  public subscribe(listener: ChecklistListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // Safe execution
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('peernotebook:checklist-update'));
    }
  }

  public getCalaimChecklist(): ChecklistItem[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEY_CALAIM);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_CALAIM_CHECKLIST;
  }

  public getSdlcChecklist(): ChecklistItem[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEY_SDLC);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_SDLC_CHECKLIST;
  }

  public toggleItem(category: 'calaim_audit' | 'sdlc_deployment', itemId: string): void {
    const key = category === 'calaim_audit' ? STORAGE_KEY_CALAIM : STORAGE_KEY_SDLC;
    const current = category === 'calaim_audit' ? this.getCalaimChecklist() : this.getSdlcChecklist();
    const updated = current.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          completed: !item.completed,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    safeStorage.setItem(key, JSON.stringify(updated));
    this.notifyListeners();
  }

  public setItemStatus(category: 'calaim_audit' | 'sdlc_deployment', itemId: string, completed: boolean): void {
    const key = category === 'calaim_audit' ? STORAGE_KEY_CALAIM : STORAGE_KEY_SDLC;
    const current = category === 'calaim_audit' ? this.getCalaimChecklist() : this.getSdlcChecklist();
    const updated = current.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          completed,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    safeStorage.setItem(key, JSON.stringify(updated));
    this.notifyListeners();
  }

  public resetToDefaults(category?: 'calaim_audit' | 'sdlc_deployment'): void {
    if (!category || category === 'calaim_audit') {
      safeStorage.setItem(STORAGE_KEY_CALAIM, JSON.stringify(DEFAULT_CALAIM_CHECKLIST));
    }
    if (!category || category === 'sdlc_deployment') {
      safeStorage.setItem(STORAGE_KEY_SDLC, JSON.stringify(DEFAULT_SDLC_CHECKLIST));
    }
    this.notifyListeners();
  }

  public getSummary(category: 'calaim_audit' | 'sdlc_deployment') {
    const items = category === 'calaim_audit' ? this.getCalaimChecklist() : this.getSdlcChecklist();
    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    const percent = Math.round((completed / total) * 100);
    return { total, completed, percent, allComplete: completed === total };
  }
}

export const checklistStateService = new ChecklistStateManager();
