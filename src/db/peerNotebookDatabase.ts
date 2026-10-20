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
}

export type UserRole = 'peer_specialist' | 'supervisor' | 'admin' | 'compliance_officer';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  credentialTitle: string; // e.g. Medi-Cal Certified Peer Support Specialist (CPSS-CA)
  licenseNumber: string;
  npi?: string;
  role: UserRole;
  isActive: boolean;
}

export interface Client {
  id: string;
  organizationId: string;
  clientIdentifier: string; // MRN Code (e.g. PN-4091)
  mediCalCin?: string; // Medi-Cal Client Index Number (e.g. 98234120A)
  preferredName: string;
  dateOfBirth?: string;
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
  organizationId: string;
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

  // Medi-Cal Coding
  billingCode: string; // 'H0038' (Self-help / Peer support services), 'H0038-HQ' (Group), 'H0038-U8' (ECM)
  billingUnits: number; // 1 unit per 15 min increments
  modality: ServiceModality;
  locationDetails: string;
  placeOfServiceCode: string; // '99' (Other Place / Community), '11' (Office), '02' (Telehealth)
  
  // Structured CalAIM DAP / Peer Support Documentation
  focusDomains: string[];
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
  organizationId: string;
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
      await this.seedInitialDataIfEmpty();
      this.isSeeded = true;
    }
  }

  public async seedInitialDataIfEmpty(): Promise<void> {
    const clientCount = await dexieDB.clients.count();
    if (clientCount > 0) return;

    // Seed California Behavioral Health & CalAIM Organizations
    const orgs: Organization[] = [
      {
        id: 'org-calaim-01',
        name: 'Bay Area Peer Recovery Collaborative (CalAIM)',
        npi: '1982019482',
        medicaidProviderId: 'CA-MC-948102',
        countyCode: '38-San Francisco',
        calaimContractActive: true,
        baaSignedAt: '2026-01-10T08:00:00Z',
        baaVersion: 'v2.4-GA8-CalAIM'
      },
      {
        id: 'org-calaim-02',
        name: 'Golden State Community Health Network',
        npi: '1092837465',
        medicaidProviderId: 'CA-MC-819283',
        countyCode: '19-Los Angeles',
        calaimContractActive: true,
        baaSignedAt: '2026-02-15T09:30:00Z',
        baaVersion: 'v2.4-GA8-CalAIM'
      }
    ];

    await dexieDB.organizations.bulkPut(orgs);

    // Seed Certified Specialists & Supervisors
    const users: User[] = [
      {
        id: 'user-cpss-01',
        organizationId: 'org-calaim-01',
        email: 'alex.rivera@bayareapeer.org',
        fullName: 'Alex Rivera, CPSS-CA',
        credentialTitle: 'CalAIM Certified Peer Support Specialist',
        licenseNumber: 'CA-CPSS-2024-9182',
        npi: '1487293810',
        role: 'peer_specialist',
        isActive: true
      },
      {
        id: 'user-sup-01',
        organizationId: 'org-calaim-01',
        email: 'sarah.jenkins@bayareapeer.org',
        fullName: 'Dr. Sarah Jenkins, LCSW, MAC',
        credentialTitle: 'Licensed Clinical Supervisor & CalAIM Director',
        licenseNumber: 'LCSW-CA-89214',
        npi: '1928374650',
        role: 'supervisor',
        isActive: true
      },
      {
        id: 'user-admin-01',
        organizationId: 'org-calaim-01',
        email: 'marcus.vance@bayareapeer.org',
        fullName: 'Marcus Vance',
        credentialTitle: 'Chief Compliance Officer & HIPAA Privacy Lead',
        licenseNumber: 'HCCA-CHC-7819',
        role: 'admin',
        isActive: true
      }
    ];

    await dexieDB.users.bulkPut(users);

    // Seed CalAIM Peer Clients
    const initialClients: Client[] = [
      {
        id: 'cli-001',
        organizationId: 'org-calaim-01',
        clientIdentifier: 'PN-4091',
        mediCalCin: '98471029B',
        preferredName: 'Jordan Reyes',
        dateOfBirth: '1989-05-14',
        assignedSpecialistId: 'user-cpss-01',
        recoveryGoals: [
          'Maintain 90-day alcohol abstinence with weekly SMART Recovery & CPSS mentoring',
          'CalAIM Housing Navigation: Complete Section 8 Coordinated Entry paperwork',
          'Strengthen social recovery network with family reconnection'
        ],
        currentStatus: 'Active Recovery',
        calaimPathway: 'Community Supports',
        consentSigned: true,
        consentDate: '2026-01-18',
        phone: '(415) 555-8901',
        emergencyContact: 'Sister (Maria Reyes) - (415) 555-1234',
        lastEncounterDate: '2026-10-18',
        createdAt: '2026-01-18T10:00:00Z',
        updatedAt: '2026-10-18T15:00:00Z'
      },
      {
        id: 'cli-002',
        organizationId: 'org-calaim-01',
        clientIdentifier: 'PN-5120',
        mediCalCin: '49281720C',
        preferredName: 'Maya Washington',
        dateOfBirth: '1994-11-22',
        assignedSpecialistId: 'user-cpss-01',
        recoveryGoals: [
          'Apply 5-4-3-2-1 sensory grounding and non-pharmacological anxiety reduction skills',
          'CalAIM ECM: Complete community college vocational certification enrollment',
          'Sustain weekly routine peer wellness support groups'
        ],
        currentStatus: 'Maintenance',
        calaimPathway: 'Enhanced Care Management (ECM)',
        consentSigned: true,
        consentDate: '2026-02-10',
        phone: '(415) 555-9012',
        emergencyContact: 'ECM Lead Case Worker - (415) 555-9988',
        lastEncounterDate: '2026-10-16',
        createdAt: '2026-02-10T14:30:00Z',
        updatedAt: '2026-10-16T11:45:00Z'
      },
      {
        id: 'cli-003',
        organizationId: 'org-calaim-01',
        clientIdentifier: 'PN-6819',
        mediCalCin: '71829304D',
        preferredName: 'Tyler Brooks',
        dateOfBirth: '2001-03-08',
        assignedSpecialistId: 'user-cpss-01',
        recoveryGoals: [
          'Harm reduction education and weekly street outreach check-ins',
          'Obtain California Real ID transit pass replacement',
          'Engage with Tenderloin youth recovery peer drop-in center'
        ],
        currentStatus: 'Intensive Support',
        calaimPathway: 'DMC-ODS Recovery Services',
        consentSigned: true,
        consentDate: '2026-09-01',
        phone: '(415) 555-6789',
        emergencyContact: 'Street Outreach Lead - (415) 555-2345',
        lastEncounterDate: '2026-10-12',
        createdAt: '2026-09-01T09:15:00Z',
        updatedAt: '2026-10-12T16:20:00Z'
      }
    ];

    await dexieDB.clients.bulkPut(initialClients);

    // Seed CalAIM Medi-Cal Encounter Notes
    const initialNotes: SessionNote[] = [
      {
        id: 'note-001',
        organizationId: 'org-calaim-01',
        clientId: 'cli-001',
        clientName: 'Jordan Reyes',
        clientIdentifier: 'PN-4091',
        mediCalCin: '98471029B',
        authorId: 'user-cpss-01',
        authorName: 'Alex Rivera, CPSS-CA',
        authorCredentials: 'CA-CPSS-2024-9182',
        encounterDate: '2026-10-18',
        startTime: '10:00',
        endTime: '10:45',
        faceToFaceMinutes: 45,
        travelMinutes: 15,
        documentationMinutes: 10,
        durationMinutes: 70, // Total Medi-Cal billable time
        billingCode: 'H0038',
        billingUnits: 5, // 70 min = 5 units (15m increments under CalAIM)
        modality: 'community_field',
        placeOfServiceCode: '99',
        locationDetails: 'Main Public Library Community Study Room 4',
        focusDomains: ['Recovery Goals', 'Housing Stability', 'Relapse Prevention', 'CalAIM Community Supports'],
        goalAddressed: 'Goal 1 & 2: Sobriety maintenance milestone and CalAIM supportive housing application packet review.',
        peerIntervention: 'CPSS shared lived recovery experience regarding anxiety management prior to housing interviews. Assisted peer in organizing proof of California residency and income verification documents. Practiced box breathing (4-4-4-4) to de-escalate acute stress.',
        clientResponse: 'Peer expressed visible relief after organizing paperwork. Stated: "Having a peer specialist who understands the recovery journey makes this process human." Reported 72 continuous days sober with zero cravings over the weekend.',
        planNextSteps: 'Peer will attend Tuesday evening All-Recovery meeting. CPSS and peer will meet Friday at 10:30 AM to accompany peer to the county housing authority interview.',
        safetyConcerns: false,
        specialistSignature: 'Alex Rivera, CPSS-CA [Electronic Signature Verified]',
        signedAt: '2026-10-18T11:00:00Z',
        status: 'pending_supervisor',
        synced: true,
        createdAt: '2026-10-18T10:45:00Z',
        updatedAt: '2026-10-18T11:00:00Z'
      },
      {
        id: 'note-002',
        organizationId: 'org-calaim-01',
        clientId: 'cli-002',
        clientName: 'Maya Washington',
        clientIdentifier: 'PN-5120',
        mediCalCin: '49281720C',
        authorId: 'user-cpss-01',
        authorName: 'Alex Rivera, CPSS-CA',
        authorCredentials: 'CA-CPSS-2024-9182',
        encounterDate: '2026-10-16',
        startTime: '14:00',
        endTime: '14:45',
        faceToFaceMinutes: 45,
        travelMinutes: 0,
        documentationMinutes: 15,
        durationMinutes: 60,
        billingCode: 'H0038',
        billingUnits: 4,
        modality: 'face_to_face',
        placeOfServiceCode: '11',
        locationDetails: 'Outpatient Peer Wellness Center, Room 102',
        focusDomains: ['Mental Health Wellness', 'Vocational/Employment', 'Coping Skills', 'CalAIM ECM'],
        goalAddressed: 'Goal 2: Vocational interview readiness and workplace distress tolerance.',
        peerIntervention: 'Facilitated trauma-informed mock interview roleplay. Practiced healthy boundaries regarding mental health history disclosure, emphasizing personal resilience and strengths. Reviewed reasonable accommodation requests under ADA.',
        clientResponse: 'Maya demonstrated noticeable growth in posture and voice tone. Self-reported anxiety dropped from 8/10 to 3/10 following somatic grounding.',
        planNextSteps: 'Maya will attend job interview on Thursday at 2:00 PM. Follow-up phone check-in scheduled for 4:00 PM.',
        safetyConcerns: false,
        specialistSignature: 'Alex Rivera, CPSS-CA [Electronic Signature Verified]',
        signedAt: '2026-10-16T15:00:00Z',
        status: 'approved',
        supervisorId: 'user-sup-01',
        supervisorName: 'Dr. Sarah Jenkins, LCSW',
        supervisorSignature: 'Dr. Sarah Jenkins, LCSW [Cosigned]',
        supervisorFeedback: 'Outstanding CalAIM documentation. Demonstrates peer-delivered intervention, client response, and clear Medi-Cal medical necessity under Behavioral Health Payment Reform.',
        approvedAt: '2026-10-17T09:30:00Z',
        synced: true,
        createdAt: '2026-10-16T14:45:00Z',
        updatedAt: '2026-10-17T09:30:00Z'
      }
    ];

    await dexieDB.session_notes.bulkPut(initialNotes);
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
