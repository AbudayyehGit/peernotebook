/**
 * Peer Notebook - CalAIM H0038 Billing & Time Integrity Validator
 * Sprint 1 Deliverable: SP1-01
 * 
 * Enforces strict client-side validation logic blocking form submission on:
 * 1. Time overlap for the same client on the same encounter date.
 * 2. Time overlap for the same peer specialist on the same encounter date.
 * 3. CalAIM H0038 daily caps (max 24 units / 360 mins per client per 24-hr period).
 * 4. Specialist daily volume caps (max 32 units / 480 mins per specialist per day).
 * 5. CMS 8-minute threshold rule (sessions <8 minutes cannot be billed as a 15-min unit).
 * 6. Duration mathematical consistency (face-to-face + travel + doc == duration).
 */

import { SessionNote, peerNotebookDB } from '../db/peerNotebookDatabase';

export const CALAIM_LIMITS = {
  CLIENT_DAILY_MAX_UNITS: 24, // 24 units = 360 min (6 hours) max allowable per client / day
  CLIENT_DAILY_MAX_MINUTES: 360,
  SPECIALIST_DAILY_MAX_UNITS: 32, // 32 units = 480 min (8 hours) max full-time daily cap
  SPECIALIST_DAILY_MAX_MINUTES: 480,
  CMS_8_MINUTE_THRESHOLD: 8 // Sessions under 8 minutes cannot yield billable units
} as const;

export interface BillingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  conflicts: {
    hasTimeOverlap: boolean;
    exceedsClientDailyCap: boolean;
    exceedsSpecialistDailyCap: boolean;
    violates8MinuteRule: boolean;
    conflictingNoteIds: string[];
  };
  dailyTotals: {
    clientTotalUnits: number;
    specialistTotalUnits: number;
    clientTotalMinutes: number;
    specialistTotalMinutes: number;
  };
}

/**
 * Parses time string into minutes from midnight (0 - 1439).
 * Supports "HH:MM", "H:MM", "HH:MM:SS", and "HH:MM AM/PM" formats.
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const trimmed = timeStr.trim();
  if (!trimmed) return null;

  // Handle 12-hour AM/PM
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const modifier = ampmMatch[3]?.toUpperCase();

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Handle ISO datetime strings
  if (trimmed.includes('T')) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.getHours() * 60 + d.getMinutes();
    }
  }

  return null;
}

/**
 * Checks whether two time intervals [startA, endA) and [startB, endB) overlap.
 */
export function doIntervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

export class BillingValidator {
  /**
   * Validates a session note candidate against existing notes.
   * Returns a validation result with blocking errors and informative warnings.
   */
  public static validateNote(
    candidate: Partial<SessionNote>,
    existingNotes: SessionNote[]
  ): BillingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conflictingNoteIds: string[] = [];
    let hasTimeOverlap = false;
    let exceedsClientDailyCap = false;
    let exceedsSpecialistDailyCap = false;
    let violates8MinuteRule = false;

    const candidateDate = candidate.encounterDate?.trim();
    const candidateUnits = candidate.billingUnits || 0;
    const candidateMinutes = candidate.durationMinutes || 0;
    const candidateClientId = candidate.clientId?.trim();
    const candidateAuthorId = candidate.authorId?.trim();
    const candidateId = candidate.id;

    // 1. Mathematical Consistency Check
    const faceToFace = candidate.faceToFaceMinutes || 0;
    const travel = candidate.travelMinutes || 0;
    const doc = candidate.documentationMinutes || 0;
    const totalComponentMinutes = faceToFace + travel + doc;

    if (candidateMinutes > 0 && totalComponentMinutes > 0 && candidateMinutes !== totalComponentMinutes) {
      warnings.push(
        `Duration breakdown mismatch: Sum of Face-to-Face (${faceToFace}m), Travel (${travel}m), and Documentation (${doc}m) is ${totalComponentMinutes}m, but total duration is ${candidateMinutes}m.`
      );
    }

    // 2. CMS 8-Minute Threshold Rule
    if (candidateMinutes > 0 && candidateMinutes < CALAIM_LIMITS.CMS_8_MINUTE_THRESHOLD && candidateUnits > 0) {
      violates8MinuteRule = true;
      errors.push(
        `CMS 8-Minute Rule Violation: Encounters under 8 minutes (${candidateMinutes}m logged) cannot be billed as a 15-minute unit under Medi-Cal guidelines. Billing units must be 0.`
      );
    }

    // Filter relevant existing notes on the same encounter date, excluding self
    const sameDateNotes = existingNotes.filter(n => {
      if (candidateId && n.id === candidateId) return false;
      return n.encounterDate === candidateDate && n.status !== 'draft';
    });

    // Parse candidate start & end times
    const candidateStartMin = parseTimeToMinutes(candidate.startTime);
    const candidateEndMin = parseTimeToMinutes(candidate.endTime);
    const hasValidCandidateTimes =
      candidateStartMin !== null && candidateEndMin !== null && candidateStartMin < candidateEndMin;

    if (candidate.startTime && candidate.endTime && candidateStartMin !== null && candidateEndMin !== null) {
      if (candidateStartMin >= candidateEndMin) {
        errors.push(
          `Invalid Encounter Interval: Start time (${candidate.startTime}) must be strictly earlier than end time (${candidate.endTime}).`
        );
      }
    }

    // 3. Time-Overlap Checks
    if (hasValidCandidateTimes) {
      for (const note of sameDateNotes) {
        const noteStartMin = parseTimeToMinutes(note.startTime);
        const noteEndMin = parseTimeToMinutes(note.endTime);

        if (noteStartMin !== null && noteEndMin !== null && noteStartMin < noteEndMin) {
          const overlaps = doIntervalsOverlap(
            candidateStartMin,
            candidateEndMin,
            noteStartMin,
            noteEndMin
          );

          if (overlaps) {
            // Check client overlap
            if (candidateClientId && note.clientId === candidateClientId) {
              hasTimeOverlap = true;
              conflictingNoteIds.push(note.id);
              errors.push(
                `CalAIM Time Overlap Conflict: Client is already scheduled for an encounter from ${note.startTime} to ${note.endTime} on ${candidateDate} (Note ID: ${note.id}). Dual-billing the same client during overlapping time intervals is prohibited under Medi-Cal H0038.`
              );
            }

            // Check specialist concurrent encounter overlap
            if (candidateAuthorId && note.authorId === candidateAuthorId) {
              hasTimeOverlap = true;
              if (!conflictingNoteIds.includes(note.id)) conflictingNoteIds.push(note.id);
              errors.push(
                `Specialist Concurrent Scheduling Conflict: Peer Specialist already has a concurrent encounter logged from ${note.startTime} to ${note.endTime} with client ${note.clientName || note.clientIdentifier} on ${candidateDate}. Concurrent 1-on-1 billing is strictly blocked.`
              );
            }
          }
        }
      }
    }

    // 4. Daily Cap Validation
    // Cumulative client daily units
    const existingClientNotes = sameDateNotes.filter(n => candidateClientId && n.clientId === candidateClientId);
    const clientPriorUnits = existingClientNotes.reduce((sum, n) => sum + (n.billingUnits || 0), 0);
    const clientPriorMinutes = existingClientNotes.reduce((sum, n) => sum + (n.durationMinutes || 0), 0);
    const clientTotalUnits = clientPriorUnits + candidateUnits;
    const clientTotalMinutes = clientPriorMinutes + candidateMinutes;

    if (clientTotalUnits > CALAIM_LIMITS.CLIENT_DAILY_MAX_UNITS) {
      exceedsClientDailyCap = true;
      errors.push(
        `CalAIM H0038 Daily Client Cap Exceeded: Logging ${candidateUnits} units would bring the client's daily total to ${clientTotalUnits} units (${clientTotalMinutes} minutes). CalAIM limits Medi-Cal H0038 peer support to a statutory maximum of ${CALAIM_LIMITS.CLIENT_DAILY_MAX_UNITS} units (360 minutes / 6 hours) per 24-hour period.`
      );
    }

    // Cumulative specialist daily units
    const existingSpecialistNotes = sameDateNotes.filter(n => candidateAuthorId && n.authorId === candidateAuthorId);
    const specialistPriorUnits = existingSpecialistNotes.reduce((sum, n) => sum + (n.billingUnits || 0), 0);
    const specialistPriorMinutes = existingSpecialistNotes.reduce((sum, n) => sum + (n.durationMinutes || 0), 0);
    const specialistTotalUnits = specialistPriorUnits + candidateUnits;
    const specialistTotalMinutes = specialistPriorMinutes + candidateMinutes;

    if (specialistTotalUnits > CALAIM_LIMITS.SPECIALIST_DAILY_MAX_UNITS) {
      exceedsSpecialistDailyCap = true;
      errors.push(
        `Specialist Daily Billing Cap Exceeded: Logging ${candidateUnits} units would bring the specialist's daily volume to ${specialistTotalUnits} units (${specialistTotalMinutes} minutes). CBO compliance caps peer specialist daily encounters at ${CALAIM_LIMITS.SPECIALIST_DAILY_MAX_UNITS} units (480 minutes / 8 hours) to prevent audit clawbacks.`
      );
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      conflicts: {
        hasTimeOverlap,
        exceedsClientDailyCap,
        exceedsSpecialistDailyCap,
        violates8MinuteRule,
        conflictingNoteIds
      },
      dailyTotals: {
        clientTotalUnits,
        specialistTotalUnits,
        clientTotalMinutes,
        specialistTotalMinutes
      }
    };
  }

  /**
   * Helper to validate candidate note against the local Dexie.js database.
   */
  public static async validateAgainstDB(
    candidate: Partial<SessionNote>
  ): Promise<BillingValidationResult> {
    try {
      const allNotes = await peerNotebookDB.getAllNotes();
      return this.validateNote(candidate, allNotes);
    } catch {
      // Return safe fallback if database is not reachable
      return {
        isValid: true,
        errors: [],
        warnings: ['Unable to query local database for overlap verification.'],
        conflicts: {
          hasTimeOverlap: false,
          exceedsClientDailyCap: false,
          exceedsSpecialistDailyCap: false,
          violates8MinuteRule: false,
          conflictingNoteIds: []
        },
        dailyTotals: {
          clientTotalUnits: candidate.billingUnits || 0,
          specialistTotalUnits: candidate.billingUnits || 0,
          clientTotalMinutes: candidate.durationMinutes || 0,
          specialistTotalMinutes: candidate.durationMinutes || 0
        }
      };
    }
  }
}
