/**
 * Peer Notebook - Core Dual-Layer Persistence Engine (Dexie.js / IndexedDB)
 * GA #8 Enterprise Grade • CalAIM & Medi-Cal H0038 Compliant
 * Syncs seamlessly with PostgreSQL / Supabase cloud store
 */

import Dexie, { Table } from 'dexie';

export interface Organization {
  id: string;
  name: string;
  npi: string;
  medicaidProviderId: string;
  countyCode: string; // California Medi-Cal County Code (e.g. '01-Alameda', '19-Los Angeles', '38-San Francisco')
  calaimContractActive: boolean;
  baaSignedAt: string;
  baaVersion: string;
  contactEmail?: string;
  contactPhone?: string;
  contractType?: 'CBO Partner' | 'County Health Department' | 'Managed Care Plan (MCP)' | 'Contracted Provider';
  allocatedMonthlyUnits?: number;
}

export type UserRole = 'peer_specialist' | 'supervisor' | 'admin' | 'compliance_officer';
export type AccountType = 'agency_cbo' | 'solo_1099';
export type EmploymentType = 'w2_employee' | '1099_contractor';
export type SubscriptionStatus = 'trialing' | 'active' | 'active_subscriber' | 'past_due' | 'canceled' | 'incomplete' | 'unpaid';
export type SubscriptionTier = 'founding_specialist' | 'solo_1099_pro' | 'agency_unlimited';
export type BillingInterval = 'monthly' | 'annual';

export interface User {
  id: string;
  organizationId?: string; // Optional for solo 1099 independent practitioners
  accountType?: AccountType; // 'agency_cbo' or 'solo_1099'
  employmentType?: EmploymentType; // 'w2_employee' or '1099_contractor'
  email: string;
  fullName: string;
  credentialTitle: string; // e.g. Medi-Cal Certified Peer Support Specialist (CPSS-CA)
  licenseNumber: string;
  npi?: string;
  role: UserRole;
  isActive: boolean;
  // Contractor / 1099 Tax Classification & Billing Settings
  isContractor1099?: boolean;
  contractorTaxId?: string; // EIN / W-9 reference
  contractAgencyName?: string;
  hourlyContractRate?: number; // e.g. $45/hr
  mileageReimbursementRate?: number; // e.g. $0.67/mile

  // Stripe Billing & 14-Day Free Trial
  trialEndsAt?: string;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionTier?: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  billingInterval?: BillingInterval;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface Client {
  id: string;
  organizationId?: string; // Optional for solo 1099 independent practitioners
  clientIdentifier: string; // MRN Code (e.g. PN-4091)
  mediCalCin?: string; // Medi-Cal Client Index Number (e.g. 98234120A)
  preferredName: string;
  dateOfBirth?: string;
  gender?: string;
  assignedSpecialistId: string;
  recoveryGoals: string[];
  currentStatus: 'Active Recovery' | 'Maintenance' | 'Intensive Support' | 'Completed Program';
  calaimPathway: 'Community Supports' | 'Enhanced Care Management (ECM)' | 'SMHS Peer Support' | 'DMC-ODS Recovery Services';
  consentSigned: boolean;
  consentDate: string;
  phone?: string;
  emergencyContact?: string;
  lastEncounterDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteStatus = 'draft' | 'pending_supervisor' | 'approved' | 'revision_requested';
export type ServiceModality = 'community_field' | 'face_to_face' | 'telehealth_video' | 'phone_outreach';

export interface SessionNote {
  id: string;
  organizationId?: string; // Optional for solo 1099 independent practitioners
  clientId: string;
  clientName: string;
  clientIdentifier: string;
  mediCalCin?: string;
  authorId: string;
  authorName: string;
  authorCredentials: string;
  encounterDate: string;
  startTime: string;
  endTime: string;
  
  // CalAIM Time Accounting (Direct Face-to-Face + Travel + Documentation)
  faceToFaceMinutes: number;
  travelMinutes: number;
  documentationMinutes: number;
  durationMinutes: number; // Sum of total billable time under CalAIM rules

  // Contractor Tracking
  isContractorEncounter?: boolean;
  mileageMiles?: number;
  contractorBillableAmount?: number;

  // Medi-Cal Coding
  billingCode: string; // 'H0038' (Self-help / Peer support services), 'H0038-HQ' (Group), 'H0038-U8' (ECM)
  billingUnits: number; // 1 unit per 15 min increments
  modality: ServiceModality;
  locationDetails: string;
  placeOfServiceCode: string; // '15' (Mobile Unit / Community Field), '99' (Other Place / Community), '11' (Office), '02' (Telehealth)
  
  // Structured CalAIM DAP / Peer Support Documentation
  focusDomains: string[];
  sb803Competencies?: string[]; // CalMHSA / SB 803 17 Core Competencies tagged
  goalAddressed: string; // Strengths-based Recovery Goal
  peerIntervention: string; // Lived experience coaching, system navigation, recovery capital building
  clientResponse: string; // Client engagement, quotes, mood, measurable response
  planNextSteps: string; // Action items before next session
  safetyConcerns: boolean;
  safetyNotes?: string;

  // Electronic Signatures
  specialistSignature: string;
  signedAt?: string;
  status: NoteStatus;

  // Clinical Supervisor Cosignature
  supervisorId?: string;
  supervisorName?: string;
  supervisorSignature?: string;
  supervisorFeedback?: string;
  approvedAt?: string;

  // Dual-Layer Persistence & Cloud Sync
  synced: boolean;
  syncTimestamp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId?: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 'VIEW_CLIENT' | 'CREATE_CLIENT' | 'UPDATE_CLIENT' | 'CREATE_NOTE' | 'EDIT_NOTE' | 'SIGN_NOTE' | 'SUPERVISOR_APPROVAL' | 'REVISE_NOTE' | 'EXPORT_PDF' | 'OFFLINE_SYNC' | 'MANUAL_SYNC' | 'RESTORE_BACKUP' | 'PURGE_CACHE' | 'SYSTEM_ERROR';
  entityType: 'client' | 'session_note' | 'system' | 'auth';
  entityId: string;
  details: Record<string, unknown>;
  tamperProofChecksum: string;
  timestamp: string;
}

export interface StorageMetrics {
  usageBytes: number;
  quotaBytes: number;
  usageFormatted: string;
  quotaFormatted: string;
  percentUsed: number;
  clientCount: number;
  noteCount: number;
  unsyncedNoteCount: number;
  logCount: number;
  queueCount: number;
}

export interface FullBackupPayload {
  version: string;
  exportedAt: string;
  organizationId?: string;
  metadata: {
    system: string;
    baaVersion: string;
    totalRecords: number;
  };
  clients: Client[];
  sessionNotes: SessionNote[];
  auditLogs: AuditLogEntry[];
  organizations: Organization[];
  users: User[];
}

export interface SyncQueueItem {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'session_note' | 'client' | 'audit_log';
  entityId: string;
  payload: unknown;
  enqueuedAt: string;
  retryCount: number;
  status: 'pending' | 'in_progress' | 'failed';
}

export interface SystemSetting {
  key: string;
  value: unknown;
}

// Dexie Database Class
export class PeerNotebookDexieDB extends Dexie {
  organizations!: Table<Organization, string>;
  users!: Table<User, string>;
  clients!: Table<Client, string>;
  session_notes!: Table<SessionNote, string>;
  audit_logs!: Table<AuditLogEntry, string>;
  sync_queue!: Table<SyncQueueItem, string>;
  settings!: Table<SystemSetting, string>;

  constructor() {
    super('PeerNotebook_GA8_DB');
    this.version(1).stores({
      organizations: 'id, name, medicaidProviderId',
      users: 'id, organizationId, email, role',
      clients: 'id, organizationId, clientIdentifier, assignedSpecialistId, currentStatus',
      session_notes: 'id, organizationId, clientId, authorId, status, encounterDate, billingCode, synced',
      audit_logs: 'id, organizationId, actorId, action, entityId, timestamp',
      sync_queue: 'id, status, entityType, enqueuedAt',
      settings: 'key'
    });
  }
}

export const dexieDB = new PeerNotebookDexieDB();

class PeerNotebookDBManager {
  private isSeeded = false;

  public async init(): Promise<void> {
    await dexieDB.open();
    if (!this.isSeeded) {
      await this.purgeMockData();
      await this.seedInitialDataIfEmpty();
      this.isSeeded = true;
    }
  }

  public async seedInitialDataIfEmpty(): Promise<void> {
    // 1. Clean slate: Purge any legacy mock records if present
    await this.purgeMockData();

    // 2. Initialize default organization if not present
    const orgCount = await dexieDB.organizations.count();
    if (orgCount === 0) {
      const defaultOrg: Organization = {
        id: 'org-calaim-01',
        name: 'Bay Area Peer Recovery Collaborative (CalAIM)',
        npi: '1982019482',
        medicaidProviderId: 'CA-MC-948102',
        countyCode: '38-San Francisco',
        calaimContractActive: true,
        baaSignedAt: new Date().toISOString(),
        baaVersion: 'v2.4-GA8-CalAIM',
        contactEmail: 'compliance@peernotebook.com',
        contactPhone: '(415) 555-0199',
        contractType: 'CBO Partner',
        allocatedMonthlyUnits: 1200
      };
      await dexieDB.organizations.put(defaultOrg);
    }

    // 3. Initialize default specialist account if not present
    const userCount = await dexieDB.users.count();
    if (userCount === 0) {
      const defaultUser: User = {
        id: 'user-cpss-01',
        organizationId: 'org-calaim-01',
        email: 'specialist@peernotebook.com',
        fullName: 'Alex Rivera, CPSS-CA',
        credentialTitle: 'Certified Peer Support Specialist (CPSS-CA)',
        licenseNumber: 'CA-CPSS-2024-9182',
        npi: '1487293810',
        role: 'peer_specialist',
        isActive: true,
        isContractor1099: false,
        hourlyContractRate: 45,
        mileageReimbursementRate: 0.67,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionStatus: 'trialing',
        subscriptionTier: 'founding_specialist',
        billingInterval: 'monthly',
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      };
      await dexieDB.users.put(defaultUser);
    }

    // Zero mock clients and zero mock notes seeded: Clean Slate GA #8 Production Standard
  }

  /**
   * Purges all mock data completely across clients and notes for clean slate initialization
   */
  public async purgeMockData(): Promise<void> {
    try {
      const mockClientIds = ['cli-001', 'cli-002', 'cli-003'];
      const mockNoteIds = ['note-001', 'note-002', 'crisis-1'];
      for (const id of mockClientIds) {
        await dexieDB.clients.delete(id);
      }
      for (const id of mockNoteIds) {
        await dexieDB.session_notes.delete(id);
      }
    } catch {
      // ignore
    }
  }

  // Domain Queries
  public async getAllClients(): Promise<Client[]> {
    await this.init();
    return dexieDB.clients.toArray();
  }

  public async getClientById(id: string): Promise<Client | undefined> {
    await this.init();
    return dexieDB.clients.get(id);
  }

  public async saveClient(client: Client): Promise<Client> {
    await this.init();
    await dexieDB.clients.put(client);
    return client;
  }

  public async deleteClient(id: string): Promise<void> {
    await this.init();
    await dexieDB.clients.delete(id);
  }

  public async getAllNotes(): Promise<SessionNote[]> {
    await this.init();
    const notes = await dexieDB.session_notes.toArray();
    return notes.sort((a, b) => new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime());
  }

  public async getNoteById(id: string): Promise<SessionNote | undefined> {
    await this.init();
    return dexieDB.session_notes.get(id);
  }

  public async saveNote(note: SessionNote): Promise<SessionNote> {
    await this.init();
    await dexieDB.session_notes.put(note);
    return note;
  }

  public async deleteNote(id: string): Promise<void> {
    await this.init();
    await dexieDB.session_notes.delete(id);
  }

  public async saveUser(user: User): Promise<User> {
    await this.init();
    await dexieDB.users.put(user);
    return user;
  }

  public async updateUserBilling(
    userId: string,
    billingData: Partial<Pick<User, 'subscriptionStatus' | 'subscriptionTier' | 'stripeCustomerId' | 'stripeSubscriptionId' | 'stripePriceId' | 'billingInterval' | 'trialEndsAt' | 'currentPeriodEnd' | 'cancelAtPeriodEnd'>>
  ): Promise<User | undefined> {
    await this.init();
    const existing = await dexieDB.users.get(userId);
    if (!existing) return undefined;
    const updated: User = { ...existing, ...billingData };
    await dexieDB.users.put(updated);
    return updated;
  }

  public async deleteUser(id: string): Promise<void> {
    await this.init();
    await dexieDB.users.delete(id);
  }

  public async saveOrganization(org: Organization): Promise<Organization> {
    await this.init();
    await dexieDB.organizations.put(org);
    return org;
  }

  public async deleteOrganization(id: string): Promise<void> {
    await this.init();
    await dexieDB.organizations.delete(id);
  }

  public async getAllAuditLogs(): Promise<AuditLogEntry[]> {
    await this.init();
    const logs = await dexieDB.audit_logs.toArray();
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public async saveAuditLog(log: AuditLogEntry): Promise<AuditLogEntry> {
    await this.init();
    await dexieDB.audit_logs.put(log);
    return log;
  }

  public async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.init();
    return dexieDB.sync_queue.toArray();
  }

  public async addToSyncQueue(item: SyncQueueItem): Promise<SyncQueueItem> {
    await this.init();
    await dexieDB.sync_queue.put(item);
    return item;
  }

  public async clearSyncQueue(): Promise<void> {
    await this.init();
    await dexieDB.sync_queue.clear();
  }

  public async getAllUsers(): Promise<User[]> {
    await this.init();
    return dexieDB.users.toArray();
  }

  public async getAllOrganizations(): Promise<Organization[]> {
    await this.init();
    return dexieDB.organizations.toArray();
  }

  public async getUnsyncedNotesCount(): Promise<number> {
    await this.init();
    const notes = await dexieDB.session_notes.toArray();
    return notes.filter(n => !n.synced).length;
  }

  public async markAllNotesSynced(): Promise<number> {
    await this.init();
    const notes = await dexieDB.session_notes.toArray();
    let count = 0;
    const now = new Date().toISOString();
    for (const note of notes) {
      if (!note.synced) {
        note.synced = true;
        note.syncTimestamp = now;
        await dexieDB.session_notes.put(note);
        count++;
      }
    }
    return count;
  }

  public async getStorageMetrics(): Promise<StorageMetrics> {
    await this.init();
    let usageBytes = 0;
    let quotaBytes = 0;

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        usageBytes = estimate.usage || 0;
        quotaBytes = estimate.quota || (50 * 1024 * 1024); // Fallback ~50MB
      } catch {
        // Fallback calculation below
      }
    }

    const clientCount = await dexieDB.clients.count();
    const notes = await dexieDB.session_notes.toArray();
    const noteCount = notes.length;
    const unsyncedNoteCount = notes.filter(n => !n.synced).length;
    const logCount = await dexieDB.audit_logs.count();
    const queueCount = await dexieDB.sync_queue.count();

    // If estimate was 0, calculate estimated size from payload strings
    if (usageBytes === 0) {
      const approxStringSize = (clientCount * 1024) + (noteCount * 4096) + (logCount * 512) + (queueCount * 1024);
      usageBytes = approxStringSize || 45056; // baseline ~44KB
      quotaBytes = 100 * 1024 * 1024; // 100MB standard quota
    }

    const formatBytes = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const percentUsed = quotaBytes > 0 ? Math.min(100, Math.max(0.1, Number(((usageBytes / quotaBytes) * 100).toFixed(2)))) : 0.1;

    return {
      usageBytes,
      quotaBytes,
      usageFormatted: formatBytes(usageBytes),
      quotaFormatted: formatBytes(quotaBytes),
      percentUsed,
      clientCount,
      noteCount,
      unsyncedNoteCount,
      logCount,
      queueCount
    };
  }

  public async exportFullBackupJSON(organizationId?: string): Promise<string> {
    await this.init();
    const clients = await dexieDB.clients.toArray();
    const sessionNotes = await dexieDB.session_notes.toArray();
    const auditLogs = await dexieDB.audit_logs.toArray();
    const organizations = await dexieDB.organizations.toArray();
    const users = await dexieDB.users.toArray();

    const filteredClients = organizationId ? clients.filter(c => c.organizationId === organizationId) : clients;
    const filteredNotes = organizationId ? sessionNotes.filter(n => n.organizationId === organizationId) : sessionNotes;
    const filteredLogs = organizationId ? auditLogs.filter(l => l.organizationId === organizationId) : auditLogs;

    const payload: FullBackupPayload = {
      version: 'GA #8-v2.4',
      exportedAt: new Date().toISOString(),
      organizationId,
      metadata: {
        system: 'Peer Notebook (peernotebook.com)',
        baaVersion: 'v2.4-GA8-CalAIM',
        totalRecords: filteredClients.length + filteredNotes.length + filteredLogs.length
      },
      clients: filteredClients,
      sessionNotes: filteredNotes,
      auditLogs: filteredLogs,
      organizations,
      users
    };

    return JSON.stringify(payload, null, 2);
  }

  public async restoreFullBackupJSON(jsonStr: string): Promise<{
    success: boolean;
    importedCounts: { clients: number; notes: number; logs: number };
    message?: string;
  }> {
    await this.init();
    try {
      const parsed = JSON.parse(jsonStr) as Partial<FullBackupPayload>;
      if (!parsed || (!parsed.clients && !parsed.sessionNotes)) {
        return {
          success: false,
          importedCounts: { clients: 0, notes: 0, logs: 0 },
          message: 'Invalid backup structure: missing clients or session notes.'
        };
      }

      let clientCount = 0;
      let noteCount = 0;
      let logCount = 0;

      // Safe upsert to prevent primary key collisions
      if (Array.isArray(parsed.clients) && parsed.clients.length > 0) {
        await dexieDB.clients.bulkPut(parsed.clients);
        clientCount = parsed.clients.length;
      }

      if (Array.isArray(parsed.sessionNotes) && parsed.sessionNotes.length > 0) {
        await dexieDB.session_notes.bulkPut(parsed.sessionNotes);
        noteCount = parsed.sessionNotes.length;
      }

      if (Array.isArray(parsed.auditLogs) && parsed.auditLogs.length > 0) {
        await dexieDB.audit_logs.bulkPut(parsed.auditLogs);
        logCount = parsed.auditLogs.length;
      }

      if (Array.isArray(parsed.organizations) && parsed.organizations.length > 0) {
        await dexieDB.organizations.bulkPut(parsed.organizations);
      }

      if (Array.isArray(parsed.users) && parsed.users.length > 0) {
        await dexieDB.users.bulkPut(parsed.users);
      }

      return {
        success: true,
        importedCounts: { clients: clientCount, notes: noteCount, logs: logCount },
        message: `Successfully restored ${clientCount} clients, ${noteCount} session notes, and ${logCount} audit entries.`
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        importedCounts: { clients: 0, notes: 0, logs: 0 },
        message: `Failed to restore backup: ${errMsg}`
      };
    }
  }

  public async clearAllData(): Promise<void> {
    await this.init();
    await dexieDB.clients.clear();
    await dexieDB.session_notes.clear();
    await dexieDB.audit_logs.clear();
    await dexieDB.sync_queue.clear();
  }
}

export const peerNotebookDB = new PeerNotebookDBManager();
