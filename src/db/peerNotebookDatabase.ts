/**
 * Peer Notebook - Core IndexedDB Database Engine (Offline First)
 * Conforms to GA8 Technical Architecture & HIPAA Encrypted Local Cache Guidelines
 */

export interface Organization {
  id: string;
  name: string;
  npi: string;
  medicaidProviderId: string;
  baaSignedAt: string;
  baaVersion: string;
}

export type UserRole = 'peer_specialist' | 'supervisor' | 'admin' | 'compliance_officer';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  credentialTitle: string;
  licenseNumber: string;
  role: UserRole;
  isActive: boolean;
}

export interface Client {
  id: string;
  organizationId: string;
  clientIdentifier: string; // Pseudonymized MRN / Peer Code (e.g. PN-4091)
  preferredName: string;
  dateOfBirth?: string;
  assignedSpecialistId: string;
  recoveryGoals: string[];
  currentStatus: 'Active Recovery' | 'Maintenance' | 'Intensive Support' | 'Completed Program';
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
  authorId: string;
  authorName: string;
  authorCredentials: string;
  encounterDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  billingCode: string; // Default 'H0038' (Self-help / Peer support services)
  billingUnits: number; // 1 unit per 15 min
  modality: ServiceModality;
  locationDetails: string;
  
  // Structured DAP/Peer support documentation
  focusDomains: string[];
  goalAddressed: string;
  peerIntervention: string;
  clientResponse: string;
  planNextSteps: string;
  safetyConcerns: boolean;
  safetyNotes?: string;

  // Electronic Signatures
  specialistSignature: string;
  signedAt?: string;
  status: NoteStatus;

  // Supervisor Review
  supervisorId?: string;
  supervisorName?: string;
  supervisorSignature?: string;
  supervisorFeedback?: string;
  approvedAt?: string;

  // Sync state
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 'VIEW_CLIENT' | 'CREATE_NOTE' | 'EDIT_NOTE' | 'SIGN_NOTE' | 'SUPERVISOR_APPROVAL' | 'REVISE_NOTE' | 'EXPORT_PDF' | 'OFFLINE_SYNC' | 'PURGE_CACHE';
  entityType: 'client' | 'session_note' | 'system' | 'auth';
  entityId: string;
  details: Record<string, unknown>;
  tamperProofChecksum: string;
  timestamp: string;
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

const DB_NAME = 'PeerNotebook_Local_DB_v2';
const DB_VERSION = 2;

class PeerNotebookDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  public async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('organizations')) {
          db.createObjectStore('organizations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('clients')) {
          const clientStore = db.createObjectStore('clients', { keyPath: 'id' });
          clientStore.createIndex('organizationId', 'organizationId', { unique: false });
          clientStore.createIndex('assignedSpecialistId', 'assignedSpecialistId', { unique: false });
        }
        if (!db.objectStoreNames.contains('session_notes')) {
          const noteStore = db.createObjectStore('session_notes', { keyPath: 'id' });
          noteStore.createIndex('clientId', 'clientId', { unique: false });
          noteStore.createIndex('authorId', 'authorId', { unique: false });
          noteStore.createIndex('status', 'status', { unique: false });
          noteStore.createIndex('encounterDate', 'encounterDate', { unique: false });
        }
        if (!db.objectStoreNames.contains('audit_logs')) {
          const auditStore = db.createObjectStore('audit_logs', { keyPath: 'id' });
          auditStore.createIndex('actorId', 'actorId', { unique: false });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = async () => {
        this.db = request.result;
        await this.seedInitialDataIfEmpty();
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.initPromise;
  }

  private async seedInitialDataIfEmpty(): Promise<void> {
    const clients = await this.getAllClients();
    if (clients.length > 0) return;

    // Seed Organizations
    const orgs: Organization[] = [
      {
        id: 'org-hope-01',
        name: 'Cascade Recovery Alliance & Peer Services',
        npi: '1892019482',
        medicaidProviderId: 'WA-MED-849102',
        baaSignedAt: '2026-01-15T09:00:00Z',
        baaVersion: 'v2.4-GA8'
      },
      {
        id: 'org-hope-02',
        name: 'Community Wellness Peer Outreach',
        npi: '1092837465',
        medicaidProviderId: 'WA-MED-294819',
        baaSignedAt: '2026-03-01T10:00:00Z',
        baaVersion: 'v2.4-GA8'
      }
    ];

    for (const org of orgs) {
      await this.put('organizations', org);
    }

    // Seed Users
    const users: User[] = [
      {
        id: 'user-cpss-01',
        organizationId: 'org-hope-01',
        email: 'alex.rivera@cascaderecovery.org',
        fullName: 'Alex Rivera, CPSS',
        credentialTitle: 'Certified Peer Support Specialist',
        licenseNumber: 'CPSS-WA-2024-819',
        role: 'peer_specialist',
        isActive: true
      },
      {
        id: 'user-sup-01',
        organizationId: 'org-hope-01',
        email: 'sarah.jenkins@cascaderecovery.org',
        fullName: 'Dr. Sarah Jenkins, LICSW, MAC',
        credentialTitle: 'Clinical Supervisor & Behavioral Health Director',
        licenseNumber: 'LW-60193821',
        role: 'supervisor',
        isActive: true
      },
      {
        id: 'user-admin-01',
        organizationId: 'org-hope-01',
        email: 'marcus.admin@cascaderecovery.org',
        fullName: 'Marcus Vance',
        credentialTitle: 'Agency Administrator & Privacy Officer',
        licenseNumber: 'HIPAA-CPO-991',
        role: 'admin',
        isActive: true
      }
    ];

    for (const user of users) {
      await this.put('users', user);
    }

    // Seed Sample Clients with Realistic Peer Support Profiles
    const initialClients: Client[] = [
      {
        id: 'cli-001',
        organizationId: 'org-hope-01',
        clientIdentifier: 'PN-4091',
        preferredName: 'Jordan Reyes',
        dateOfBirth: '1989-05-14',
        assignedSpecialistId: 'user-cpss-01',
        recoveryGoals: [
          'Maintain 90-day alcohol abstinence & attend 12-step/SMART recovery weekly',
          'Secure permanent supportive housing voucher',
          'Rebuild relationships with supportive family members'
        ],
        currentStatus: 'Active Recovery',
        consentSigned: true,
        consentDate: '2026-01-18',
        phone: '(555) 234-8901',
        emergencyContact: 'Sister (Maria) - (555) 890-1234',
        lastEncounterDate: '2026-10-18',
        createdAt: '2026-01-18T10:00:00Z',
        updatedAt: '2026-10-18T15:00:00Z'
      },
      {
        id: 'cli-002',
        organizationId: 'org-hope-01',
        clientIdentifier: 'PN-5120',
        preferredName: 'Maya Washington',
        dateOfBirth: '1994-11-22',
        assignedSpecialistId: 'user-cpss-01',
        recoveryGoals: [
          'Develop non-pharmacological grounding techniques for anxiety symptoms',
          'Complete job training certification through workforce development',
          'Establish routine community exercise & self-care regimen'
        ],
        currentStatus: 'Maintenance',
        consentSigned: true,
        consentDate: '2026-02-10',
        phone: '(555) 678-9012',
        emergencyContact: 'Case Manager Dave - (555) 444-9988',
        lastEncounterDate: '2026-10-16',
        createdAt: '2026-02-10T14:30:00Z',
        updatedAt: '2026-10-16T11:45:00Z'
      },
      {
        id: 'cli-003',
        organizationId: 'org-hope-01',
        clientIdentifier: 'PN-6819',
        preferredName: 'Tyler Brooks',
        dateOfBirth: '2001-03-08',
        assignedSpecialistId: 'user-cpss-01',
        recoveryGoals: [
          'Harm reduction education and weekly peer check-ins',
          'Obtain replacement State ID and transit card',
          'Engage with youth recovery drop-in center'
        ],
        currentStatus: 'Intensive Support',
        consentSigned: true,
        consentDate: '2026-09-01',
        phone: '(555) 345-6789',
        emergencyContact: 'Outreach Team Lead - (555) 901-2345',
        lastEncounterDate: '2026-10-12',
        createdAt: '2026-09-01T09:15:00Z',
        updatedAt: '2026-10-12T16:20:00Z'
      }
    ];

    for (const client of initialClients) {
      await this.put('clients', client);
    }

    // Seed Realistic Encounter Notes
    const initialNotes: SessionNote[] = [
      {
        id: 'note-001',
        organizationId: 'org-hope-01',
        clientId: 'cli-001',
        clientName: 'Jordan Reyes',
        clientIdentifier: 'PN-4091',
        authorId: 'user-cpss-01',
        authorName: 'Alex Rivera, CPSS',
        authorCredentials: 'CPSS-WA-2024-819',
        encounterDate: '2026-10-18',
        startTime: '10:00',
        endTime: '10:45',
        durationMinutes: 45,
        billingCode: 'H0038',
        billingUnits: 3,
        modality: 'community_field',
        locationDetails: 'Public Library Study Room 4 & Community Center',
        focusDomains: ['Recovery Goals', 'Housing Stability', 'Relapse Prevention'],
        goalAddressed: 'Goal 1 & 2: Maintain sobriety milestones and review supportive housing packet submission.',
        peerIntervention: 'CPSS utilized lived experience to validate peer anxieties regarding upcoming housing interview. Reviewed peer coping strategies (5-4-3-2-1 grounding, calling recovery sponsor before stressful calls). Supported peer in organizing required residency documentation for the Section 8 housing appointment.',
        clientResponse: 'Peer expressed relief upon completing document organization. Stated: "Having someone who has walked this road sit with me made the housing paperwork manageable." Reported 72 days continuous sobriety with zero cravings over the past weekend.',
        planNextSteps: 'Peer will attend Tuesday evening All-Recovery meeting. CPSS and peer will meet Friday at 10:30 AM to accompany peer to the housing authority intake.',
        safetyConcerns: false,
        specialistSignature: 'Alex Rivera, CPSS [Electronic Signature Verified]',
        signedAt: '2026-10-18T11:00:00Z',
        status: 'pending_supervisor',
        synced: true,
        createdAt: '2026-10-18T10:45:00Z',
        updatedAt: '2026-10-18T11:00:00Z'
      },
      {
        id: 'note-002',
        organizationId: 'org-hope-01',
        clientId: 'cli-002',
        clientName: 'Maya Washington',
        clientIdentifier: 'PN-5120',
        authorId: 'user-cpss-01',
        authorName: 'Alex Rivera, CPSS',
        authorCredentials: 'CPSS-WA-2024-819',
        encounterDate: '2026-10-16',
        startTime: '14:00',
        endTime: '14:45',
        durationMinutes: 45,
        billingCode: 'H0038',
        billingUnits: 3,
        modality: 'face_to_face',
        locationDetails: 'Outpatient Clinic Peer Wellness Lounge',
        focusDomains: ['Mental Health Wellness', 'Employment/Vocational', 'Coping Skills'],
        goalAddressed: 'Goal 2: Job interview preparation and managing workplace anxiety symptoms.',
        peerIntervention: 'Facilitated mock peer interview roleplay. Practiced disclosure boundaries regarding mental health history, focusing on peer strengths and resilience. Explored reasonable accommodations and practiced deep diaphragmatic breathing.',
        clientResponse: 'Maya demonstrated increased vocal confidence during roleplay. Stated anxiety score decreased from 8/10 at start of session to 3/10 following breathing exercises.',
        planNextSteps: 'Maya will attend interview on Thursday at 2:00 PM. Will send check-in text/call to CPSS following interview.',
        safetyConcerns: false,
        specialistSignature: 'Alex Rivera, CPSS [Electronic Signature Verified]',
        signedAt: '2026-10-16T15:00:00Z',
        status: 'approved',
        supervisorId: 'user-sup-01',
        supervisorName: 'Dr. Sarah Jenkins, LICSW',
        supervisorSignature: 'Dr. Sarah Jenkins, LICSW [Cosigned]',
        supervisorFeedback: 'Thorough documentation demonstrating clear peer-delivered interventions and measurable client response. Meets Medicaid H0038 criteria.',
        approvedAt: '2026-10-17T09:30:00Z',
        synced: true,
        createdAt: '2026-10-16T14:45:00Z',
        updatedAt: '2026-10-17T09:30:00Z'
      }
    ];

    for (const note of initialNotes) {
      await this.put('session_notes', note);
    }
  }

  // Generic DB helpers
  private async getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.getDB();
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  public async put<T>(storeName: string, item: T): Promise<T> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  }

  public async get<T>(storeName: string, key: string): Promise<T | null> {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async getAll<T>(storeName: string): Promise<T[]> {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async delete(storeName: string, key: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Domain specific methods
  public async getAllClients(): Promise<Client[]> {
    return this.getAll<Client>('clients');
  }

  public async getClientById(id: string): Promise<Client | null> {
    return this.get<Client>('clients', id);
  }

  public async saveClient(client: Client): Promise<Client> {
    return this.put<Client>('clients', client);
  }

  public async getAllNotes(): Promise<SessionNote[]> {
    const notes = await this.getAll<SessionNote>('session_notes');
    return notes.sort((a, b) => new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime());
  }

  public async getNoteById(id: string): Promise<SessionNote | null> {
    return this.get<SessionNote>('session_notes', id);
  }

  public async saveNote(note: SessionNote): Promise<SessionNote> {
    return this.put<SessionNote>('session_notes', note);
  }

  public async getNotesByClient(clientId: string): Promise<SessionNote[]> {
    const notes = await this.getAllNotes();
    return notes.filter(n => n.clientId === clientId);
  }

  public async getAllAuditLogs(): Promise<AuditLogEntry[]> {
    const logs = await this.getAll<AuditLogEntry>('audit_logs');
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public async saveAuditLog(log: AuditLogEntry): Promise<AuditLogEntry> {
    return this.put<AuditLogEntry>('audit_logs', log);
  }

  public async getSyncQueue(): Promise<SyncQueueItem[]> {
    return this.getAll<SyncQueueItem>('sync_queue');
  }

  public async addToSyncQueue(item: SyncQueueItem): Promise<SyncQueueItem> {
    return this.put<SyncQueueItem>('sync_queue', item);
  }

  public async clearSyncQueue(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction('sync_queue', 'readwrite');
    tx.objectStore('sync_queue').clear();
  }

  public async getAllUsers(): Promise<User[]> {
    return this.getAll<User>('users');
  }

  public async getAllOrganizations(): Promise<Organization[]> {
    return this.getAll<Organization>('organizations');
  }

  public async clearAllData(): Promise<void> {
    const db = await this.getDB();
    const stores = ['clients', 'session_notes', 'audit_logs', 'sync_queue'];
    const tx = db.transaction(stores, 'readwrite');
    stores.forEach(s => tx.objectStore(s).clear());
  }
}

export const peerNotebookDB = new PeerNotebookDB();
