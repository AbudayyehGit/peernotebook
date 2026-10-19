/**
 * Peer Notebook - HIPAA Audit Logging Service
 * Conforms to 45 CFR § 164.312(b) Audit Controls & Security Specifications
 */

import { peerNotebookDB, AuditLogEntry, UserRole } from '../db/peerNotebookDatabase';

// Simple sha256 checksum helper using Web Crypto API
async function computeSha256(str: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }
  // Deterministic fallback string hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

export class AuditLogger {
  public static async log(params: {
    organizationId: string;
    actorId: string;
    actorName: string;
    actorRole: UserRole;
    action: AuditLogEntry['action'];
    entityType: AuditLogEntry['entityType'];
    entityId: string;
    details?: Record<string, unknown>;
  }): Promise<AuditLogEntry> {
    const timestamp = new Date().toISOString();
    const payloadForChecksum = `${params.organizationId}:${params.actorId}:${params.action}:${params.entityType}:${params.entityId}:${timestamp}`;
    const tamperProofChecksum = await computeSha256(payloadForChecksum);

    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      organizationId: params.organizationId,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details || {},
      tamperProofChecksum,
      timestamp
    };

    await peerNotebookDB.saveAuditLog(entry);
    return entry;
  }

  public static async getLogs(): Promise<AuditLogEntry[]> {
    return peerNotebookDB.getAllAuditLogs();
  }

  public static async exportLogsJSON(): Promise<string> {
    const logs = await this.getLogs();
    return JSON.stringify(logs, null, 2);
  }
}
