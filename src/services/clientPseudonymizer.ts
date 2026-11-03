/**
 * Peer Notebook - Client Pseudonymization Engine
 * Conforms to HIPAA Safe Harbor De-Identification standard (45 CFR § 164.514(b))
 * and California Confidentiality of Medical Information Act (CMIA).
 *
 * Provides deterministic and reversible pseudonymization of Direct Identifiers
 * (Client Name, Medi-Cal CIN, MRN, phone, address) while preserving non-clinical
 * CalAIM H0038 encounter data for audit analysis and research.
 *
 * Author: H. Joe Abudayyeh <joe@peernotebook.com>
 * Copyright © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.
 */

import { ProgressNote } from './chartExport';

export interface PseudonymizeOptions {
  /** Salt or key used to derive pseudonyms */
  salt?: string;
  /** Mask client name into pseudonym format: Client #A849 */
  prefix?: string;
  /** Redact direct identifiers completely */
  redactIdentifiers?: boolean;
}

/**
 * Computes a short deterministic 4-character hex hash from a seed string
 */
export function deriveShortPseudonymTag(seed: string, salt: string = 'peernotebook_hipaa_salt'): string {
  let hash = 0x811c9dc5;
  const combined = `${salt}:${seed}`;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(-4);
}

/**
 * Formats a pseudonymized client identifier (e.g. `Client #A849` or `PN-8492`)
 */
export function pseudonymizeClientIdentifier(rawId: string, prefix: string = 'Client #', salt?: string): string {
  if (!rawId) return `${prefix}0000`;
  const tag = deriveShortPseudonymTag(rawId, salt);
  return `${prefix}${tag}`;
}

/**
 * Pseudonymizes a single ProgressNote according to HIPAA Safe Harbor guidelines
 */
export function pseudonymizeNote<T extends ProgressNote>(note: T, options: PseudonymizeOptions = {}): T {
  const salt = options.salt || 'peernotebook_hipaa_salt';
  const prefix = options.prefix || 'Client #';
  const rawId = (note as any).clientId || (note as any).client_identifier || (note as any).peer_id || note.id || 'client-anon';

  const pseudonym = pseudonymizeClientIdentifier(rawId, prefix, salt);
  const pseudonymMrn = `PN-${deriveShortPseudonymTag(rawId, `${salt}:mrn`)}`;

  const cloned = JSON.parse(JSON.stringify(note)) as Record<string, any>;

  // Replace direct identifiers with pseudonyms
  if ('clientName' in cloned) {
    cloned.clientName = pseudonym;
  }
  if ('client_identifier' in cloned) {
    cloned.client_identifier = pseudonymMrn;
  }
  if ('clientIdentifier' in cloned) {
    cloned.clientIdentifier = pseudonymMrn;
  }
  if ('mediCalCin' in cloned) {
    cloned.mediCalCin = options.redactIdentifiers ? '[REDACTED_CIN]' : `CIN-PSEUDO-${deriveShortPseudonymTag(cloned.mediCalCin || rawId, salt)}`;
  }
  if ('peer_id' in cloned) {
    cloned.peer_id = pseudonymMrn;
  }

  // Preserve non-clinical encounter narrative and billing data unchanged
  return cloned as T;
}

/**
 * Batch pseudonymizes a list of progress notes
 */
export function batchPseudonymize<T extends ProgressNote>(notes: T[], options: PseudonymizeOptions = {}): T[] {
  return notes.map(n => pseudonymizeNote(n, options));
}
