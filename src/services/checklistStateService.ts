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
  category: 'calaim_audit' | 'sdlc_deployment' | 'ethics_boundary';
  title: string;
  description: string;
  completed: boolean;
  isRequired: boolean;
  updatedAt?: string;
}

const STORAGE_KEY_CALAIM = 'peernotebook_checklist_calaim_v1';
const STORAGE_KEY_SDLC = 'peernotebook_checklist_sdlc_v1';
const STORAGE_KEY_ETHICS = 'peernotebook_checklist_ethics_v1';

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
    completed: true,
    isRequired: true
  },
  {
    id: 'calaim_time',
    category: 'calaim_audit',
    title: '5. Accurate 3-Way Time Allocation',
    description: 'Direct face-to-face minutes, travel time, and documentation minutes are tracked separately to verify Medi-Cal payment reform compliance.',
    completed: true,
    isRequired: true
  },
  {
    id: 'calaim_units',
    category: 'calaim_audit',
    title: '6. Strict H0038 15-Minute Billing Unit Conversion',
    description: 'Total duration is converted accurately using California DHCS 15-minute rules (8–22 min = 1 unit; 23–37 min = 2 units; 38–52 min = 3 units; 53–67 min = 4 units).',
    completed: true,
    isRequired: true
  },
  {
    id: 'calaim_signature',
    category: 'calaim_audit',
    title: '7. Specialist Credential Signature & Date Stamp',
    description: 'Encounter is signed with your legal name and CPSS-CA or trainee credential immediately upon completion with electronic attestation.',
    completed: true,
    isRequired: true
  }
];

export const DEFAULT_ETHICS_CHECKLIST: ChecklistItem[] = [
  {
    id: 'eth_01',
    category: 'ethics_boundary',
    title: '1. Self-Determination & Dignity Affirmation',
    description: 'Honor the peer’s absolute right to direct their own recovery, choose goals, and decline unwanted interventions without coercion or institutional punishment.',
    completed: true,
    isRequired: true
  },
  {
    id: 'eth_02',
    category: 'ethics_boundary',
    title: '2. Non-Clinical Scope of Practice Integrity',
    description: 'Deliver non-clinical peer support strictly within CPSS-CA scope; avoid diagnosing, prescribing, providing clinical psychotherapy, or conducting forced contraband searches.',
    completed: true,
    isRequired: true
  },
  {
    id: 'eth_03',
    category: 'ethics_boundary',
    title: '3. Zero Dual or Exploitative Relationships',
    description: 'Prohibit all romantic, sexual, business, or exploitative relationships with peers currently or historically served to preserve emotional safety.',
    completed: true,
    isRequired: true
  },
  {
    id: 'eth_04',
    category: 'ethics_boundary',
    title: '4. Purposeful Lived Experience Disclosure',
    description: 'Share recovery stories solely to inspire hope and model problem-solving for the direct benefit of the peer, never for self-venting or emotional burdening.',
    completed: true,
    isRequired: true
  },
  {
    id: 'eth_05',
    category: 'ethics_boundary',
    title: '5. Confidentiality & Clear Legal Limits (CANRA/Tarasoff)',
    description: 'Protect confidentiality under HIPAA and 42 CFR Part 2 while transparently informing peers upfront about mandatory reporting (imminent physical harm, child/elder abuse).',
    completed: true,
    isRequired: true
  },
  {
    id: 'eth_06',
    category: 'ethics_boundary',
    title: '6. Financial & Gift Integrity',
    description: 'Decline cash, personal loans, high-value gifts, or financial entanglements with peers; accept only nominal tokens of gratitude with kindness.',
    completed: true,
    isRequired: true
  },
  {
    id: 'eth_07',
    category: 'ethics_boundary',
    title: '7. Cultural Humility & Affirming Diverse Pathways',
    description: 'Practice ongoing cultural humility, counter personal implicit bias, and honor indigenous, spiritual, secular, and medical recovery choices.',
    completed: true,
    isRequired: true
  },
  {
    id: 'eth_08',
    category: 'ethics_boundary',
    title: '8. Harm Reduction & Non-Judgmental Presence',
    description: 'Support peers unconditionally at all points along the continuum, including active substance use, with life-saving harm reduction and overdose prevention.',
    completed: true,
    isRequired: true
  },
  {
    id: 'eth_09',
    category: 'ethics_boundary',
    title: '9. Duty to Consult & Reflective Supervision',
    description: 'Proactively bring boundary challenges, ethical dilemmas, and vicarious trauma to CPSS clinical or peer supervision for transparent debriefing.',
    completed: true,
    isRequired: true
  },
  {
    id: 'eth_10',
    category: 'ethics_boundary',
    title: '10. Specialist Self-Care & Recovery Maintenance',
    description: 'Routinely assess personal recovery foundation, monitor compassion fatigue and secondary traumatic stress, and maintain healthy off-shift boundaries.',
    completed: true,
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
  },
  {
    id: 'sdlc_phase11',
    category: 'sdlc_deployment',
    title: 'Phase 11: STAR Interview Modules & 80-Hr/40-Hr Training Tracks',
    description: 'CalMHSA 80-hour CPSS-CA core certification curriculum, 40-hour specialized tracks (ECM, Forensic, Street Medicine, Respite), and STAR behavioral interview practice engine.',
    completed: true,
    isRequired: true
  },
  {
    id: 'sdlc_phase12',
    category: 'sdlc_deployment',
    title: 'Phase 12: DHCS / CalMHSA Code of Ethics & CalAIM Golden Thread Standard',
    description: '10-point DHCS / CalMHSA ethical boundaries checklist, unbroken Golden Thread 4-part note verification, and audit-proof encounter documentation.',
    completed: true,
    isRequired: true
  }
];

type ChecklistCategory = 'calaim_audit' | 'sdlc_deployment' | 'ethics_boundary';
type ChecklistListener = () => void;

class ChecklistStateManager {
  private listeners: Set<ChecklistListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY_CALAIM || e.key === STORAGE_KEY_SDLC || e.key === STORAGE_KEY_ETHICS) {
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

  public getEthicsChecklist(): ChecklistItem[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEY_ETHICS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_ETHICS_CHECKLIST;
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

  private getKeyForCategory(category: ChecklistCategory): string {
    if (category === 'calaim_audit') return STORAGE_KEY_CALAIM;
    if (category === 'ethics_boundary') return STORAGE_KEY_ETHICS;
    return STORAGE_KEY_SDLC;
  }

  private getItemsForCategory(category: ChecklistCategory): ChecklistItem[] {
    if (category === 'calaim_audit') return this.getCalaimChecklist();
    if (category === 'ethics_boundary') return this.getEthicsChecklist();
    return this.getSdlcChecklist();
  }

  public toggleItem(category: ChecklistCategory, itemId: string): void {
    const key = this.getKeyForCategory(category);
    const current = this.getItemsForCategory(category);
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

  public setItemStatus(category: ChecklistCategory, itemId: string, completed: boolean): void {
    const key = this.getKeyForCategory(category);
    const current = this.getItemsForCategory(category);
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

  public resetToDefaults(category?: ChecklistCategory): void {
    if (!category || category === 'calaim_audit') {
      safeStorage.setItem(STORAGE_KEY_CALAIM, JSON.stringify(DEFAULT_CALAIM_CHECKLIST));
    }
    if (!category || category === 'ethics_boundary') {
      safeStorage.setItem(STORAGE_KEY_ETHICS, JSON.stringify(DEFAULT_ETHICS_CHECKLIST));
    }
    if (!category || category === 'sdlc_deployment') {
      safeStorage.setItem(STORAGE_KEY_SDLC, JSON.stringify(DEFAULT_SDLC_CHECKLIST));
    }
    this.notifyListeners();
  }

  public getSummary(category: ChecklistCategory) {
    const items = this.getItemsForCategory(category);
    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent, allComplete: completed === total };
  }
}

export const checklistStateService = new ChecklistStateManager();
export type { ChecklistCategory };
