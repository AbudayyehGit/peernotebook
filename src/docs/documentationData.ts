/**
 * Peer Notebook - GA #8 Technical Documentation & White Paper Repository
 * Canonical Source: https://peernotebook.com/docs
 */

export interface DocArticle {
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  specCode: string;
  lastUpdated: string;
  author: string;
  readTime: string;
  canonicalUrl: string;
  content: string;
}

export const DOCUMENTATION_CATEGORIES = [
  '04 Technical Architecture',
  '01 Project Management',
  '02 Business Strategy',
  '03 Design Experience',
  '05 Engineering Quality',
  '06 Operations & Deployment',
  '07 Legal & Administrative'
];

export const DOC_ARTICLES: DocArticle[] = [
  {
    slug: 'GA8_Production_Grade_Architecture_White_Paper',
    category: '04 Technical Architecture',
    title: 'GA #8 Production-Grade Architecture White Paper',
    subtitle: 'Dual-Layer Persistence, CalAIM Compliance, and Offline-First Clinical Resilience',
    specCode: 'GA8-ARCH-01',
    lastUpdated: '2026-10-18',
    author: 'Principal Systems Architect',
    readTime: '12 min',
    canonicalUrl: 'https://peernotebook.com/docs/04-technical-architecture/GA8_Production_Grade_Architecture_White_Paper',
    content: `# GA #8 Production-Grade Architecture White Paper
**System Classification:** Enterprise Behavioral Health & Peer Support EHR
**Maturity Tier:** GA #8 (Production Hardened)
**Target Platform:** Progressive Web Application (PWA) with Offline-First Dual Persistence

---

## 1. Executive Summary & Clinical Problem Statement
Certified Peer Support Specialists (CPSS) are specialized healthcare professionals providing lived-experience mentorship, behavioral health support, harm reduction education, and recovery navigation. Unlike traditional clinic-bound practitioners, peer specialists operate extensively in the field:
* County emergency department crisis stabilization units
* Community drop-in centers and public libraries
* Street-level harm reduction outreach and supportive housing sites
* Transitional and rural community locations with intermittent or zero cellular connectivity

Traditional Electronic Health Record (EHR) platforms fail catastrophically in these environments. Cloud-dependent forms freeze upon socket termination, causing loss of notes, incomplete Medicaid claims, and administrative burnout.

**Peer Notebook** establishes the GA #8 architectural benchmark: an **offline-first dual-layer persistence system** pairing client-side **Dexie.js (IndexedDB)** with an enterprise **PostgreSQL/Supabase** relational cloud cluster, strictly aligned with California's **CalAIM (California Advancing and Innovating Medi-Cal)** payment reform standards.

---

## 2. Core Architectural Pillars

### 2.1 Dual-Layer Persistence Model
\`\`\`
+-----------------------------------------------------------+
|               Peer Notebook PWA Client                    |
|                                                           |
|  [ User Interface (Trauma-Informed Soft Slate #F8FAFC) ]  |
|                           |                               |
|              [ CalAIM Encounter Engine ]                  |
|                           |                               |
|        [ Primary Persistence: Dexie.js / IndexedDB ]      |
|    - Stores: clients, notes, audit_logs, sync_queue       |
|    - Encryption: WebCrypto AES-GCM + SHA-256 seal        |
+-----------------------------------------------------------+
                            |
                   (Background Sync Worker)
             [ Automatic Network Status Listener ]
                            | (HTTPS / WSS / TLS 1.3)
+-----------------------------------------------------------+
|          Central Cloud Relational Tier (Supabase)         |
|  - PostgreSQL 15 Engine with Multi-Tenant Row-Level Security|
|  - Cryptographic Audit Storage (45 CFR § 164.312)          |
|  - Realtime Change Data Capture (CDC) Replication          |
+-----------------------------------------------------------+
\`\`\`

1. **Zero-Latency Local Commits:** Every client interaction, draft note, and electronic signature is written first to the client-side Dexie.js transactional datastore.
2. **Deterministic Background Sync Worker:** An idempotent worker processes the local \`sync_queue\`. When network connectivity resumes, mutations are flushed to Supabase with automatic retry, exponential backoff, and timestamp-based conflict resolution.
3. **Multi-Tenant Row-Level Security (RLS):** Database policies strictly restrict visibility to authorized agency boundaries (\`organization_id\`) and role credentials (\`user_role\`).

---

## 3. CalAIM & Medi-Cal H0038 Payment Reform

Under California Department of Health Care Services (DHCS) Behavioral Health Payment Reform, Peer Support Services are reimbursed under procedure code **H0038** (Self-Help / Peer Services):

* **15-Minute Billing Increments:**
  * 1 Unit: 8 - 22 minutes
  * 2 Units: 23 - 37 minutes
  * 3 Units: 38 - 52 minutes
  * 4 Units: 53 - 67 minutes
  * 5+ Units: Each additional 15-minute block
* **Comprehensive Time Accounting:** Total billable time captures:
  $$\\text{Total Billable Minutes} = \\text{Face-to-Face Direct Service} + \\text{Field Travel Time} + \\text{Direct Documentation Time}$$
* **Structured DAP Narrative Format:**
  * **Data / Strengths-Based Goal:** Client-centered recovery plan objective.
  * **Assessment / Peer Intervention:** Specific CPSS interventions (lived experience sharing, somatic grounding, system navigation).
  * **Plan / Response:** Measurable client reaction, direct client quotes, and follow-up milestones.

---

## 4. Security, BAA, & Cryptographic Audit Trail
* **HIPAA 45 CFR § 164.312(b):** Immutable audit ledger capturing every client record view, encounter modification, supervisor approval, and export action.
* **Tamper-Evident SHA-256 Hashes:** Each audit entry calculates a deterministic SHA-256 checksum over the actor ID, action, target entity, and timestamp.
* **42 CFR Part 2 Substance Use Confidentiality:** Client identities utilize pseudonymized Medical Record Numbers (MRN format \`PN-XXXX\`), insulating beneficiaries against unauthorized disclosure.`
  },
  {
    slug: '07_Offline_Sync_IndexedDB',
    category: '04 Technical Architecture',
    title: 'Offline Sync & IndexedDB Architecture Spec',
    subtitle: 'Dexie.js Transactional Storage and Resilient Cloud Synchronization Worker',
    specCode: 'GA8-SYNC-02',
    lastUpdated: '2026-10-18',
    author: 'Data Systems Lead',
    readTime: '9 min',
    canonicalUrl: 'https://peernotebook.com/docs/04-technical-architecture/07_Offline_Sync_IndexedDB',
    content: `# Offline Sync & IndexedDB Technical Specification
**Module:** \`src/db/peerNotebookDatabase.ts\` & \`src/services/syncWorker.ts\`
**Storage Engine:** Dexie.js v4 (IndexedDB Wrapper)
**Cloud Bridge:** PostgreSQL / Supabase Realtime API

---

## 1. Storage Schemas
\`\`\`typescript
export class PeerNotebookDexieDB extends Dexie {
  organizations!: Table<Organization, string>;
  users!: Table<User, string>;
  clients!: Table<Client, string>;
  session_notes!: Table<SessionNote, string>;
  audit_logs!: Table<AuditLogEntry, string>;
  sync_queue!: Table<SyncQueueItem, string>;
  settings!: Table<SystemSetting, string>;
}
\`\`\`

## 2. Sync Worker State Machine
The \`SyncWorker\` maintains four operational states:
1. **Online:** Active network connection detected via \`navigator.onLine\` and ping heartbeat. Mutations are batched and dispatched within 600ms.
2. **Offline:** Network lost. Operations are enqueued to \`sync_queue\` with operational payload and timestamp. UI status pill transitions to Warm Amber (#D97706).
3. **Syncing:** Processing queue items sequentially. Mutated records have \`synced\` flag updated to \`true\`.
4. **Error / Retry:** If remote HTTP fails, retry counter increments up to 5 attempts with jittered exponential backoff.

## 3. Conflict Resolution Strategy
Peer Notebook enforces a **Field Author Authority (Last-Write-Wins with Local Revision Log)** rule. If an encounter note was cosigned by a supervisor while the specialist was in the field, the supervisor approval status is merged while preserving field notes in an immutable revision chain.`
  },
  {
    slug: '05_Compliance_Engine_PDF_Export',
    category: '04 Technical Architecture',
    title: 'CalAIM Compliance Engine & PDF Export Spec',
    subtitle: 'Medi-Cal H0038 Claim Documentation & Printable Audit Standards',
    specCode: 'GA8-COMPL-03',
    lastUpdated: '2026-10-18',
    author: 'Compliance & Clinical Informatics Lead',
    readTime: '8 min',
    canonicalUrl: 'https://peernotebook.com/docs/04-technical-architecture/05_Compliance_Engine_PDF_Export',
    content: `# CalAIM Compliance Engine & PDF Export Specification
**Standards Document:** CMS-1500 / Medi-Cal CalAIM Enhanced Care Management & Peer Support
**Target Component:** \`src/components/ExportSessionPDF.tsx\`

---

## 1. Regulatory Requirements
California Medi-Cal behavioral health payment reform mandates that all claim documentation support:
1. Valid California Certified Peer Support Specialist (CPSS-CA) credential.
2. Place of Service (POS) coding:
   * **POS 99:** Community Outreach / Field Encounter
   * **POS 11:** Office / Outpatient Clinic
   * **POS 02:** Telehealth Video / Phone
3. Clear medical necessity and strengths-based recovery plan linkage.
4. Clinical Supervisor Cosignature (LCSW, LMFT, LPCC, or Psychiatrist).

## 2. Printable Paper Representation
The PDF Export engine compiles an authentic clinical report featuring:
* Agency header with Federal NPI and California Medi-Cal Provider Number.
* Dual signature attestation blocks.
* Tamper-evident cryptographic SHA-256 seal.
* Print-optimized CSS ensuring zero UI artifacts or navigation bars appear on printed forms.`
  },
  {
    slug: '08_HIPAA_BAA_Consent_Model',
    category: '04 Technical Architecture',
    title: 'HIPAA BAA & Consent Governance Model',
    subtitle: '45 CFR § 164.504 Business Associate Provisions & 42 CFR Part 2 Protection',
    specCode: 'GA8-SEC-04',
    lastUpdated: '2026-10-18',
    author: 'Chief Privacy Officer',
    readTime: '10 min',
    canonicalUrl: 'https://peernotebook.com/docs/04-technical-architecture/08_HIPAA_BAA_Consent_Model',
    content: `# HIPAA BAA & Consent Governance Model
**Federal Mandate:** 45 CFR § 164.502(e) & 164.504(e)
**Confidentiality Framework:** 42 CFR Part 2 (Substance Use Disorder Patient Records)

---

## 1. Business Associate Agreement (BAA) Verification
Peer Notebook executes standard BAAs with covered behavioral health agencies. Under BAA v2.4-GA8:
* End-to-end encryption in transit (TLS 1.3) and client compartment isolation at rest.
* Sub-processor adherence: Cloud storage providers (Supabase/PostgreSQL) maintain SOC 2 Type II and HIPAA compliance.
* Zero data monetizing or cross-tenant analytics.

## 2. Client Pseudonymization (MRN Architecture)
To mitigate exposure risk during field encounters:
* Peers are cataloged with random pseudonymized identifiers (\`PN-XXXX\`).
* Real-world names are decoupled from diagnostic and progress notes in local transmission queues.
* Re-identification is restricted to authorized specialists within the home organization.`
  },
  {
    slug: '02_Database_ERD_Data_Dictionary',
    category: '04 Technical Architecture',
    title: 'Database ERD & Data Dictionary',
    subtitle: 'PostgreSQL Relational Schema & Row-Level Security (RLS) Policy Specifications',
    specCode: 'GA8-DB-05',
    lastUpdated: '2026-10-18',
    author: 'Lead Database Engineer',
    readTime: '11 min',
    canonicalUrl: 'https://peernotebook.com/docs/04-technical-architecture/02_Database_ERD_Data_Dictionary',
    content: `# Database ERD & Data Dictionary
**Schema Version:** 20261018000001
**Engine:** PostgreSQL 15 / Supabase with Row-Level Security (RLS)

---

## 1. Entity-Relationship Overview
\`\`\`
[ organizations ] 1 --- * [ users ]
        |                      |
        1                      1
        |                      |
        *                      *
   [ clients ]  1 --- * [ session_notes ]
        |                      |
        1                      1
        |                      |
        *                      *
   [ audit_logs ]          [ sync_queue ]
\`\`\`

## 2. Key Table Definitions

### \`organizations\`
* \`id\` (UUID, PK)
* \`name\` (VARCHAR 255)
* \`npi\` (VARCHAR 20, Unique)
* \`medicaid_provider_id\` (VARCHAR 50)
* \`county_code\` (VARCHAR 20)
* \`baa_signed_at\` (TIMESTAMPTZ)

### \`session_notes\`
* \`id\` (UUID, PK)
* \`organization_id\` (UUID, FK -> organizations.id)
* \`client_id\` (UUID, FK -> clients.id)
* \`author_id\` (UUID, FK -> users.id)
* \`encounter_date\` (DATE)
* \`face_to_face_minutes\` (INTEGER)
* \`travel_minutes\` (INTEGER)
* \`documentation_minutes\` (INTEGER)
* \`duration_minutes\` (INTEGER, Total Billable)
* \`billing_code\` (VARCHAR 20, Default 'H0038')
* \`billing_units\` (INTEGER)
* \`modality\` (VARCHAR 50)
* \`goal_addressed\` (TEXT)
* \`peer_intervention\` (TEXT)
* \`client_response\` (TEXT)
* \`plan_next_steps\` (TEXT)
* \`specialist_signature\` (TEXT)
* \`supervisor_signature\` (TEXT)
* \`status\` (VARCHAR 50)`
  },
  {
    slug: '03-design-experience/design-system',
    category: '03 Design Experience',
    title: 'Trauma-Informed Design System & Palette Guide',
    subtitle: 'Low-Arousal Clinical Aesthetics: Soft Slate, Deep Navy, and Muted Teal',
    specCode: 'GA8-UI-06',
    lastUpdated: '2026-10-18',
    author: 'Principal Design Technologist',
    readTime: '7 min',
    canonicalUrl: 'https://peernotebook.com/docs/03-design-experience/design-system',
    content: `# Trauma-Informed Design System & Palette Guide
**Standard:** WCAG 2.1 AA Compliant • Low-Cognitive Load Field Ergonomics
**Tone:** Warm, clinical, compassionate, calm

---

## 1. Palette Specification
* **App Background:** Soft Slate off-white (\`#F8FAFC\`)
  * Eliminates dark mode high-contrast glare in field and bright daylight conditions.
  * Reduces sensory arousal during emotionally intense crisis de-escalation encounters.
* **Structural Frame & Headers:** Deep Navy (\`#1E3A8A\`)
  * Establishes institutional credibility, clinical authority, and clear visual hierarchy.
* **Interactive Accents:** Muted Teal (\`#0F766E\`)
  * Calming primary action buttons, intake triggers, and domain selection chips.
* **Sync & Readiness Indicator:** Forest Green (\`#16A34A\`)
  * Reassures specialist of persistent local encryption and verified cloud sync.
* **Alert & Queue Indicator:** Warm Amber (\`#D97706\`)
  * Gentle, non-punitive alert for pending notes or offline mutations.`
  }
];
