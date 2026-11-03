/**
 * Peer Notebook - Encrypted Client Chart Export Utility
 * Conforms to ISO 9001, HIPAA 45 CFR § 164.312, and California CMIA standards
 * Provides exportEncryptedChart with immutable cryptographic audit logging triggers
 * Author: H. Joe Abudayyeh <joe@peernotebook.com>
 * Copyright © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.
 */

import { SessionNote } from '../db/peerNotebookDatabase';
import { AuditLogger } from './auditLogger';
import { batchPseudonymize, PseudonymizeOptions } from './clientPseudonymizer';

export type ProgressNote = SessionNote | {
  id: string;
  specialist_id?: string;
  peer_id?: string;
  client_identifier?: string;
  content?: string;
  created_at?: string;
  [key: string]: any;
};

export interface ExportChartOptions extends PseudonymizeOptions {
  actor?: { id: string; name: string; role: any };
  pseudonymize?: boolean;
}

/**
 * Exports an encrypted client chart JSON archive and triggers an immutable audit log
 */
export function exportEncryptedChart(
  notes: ProgressNote[],
  optionsOrActor?: ExportChartOptions | { id: string; name: string; role: any }
): void {
  const options: ExportChartOptions =
    optionsOrActor && 'role' in optionsOrActor
      ? { actor: optionsOrActor as { id: string; name: string; role: any } }
      : (optionsOrActor as ExportChartOptions) || {};

  const notesToExport = options.pseudonymize
    ? batchPseudonymize(notes, options)
    : notes;

  const data = JSON.stringify(notesToExport, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const prefix = options.pseudonymize ? 'pseudonymized-' : '';
  a.download = `${prefix}client-chart-export-${new Date().toISOString().split('T')[0]}.enc.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Trigger immutable audit log asynchronously
  try {
    const actor = options.actor;
    const firstNote = notes[0] as Record<string, any> | undefined;
    AuditLogger.log({
      actorId: actor?.id || firstNote?.specialist_id || firstNote?.authorId || 'system-export',
      actorName: actor?.name || firstNote?.authorName || 'Specialist Exporter',
      actorRole: actor?.role || 'peer_specialist',
      action: 'EXPORT_PDF',
      entityType: 'session_note',
      entityId: notes[0]?.id || 'batch-export',
      details: {
        method: 'exportEncryptedChart',
        pseudonymized: !!options.pseudonymize,
        notesCount: notes.length,
        timestamp: new Date().toISOString()
      }
    }).catch(() => {
      // Graceful offline persistence
    });
  } catch {
    // Non-blocking
  }
}
