/**
 * Peer Notebook - Consolidated Technical Documentation & White Paper Repository
 * Canonical Source: https://www.peernotebook.com/docs
 * Master Index & Taxonomic Manifest: ISO 9001:2015 Clause 7.5 & Optimum Primers Grade Standards
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
  // =========================================================================
  // 04 TECHNICAL ARCHITECTURE
  // =========================================================================
  {
    slug: 'GA8_Production_Grade_Architecture_White_Paper',
    category: '04 Technical Architecture',
    title: 'GA #8 Production-Grade Architecture White Paper',
    subtitle: 'Dual-Layer Persistence, CalAIM Compliance, and Offline-First Clinical Resilience',
    specCode: 'GA8-ARCH-01',
    lastUpdated: '2026-10-18',
    author: 'Principal Systems Architect',
    readTime: '14 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/GA8_Production_Grade_Architecture_White_Paper',
    content: `# GA #8 Production-Grade Architecture White Paper
**System Classification:** Enterprise Behavioral Health & Peer Support EHR
**Maturity Tier:** GA #8 (Production Hardened Release)
**Target Platform:** Progressive Web Application (PWA) with Offline-First Dual Persistence
**Canonical Source:** https://www.peernotebook.com/docs/04-technical-architecture/GA8_Production_Grade_Architecture_White_Paper

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

## 2. Core Architectural Topology

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
* **Comprehensive Time Accounting Formula:**
  $$\\text{Total Billable Minutes} = \\text{Face-to-Face Direct Service} + \\text{Field Travel Time} + \\text{Direct Documentation Time}$$
* **Structured DAP Narrative Format:**
  * **Data / Strengths-Based Goal:** Client-centered recovery plan objective.
  * **Assessment / Peer Intervention:** Specific CPSS interventions (lived experience sharing, somatic grounding, system navigation).
  * **Plan / Response:** Measurable client reaction, direct client quotes, and follow-up milestones.`
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
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/07_Offline_Sync_IndexedDB',
    content: `# Offline Sync & IndexedDB Technical Specification
**Module:** \`src/db/peerNotebookDatabase.ts\` & \`src/services/syncWorker.ts\`
**Storage Engine:** Dexie.js v4 (IndexedDB Wrapper)
**Cloud Bridge:** PostgreSQL / Supabase Realtime API
**Canonical Source:** https://www.peernotebook.com/docs/04-technical-architecture/07_Offline_Sync_IndexedDB

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
    slug: '01_System_Architecture_Data_Flow',
    category: '04 Technical Architecture',
    title: 'System Architecture & Data Flow Lifecycle',
    subtitle: '7-Step Note Persistence, WebCrypto Sealing, and Edge Transport',
    specCode: 'GA8-SYS-03',
    lastUpdated: '2026-10-18',
    author: 'Principal Systems Architect',
    readTime: '11 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/01_System_Architecture_Data_Flow',
    content: `# System Architecture & Data Flow Lifecycle
**Standard:** 1.0-GA System Architecture & Data Flow
**Security Standard:** TLS 1.3 / AES-GCM-256 Client-Side Enclave

---

## The 7-Step Clinical Note Lifecycle
1. **Intake & Context Binding:** Specialist selects client (bound by MRN \`PN-XXXX\` and Medi-Cal CIN).
2. **Field Entry:** DAP form fields (Goal, Intervention, Response, Plan, Safety) with CalAIM time accounting.
3. **Atomic Local Commit:** Transaction committed to Dexie.js \`session_notes\` store in < 5ms.
4. **SHA-256 Audit Seal:** Deterministic checksum generated and written to \`audit_logs\`.
5. **Sync Queue Ingestion:** Mutation object pushed to \`sync_queue\` with retry metadata.
6. **Background Worker Drain:** \`syncWorker.ts\` drains queue over TLS 1.3 to Supabase REST endpoint.
7. **Clinical Supervisor Cosign:** LCSW supervisor reviews, adds clinical feedback, and cosigns under POS 15.`
  },
  {
    slug: '02_Database_ERD_Data_Dictionary',
    category: '04 Technical Architecture',
    title: 'Database ERD & Data Dictionary',
    subtitle: 'PostgreSQL Relational Schema & Row-Level Security (RLS) Policy Specifications',
    specCode: 'GA8-DB-04',
    lastUpdated: '2026-10-18',
    author: 'Lead Database Engineer',
    readTime: '11 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/02_Database_ERD_Data_Dictionary',
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
* **\`organizations\`**: Agency tenant boundary, NPI, Medi-Cal provider ID, county code, active CalAIM contract.
* **\`users\`**: Certified specialists, clinical supervisors, role claims, license numbers, NPI.
* **\`clients\`**: Pseudonymized MRN (\`PN-XXXX\`), Medi-Cal CIN, CalAIM service pathway, recovery goals.
* **\`session_notes\`**: Encounter date, face-to-face/travel/doc time, H0038 billing units, DAP narrative, e-signatures.
* **\`audit_logs\`**: 45 CFR § 164.312(b) immutable log with SHA-256 tamper-evident checksum.`
  },
  {
    slug: '05_Compliance_Engine_PDF_Export',
    category: '04 Technical Architecture',
    title: 'CalAIM Compliance Engine & PDF Export Spec',
    subtitle: 'Medi-Cal H0038 Claim Documentation & Printable Audit Standards',
    specCode: 'GA8-COMPL-05',
    lastUpdated: '2026-10-18',
    author: 'Compliance & Clinical Informatics Lead',
    readTime: '8 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/05_Compliance_Engine_PDF_Export',
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
    specCode: 'GA8-SEC-06',
    lastUpdated: '2026-10-18',
    author: 'Chief Privacy Officer',
    readTime: '10 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/08_HIPAA_BAA_Consent_Model',
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
    slug: '07_Disaster_Recovery_IndexedDB',
    category: '04 Technical Architecture',
    title: 'Disaster Recovery & IndexedDB Quota Management',
    subtitle: 'storage.persist(), Quota Probes, and OPFS Snapshot Recovery',
    specCode: 'GA8-DR-07',
    lastUpdated: '2026-10-18',
    author: 'Reliability Engineering Lead',
    readTime: '9 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/07_Disaster_Recovery_IndexedDB',
    content: `# Disaster Recovery & Storage Quota Management
**Standard:** 1.0-GA Disaster Recovery & Storage Quota Protocol
**API:** \`navigator.storage.persist()\` & IndexedDB Transaction Guarantees

---

## 1. Browser Storage Eviction Prevention
Modern mobile browsers (iOS Safari, Android Chrome) can evict temporary IndexedDB partitions under device storage pressure. Peer Notebook invokes \`navigator.storage.persist()\` at session initialization, granting persistent storage permissions that exempt the clinical database from automated eviction.

## 2. Recovery Protocol
* **Automated Integrity Probes:** On app launch, Dexie.js performs sanity checks on indexes and table counts.
* **Corrupt Store Isolation:** If an IndexedDB partition encounters corruption, mutations are mirrored to LocalStorage emergency buffers and the user is guided through the "Download JSON Backup" pipeline before cache reset.`
  },
  {
    slug: '08_Agency_Dashboard_RBAC',
    category: '04 Technical Architecture',
    title: 'Agency Dashboard & Multi-Tenant RBAC',
    subtitle: 'Role Segregation, Supervisor Cosigning Queues, and RLS Isolation',
    specCode: 'GA8-RBAC-08',
    lastUpdated: '2026-10-18',
    author: 'Security Architect',
    readTime: '8 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/08_Agency_Dashboard_RBAC',
    content: `# Agency Dashboard & RBAC Architecture
**Standard:** Multi-Tenant Role-Based Access Control
**Roles:** \`peer_specialist\`, \`supervisor\`, \`admin\`, \`compliance_officer\`

---

## 1. Role Capabilities Matrix
* **Peer Specialist:** Create/edit draft notes, sign encounters, view assigned clients, queue syncs.
* **Clinical Supervisor:** Cosign notes, approve encounters, request revisions, view QA metrics, audit units.
* **Agency Administrator:** Manage agency details, configure BAA agreements, export cryptographic audit logs.
* **Compliance Officer:** Read-only access to all client encounters, audit logs, and Medi-Cal claim summaries.`
  },
  {
    slug: '12_Offline_Token_Auth_Handling',
    category: '04 Technical Architecture',
    title: 'Offline Token Authentication Handling',
    subtitle: 'Expired JWT Resilience, WebCrypto Queue Signing, and Pre-Reconnection Gate',
    specCode: 'GA8-AUTH-09',
    lastUpdated: '2026-10-18',
    author: 'Identity & Access Lead',
    readTime: '8 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/12_Offline_Token_Auth_Handling',
    content: `# Offline Token Auth Handling
**Specification:** POS 15 Variable Connectivity Token Strategy
**Security Standard:** WebCrypto ECDSA Signature Stamping

---

## 1. The Offline Token Problem
When a peer specialist works offline for multiple hours, their cloud session JWT inevitably expires. Peer Notebook decouples offline documentation authority from cloud token validity.
* Encounters authored offline are cryptographically signed using a locally generated WebCrypto key pair stored in non-extractable IndexedDB.
* Upon network reconnection, the application prompts the specialist for biometrics or cloud refresh before draining the signed sync queue, ensuring zero data loss and strict non-repudiation.`
  },
  {
    slug: '13_Migration_Rollback_Protocol',
    category: '04 Technical Architecture',
    title: 'Database Migration & Rollback Protocol',
    subtitle: 'Zero-Downtime Expand/Contract, Schema Adapters, and Paired SQL Runbooks',
    specCode: 'GA8-MIG-10',
    lastUpdated: '2026-10-18',
    author: 'Principal Database Architect',
    readTime: '9 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/13_Migration_Rollback_Protocol',
    content: `# Database Migration & Rollback Protocol
**Strategy:** Blue/Green Expand-and-Contract Architecture
**Tooling:** PostgreSQL Migrations & Dexie.js Schema Versioning

---

## 1. Zero-Downtime Database Migrations
Peer Notebook enforces zero-downtime database evolution:
1. **Expand:** New columns are added as nullable or with defaults without breaking existing client queries.
2. **Dual-Write:** Application writes to both legacy and new structures.
3. **Contract:** Obsolete columns are removed only after 100% of field PWAs have synchronized.`
  },

  // =========================================================================
  // 01 PROJECT MANAGEMENT
  // =========================================================================
  {
    slug: 'checklist',
    category: '01 Project Management',
    title: 'Master Engineering & SDLC Checklist',
    subtitle: 'Document Version 1.2.0-GA • CalAIM / Medi-Cal H0038 / POS 15 Standards',
    specCode: 'SDLC-CHK-01',
    lastUpdated: '2026-10-19',
    author: 'Optimum Primers Systems Architecture Team',
    readTime: '6 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/checklist',
    content: `# Peer Notebook: Master Engineering & SDLC Checklist
**Document Version:** 1.2.0-GA (Production Release)  
**Target Domain:** peernotebook.com / www.peernotebook.com  
**Engineering Standard:** OmniOps Systems Production Standards (Joe Abudayyeh)  
**Regulatory Framework:** CalAIM / Medi-Cal H0038 / Place of Service (POS) 15  

---

## Master Engineering & SDLC Status Table

### Phase 1: Planning, Strategy & Domain Compliance — [COMPLETE]
- [x] Define CalAIM documentation workflows & Medi-Cal H0038 service codes.
- [x] Establish zero-AI, deterministic, offline-first PWA architecture principles.
- [x] Draft Project Charter, SRS, and System Architecture documentation.
- [x] Map technical competencies to civil service / Application Developer II requirements.

### Phase 2: UI/UX Design System & Theme Integration — [COMPLETE]
- [x] Define trauma-informed clinical color palette:
  - Deep Navy (\`#1E3A8A\` / \`@utility bg-clinical-navy\`)
  - Muted Teal (\`#0F766E\` / \`#14b8a6\` / \`@utility bg-clinical-teal\`)
  - Soft Slate (\`#F8FAFC\` / \`@utility bg-clinical-neutral\`)
  - Forest Green (\`#16A34A\` / \`@utility bg-clinical-synced\`)
  - Warm Amber (\`#D97706\` / \`@utility bg-clinical-warning\`)
- [x] Configure Tailwind CSS design tokens and responsive viewports for field tablets.

### Phase 3: Core PWA Component Implementation (\`SettingsPanel.tsx\`) — [COMPLETE]
- [x] Local Storage Diagnostics: Query Dexie.js / IndexedDB for storage usage, client record counts, and unsynced notes.
- [x] Data Portability: Implement "Download JSON Backup" serialization and validated "Import Backup" file picker.
- [x] Synchronization Controls: Build manual "Force Sync with Supabase" trigger with loading states and last-sync timestamps.
- [x] Maintenance Utilities: Secure local cache reset protected by a confirmation modal.

### Phase 4: Standalone Repository & Deployment Pipeline — [COMPLETE]
- [x] Isolate application code into a clean standalone repository.
- [x] Configure root-level Vercel project deployment (\`vercel.json\` SPA catch-all rewrites).
- [x] Bind custom domain \`peernotebook.com\` and \`www.peernotebook.com\` directly to Vercel production.

### Phase 5: Integration Testing & Hardening — [COMPLETE]
- [x] Execute local-first edge case testing (offline IndexedDB persistence and recovery).
- [x] Validate cross-device touch targets (>48px) and WCAG 2.1 AA accessibility compliance.
- [x] Verify Supabase Row-Level Security (RLS) policies and immutable audit logs.

### Phase 6: General Availability (GA) Public Launch Sign-Off — [COMPLETE / PRODUCTION LIVE]
- [x] Static asset analysis, code-splitting, and bundle optimization.
- [x] PWA manifest (\`manifest.json\`) and offline persistence verified.
- [x] Vercel Edge custom domain resolution (\`peernotebook.com\` / \`www.peernotebook.com\`) verified with active SSL/TLS.`
  },
  {
    slug: 'project-charter',
    category: '01 Project Management',
    title: 'Project Charter & Initiation Document (PID)',
    subtitle: 'Approved 1.1-GA Charter: Mission, LACDMH/CalMHSA Alignment, and KPIs',
    specCode: 'PM-CHARTER-02',
    lastUpdated: '2026-10-18',
    author: 'Principal Program Lead',
    readTime: '8 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/01-project-management/project-charter',
    content: `# Approved 1.1-GA Project Charter & Initiation Document
**Mission:** Deliver a zero-arousal, trauma-informed digital clinical documentation system for California Certified Peer Support Specialists.
**Regulatory Mandate:** California Senate Bill 803 / CalMHSA & LACDMH Compliance

---

## 1. Core Objectives
1. **Reduce Documentation Burnout:** Decrease average encounter documentation time from 25 minutes down to < 6 minutes through structured DAP inputs.
2. **Zero Field Data Loss:** Achieve 100% offline persistence regardless of cellular disconnection in county facilities or street outreach.
3. **Audit-Proof Medi-Cal Claiming:** Automate 15-minute billing unit calculation and supervisor cosigning to ensure zero claim rejections.`
  },
  {
    slug: 'product-roadmap',
    category: '01 Project Management',
    title: 'Product Roadmap & Milestone Schedule',
    subtitle: 'Three-Horizon Strategic Schedule: MVP, CalAIM County Bridge, Enterprise EHR',
    specCode: 'PM-ROADMAP-03',
    lastUpdated: '2026-10-18',
    author: 'Product Strategy Director',
    readTime: '7 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/01-project-management/product-roadmap',
    content: `# Product Roadmap & Milestone Schedule
**Schedule Framework:** Three-Horizon Strategic Delivery Schedule

---

## Horizon 1: 1.1-GA CPSS MVP & Field Logging [COMPLETED]
* Dexie.js / IndexedDB offline transactional data store.
* CalAIM Medi-Cal H0038 billing unit calculator.
* Clinical Supervisor review queue and cosignature stamp.
* Hospital-grade PDF Export with SHA-256 cryptographic seal.

## Horizon 2: CalAIM & LACDMH County Bridge [CURRENT]
* Automated EDI 837P / 835 claim file export for County Behavioral Health.
* Direct Medi-Cal CIN beneficiary lookup and enrollment verification.

## Horizon 3: Enterprise EHR Interoperability [PLANNED]
* HL7 FHIR US Core Implementation Guide (v4.0.1) compliance.
* Epic / Cerner Smart on FHIR app launch integration.`
  },

  // =========================================================================
  // 02 BUSINESS STRATEGY
  // =========================================================================
  {
    slug: 'product-vision-scope',
    category: '02 Business Strategy',
    title: 'Product Vision & Scope Specification',
    subtitle: 'Approved 1.0-GA Product Vision: Non-Clinical Ethos, Personas & Moat Analysis',
    specCode: 'BIZ-VISION-01',
    lastUpdated: '2026-10-18',
    author: 'Chief Strategy Officer',
    readTime: '9 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/02-business-strategy/product-vision-scope',
    content: `# Approved 1.0-GA Product Vision & Scope
**Vision:** Empower peer support specialists with non-clinical, strengths-based documentation tools that honor the lived experience recovery journey while satisfying county compliance.

---

## 1. Differentiation & Competitive Moat
* **Non-Clinical Ethos:** Traditional EHRs enforce diagnostic deficit language (e.g. DSM-5 pathology). Peer Notebook enforces strengths-based recovery capital terminology.
* **Offline Resilience:** Competitors require constant internet; Peer Notebook runs 100% locally with Dexie.js.
* **Specialist-First Ergonomics:** Large touch targets, low-arousal Soft Slate palette (#F8FAFC), and zero clutter.`
  },
  {
    slug: 'mvp-feature-spec',
    category: '02 Business Strategy',
    title: 'MVP Feature Specification (MOD-01 to MOD-05)',
    subtitle: 'Approved 1.0-GA MVP Scope: Five Core Modules and Medi-Cal Alignment',
    specCode: 'BIZ-MVP-02',
    lastUpdated: '2026-10-18',
    author: 'Principal Technical Product Manager',
    readTime: '10 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/02-business-strategy/mvp-feature-spec',
    content: `# Approved 1.0-GA MVP Feature Specification
**Core Modules:** MOD-01 to MOD-05

---

## Module Breakdown
* **MOD-01 (Peer Client Roster):** Consent tracking, CalAIM pathway tagging, pseudonymized MRN generation.
* **MOD-02 (Encounter Documentation):** Structured DAP narrative, CalAIM travel/doc time tracking, H0038 billing units.
* **MOD-03 (Supervisor Review Queue):** Clinical cosignature approval, feedback, and Medi-Cal claim authorization.
* **MOD-04 (Hospital-Grade PDF Generator):** CMS-compliant printable summary with SHA-256 cryptographic seal.
* **MOD-05 (System Observability & BAA):** Dexie cache diagnostics, JSON export, and audit trail ledger.`
  },

  // =========================================================================
  // 03 DESIGN & EXPERIENCE
  // =========================================================================
  {
    slug: 'design-system',
    category: '03 Design Experience',
    title: 'Trauma-Informed Design System & Palette Guide',
    subtitle: 'Low-Arousal Clinical Aesthetics: Soft Slate, Deep Navy, and Muted Teal',
    specCode: 'UI-DESIGN-01',
    lastUpdated: '2026-10-18',
    author: 'Principal Design Technologist',
    readTime: '7 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/03-design-experience/design-system',
    content: `# Trauma-Informed Design System & Palette Guide
**Standard:** WCAG 2.2 AA Compliant • Low-Cognitive Load Field Ergonomics
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
  },
  {
    slug: 'ui-ux-wireframes-flows',
    category: '03 Design Experience',
    title: 'UI/UX Wireframes & Interaction Flows',
    subtitle: 'Single-Screen Note Capture, Progressive Disclosure, and >48px Touch Targets',
    specCode: 'UI-FLOW-02',
    lastUpdated: '2026-10-18',
    author: 'Lead UX Architect',
    readTime: '8 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/03-design-experience/ui-ux-wireframes-flows',
    content: `# Approved 1.2-GA UI/UX Wireframes & Interaction Flows
**Design Principles:** Single-Screen Capture, Zero-Jargon Form Fields, Mobile-First Accessibility

---

## 1. Interaction Patterns
* **Progressive Disclosure:** Advanced time inputs (travel minutes, documentation minutes) are pre-calculated with one-touch overrides.
* **Touch Targets:** All buttons, dropdowns, and checkboxes maintain minimum 48px touch bounding boxes for gloved or outdoor mobile usage.`
  },

  // =========================================================================
  // 05 ENGINEERING & QUALITY
  // =========================================================================
  {
    slug: 'ci-cd-pipeline',
    category: '05 Engineering Quality',
    title: 'CI/CD Pipeline & Build Gate Standards',
    subtitle: 'Automated TypeScript Strict Gates, Vercel SPA Rewrites, and Release Testing',
    specCode: 'QA-CICD-01',
    lastUpdated: '2026-10-18',
    author: 'Principal DevOps Architect',
    readTime: '8 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/05-engineering-quality/ci-cd-pipeline',
    content: `# CI/CD Pipeline & Build Gate Standards
**Host:** Vercel Edge Global Network
**Bundle Optimizer:** Vite 8 & Rolldown Native Compiler

---

## 1. Build Verification Gates
Every push executes strict pipeline checks:
1. \`tsc --noEmit\` under strict typechecking.
2. \`vite build\` with code-splitting and asset tree-shaking.
3. \`vercel.json\` SPA catch-all verification ensuring all sub-routes resolve to \`/index.html\`.`
  },
  {
    slug: 'code-review-standards',
    category: '05 Engineering Quality',
    title: 'Code Review & Type Safety Standards',
    subtitle: 'Zero Implicit Any, Strict Dexie Schema Typing, and CalAIM Model Conformance',
    specCode: 'QA-REVIEW-02',
    lastUpdated: '2026-10-18',
    author: 'Principal Software Engineer',
    readTime: '7 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/05-engineering-quality/code-review-standards',
    content: `# Code Review & Type Safety Standards
**Standard:** Enterprise Grade Craftsmanship

---

## 1. Review Rubrics
* **Type Safety:** Zero \`any\` types permitted in clinical interfaces. All Dexie tables must declare explicit entity interfaces.
* **Accessibility:** Verified contrast ratios against Soft Slate background (#F8FAFC).
* **HIPAA Audit Enforcement:** Any write to client data must invoke \`AuditLogger.log()\`.`
  },

  // =========================================================================
  // 06 OPERATIONS & DEPLOYMENT
  // =========================================================================
  {
    slug: 'infrastructure-runbook',
    category: '06 Operations & Deployment',
    title: 'Cloud Infrastructure & SRE Runbook',
    subtitle: 'Vercel Edge, Supabase PostgreSQL, and Regional Replication Specs',
    specCode: 'OPS-RUNBOOK-01',
    lastUpdated: '2026-10-18',
    author: 'Site Reliability Engineering Lead',
    readTime: '9 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/06-operations-deployment/infrastructure-runbook',
    content: `# Cloud Infrastructure & SRE Runbook
**Topology:** Vercel Global Edge Network + Supabase US-West Multi-Region PostgreSQL

---

## 1. Edge Caching & Routing
* Domain: \`peernotebook.com\` / \`www.peernotebook.com\`
* Rewrite Rule: Global wildcard catch-all in \`vercel.json\` guaranteeing deep-linking for \`/docs\` and sub-paths.`
  },
  {
    slug: 'disaster-recovery',
    category: '06 Operations & Deployment',
    title: 'Disaster Recovery & Business Continuity',
    subtitle: 'RTO < 15 Min, RPO < 1 Min, and Regional Failover Protocol',
    specCode: 'OPS-DR-02',
    lastUpdated: '2026-10-18',
    author: 'SRE Director',
    readTime: '8 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/06-operations-deployment/disaster-recovery',
    content: `# Disaster Recovery & Business Continuity Plan
**RTO Objective:** < 15 Minutes
**RPO Objective:** < 1 Minute (IndexedDB guarantees zero client data loss)

---

## 1. Failover Protocols
Because Peer Notebook is offline-first, client devices continue documenting without interruption during cloud regional downtime. When cloud services restore, sync workers transparently drain mutations.`
  },

  // =========================================================================
  // 07 LEGAL & ADMINISTRATIVE
  // =========================================================================
  {
    slug: 'compliance-matrix',
    category: '07 Legal & Administrative',
    title: 'Regulatory Compliance Matrix',
    subtitle: 'Mapping Controls to SOC 2 Type II, HIPAA Security Rule, and CalAIM Standards',
    specCode: 'LEG-MATRIX-01',
    lastUpdated: '2026-10-18',
    author: 'Chief Compliance Counsel',
    readTime: '9 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/07-legal-administrative/compliance-matrix',
    content: `# Regulatory Compliance Matrix
**Frameworks:** HIPAA 45 CFR § 164, 42 CFR Part 2, California SB 803, CalAIM

---

## Control Mapping Table
* **Access Control (45 CFR § 164.312(a)):** Multi-tenant RBAC segregating peer specialists, supervisors, and compliance officers.
* **Audit Controls (45 CFR § 164.312(b)):** SHA-256 immutable audit ledger.
* **Integrity (45 CFR § 164.312(c)):** Cryptographic checksums verify encounter notes cannot be altered after supervisor sign-off.`
  },
  {
    slug: 'privacy-policy-spec',
    category: '07 Legal & Administrative',
    title: 'Privacy Policy & Data Rights Specification',
    subtitle: 'California CCPA, 42 CFR Part 2 SUD Confidentiality, and BAA Standards',
    specCode: 'LEG-PRIVACY-02',
    lastUpdated: '2026-10-18',
    author: 'Data Privacy Officer',
    readTime: '7 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/07-legal-administrative/privacy-policy-spec',
    content: `# Privacy Policy & Data Rights Specification
**Jurisdiction:** California Department of Health Care Services (DHCS) / CalAIM

---

## 1. Patient & Peer Protections
* Complete adherence to 42 CFR Part 2 substance use disorder confidentiality.
* Client names pseudonymized into MRNs (\`PN-XXXX\`).
* Zero commercial telemetry or third-party advertising cookies.
* **Official Compliance Contact:** For county BAA execution, audit disclosures, or clinical inquiries, contact \`support@peernotebook.com\` at \`peernotebook.com\`.`
  },
  {
    slug: 'Live_Dexie_Supabase_Sync_Protocol',
    category: '04 Technical Architecture',
    title: 'Live Dexie.js ⇄ Supabase Real-Time Sync Protocols',
    subtitle: 'Transactional Micro-Latency, Offline Queue Buffering, and PostgreSQL Conflict Resolution',
    specCode: 'GA8-ARCH-08',
    lastUpdated: '2026-10-27',
    author: 'Principal Systems Architect',
    readTime: '11 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/Live_Dexie_Supabase_Sync_Protocol',
    content: `# Live Dexie.js ⇄ Supabase Real-Time Sync Protocols
**Target Ecosystem:** Peer Notebook Field Workspace & Mobile Outreach Units (POS 15)  
**Regulatory Standards:** CalAIM Enhanced Care Management (ECM), HIPAA § 164.312(a)(2)(iv)

---

## 1. Sync Architecture Overview
In intermittent network zones (street camps, shelters, locked facilities), peer documentation must function with zero network reliance:
* **Write-First Principle:** All mutations write to Dexie.js (IndexedDB) with deterministic sub-15ms latency.
* **Mutation Queue:** When network transitions to offline (\`navigator.onLine === false\` or failed heartbeat), write mutations are buffered in \`offline_sync_queue\` table.
* **Reconciliation Engine:** Upon network resumption, the \`syncWorker\` executes sequential batch flush to Supabase PostgreSQL with optimistic conflict handling.
* **Plain-English UX:** Zero raw technology names in user alerts; the UI renders clear statuses: *"Cloud Sync Active"* or *"Notes Saved Locally"*.`
  },
  {
    slug: 'CBO_1099_Solo_Contractor_Tracking_Model',
    category: '02 Business Strategy',
    title: 'CBO vs. 1099 Independent Contractor Multi-Tenant Architecture',
    subtitle: 'Segregated Row-Level Security, Encounters Ledger, and CalAIM Claim Attribution',
    specCode: 'GA8-BIZ-04',
    lastUpdated: '2026-10-27',
    author: 'Lead Business Analyst & Healthcare Counsel',
    readTime: '10 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/02-business-strategy/CBO_1099_Solo_Contractor_Tracking_Model',
    content: `# CBO vs. 1099 Independent Contractor Multi-Tenant Architecture
**Classification:** Dual-Tenant Tenancy Model  
**Legal Framework:** California AB 5 / SB 803 / CalAIM Community Supports

---

## 1. Tenancy Model Segregation
Peer Notebook natively serves two distinct operational cohorts within the same database schema:
1. **CBO Agency Tenants:** Multi-specialist agencies with clinical supervisors (LCSW/LMFT), QA auditors, and assigned specialists. Supervised notes require supervisor sign-off before Medi-Cal claims export.
2. **Solo 1099 Independent Contractors:** Solo practitioners contracting directly with managed care plans (MCPs) or county behavioral health.
   * \`account_type = 'solo_1099'\`
   * Direct RLS ownership: \`auth.uid() = specialist_id\`
   * Integrated mileage tracking ledger and CMS 1500 box 24 formatting.`
  },
  {
    slug: 'UI_Symmetrization_and_Accessibility_Standards',
    category: '03 Design Experience',
    title: 'UI Symmetrization, Zero-Pill Discipline & Touch Target Standards',
    subtitle: 'Trauma-Informed Design Tokens, 48px Hitboxes, and Visual Straightening Contract',
    specCode: 'GA8-DES-03',
    lastUpdated: '2026-10-27',
    author: 'Staff Frontend Design Architect',
    readTime: '8 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/03-design-experience/UI_Symmetrization_and_Accessibility_Standards',
    content: `# UI Symmetrization, Zero-Pill Discipline & Touch Target Standards
**Design Standard:** Anti-AI Slop Constitution & Trauma-Informed Clinical UI  
**Target Viewports:** 375px mobile, 768px tablet, 1280px+ desktop

---

## 1. Visual Straightening & Alignment Contract
To prevent chaotic or asymmetrical button arrangements across mobile and desktop headers:
* **Equal Vertical Baselines:** All interactive header items share identical vertical centering and height (\`min-h-[44px]\` mobile, \`min-h-[48px]\` desktop).
* **Balanced Horizontal Padding:** \`px-3.5 sm:px-4\` on all pill and rounded action buttons.
* **Zero Pill-Sandwich Clutter:** Kicker text and subtitles remain unboxed; pills are reserved exclusively for interactive actions and discrete status states.
* **Strict Fluid Containment:** All containers utilize \`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\` with zero horizontal overflow (\`overflow-x-hidden\`).`
  },
  {
    slug: 'Pre_Launch_Corporate_Milestones_LLC_IP',
    category: '07 Legal & Administrative',
    title: 'Pre-Launch Governance & Corporate Milestones (LLC & IP Assignment)',
    subtitle: 'State Filings, Entity Formation, and Founder Intellectual Property Ownership Governance',
    specCode: 'GA8-LEGAL-03',
    lastUpdated: '2026-10-27',
    author: 'Corporate Governance & Regulatory Counsel',
    readTime: '6 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/07-legal-administrative/Pre_Launch_Corporate_Milestones_LLC_IP',
    content: `# Pre-Launch Governance & Corporate Milestones
**Entity Name:** Peer Notebook LLC  
**Jurisdiction:** California / Delaware  
**Regulatory Status:** Pending Pre-Launch Milestone

---

## 1. Corporate Milestone Disclosure
In accordance with optimum enterprise governance standards:
* **Peer Notebook LLC Formation:** The formal filing of Articles of Organization and procurement of the Employer Identification Number (EIN) are currently scheduled as **Pending Pre-Launch Milestones**.
* **Founder-to-LLC IP Assignment:** Formal execution of the comprehensive IP Assignment Agreement covering all trade secrets, source code, and trademarks is scheduled for immediate execution upon LLC charter completion.
* **Pre-Launch Operations:** All prototyping, cohort waitlists, and documentation specifications are maintained under strict copyright attribution to Peer Notebook LLC.`
  },
  {
    slug: 'CalAIM_H0038_Template_Library_and_Flex_Wizard_Engine',
    category: '04 Technical Architecture',
    title: 'CalAIM H0038 Template Library & Circumnavigable Flex Wizard Engine',
    subtitle: 'Standardized Non-Clinical Encounter Presets, 15-Minute CalAIM Billing Formulas, and 5-Step Golden-Thread Stepper',
    specCode: 'GA8-H0038-04',
    lastUpdated: '2026-10-28',
    author: 'Principal Systems Architect & Clinical Informatics Lead',
    readTime: '12 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/CalAIM_H0038_Template_Library_and_Flex_Wizard_Engine',
    content: `# CalAIM H0038 Template Library & Circumnavigable Flex Wizard Engine
**Regulatory Standard:** California Medi-Cal CalAIM (HCPCS H0038) / DHCS Behavioral Health Payment Reform  
**Component Engine:** \`src/components/H0038TemplateDrawer.tsx\` & \`src/components/SessionNoteForm.tsx\`  
**Scope of Practice:** California Senate Bill 803 Certified Peer Support Specialist (CPSS)

---

## 1. The H0038 CalAIM Documentation Challenge
Under California CalAIM guidelines, peer support encounters billed under HCPCS **H0038** require rigorous non-clinical, strengths-based documentation that maintains an unbroken "Golden Thread" connecting the client-centered care plan to specific peer interventions and measurable recovery responses.

Peer specialists working in high-friction field environments (supportive housing, street outreach, encampments) face two severe barriers:
1. **Cognitive Fatigue:** Hand-crafting CalAIM-compliant 4-part notes while ensuring proper time allocation (Face-to-Face + Travel + Documentation).
2. **Rigid Stepper Validation Locks:** Traditional multi-step forms lock the specialist into sequential order, blocking progress if a later field needs immediate recording during an active client encounter.

---

## 2. Standardized CalAIM Encounter Template Library (Drawer Engine)
Peer Notebook introduces the **H0038 Standardized Template Drawer**, accessible via a slide-out drawer directly from any encounter note form. It contains eight certified encounter presets:

| Preset Name | Focus Domain | Minutes (Direct/Travel/Doc) | CalAIM Units | Primary Interventions |
|---|---|---|---|---|
| **Housing Stabilization & Navigation** | Housing & Basic Needs | 45m / 15m / 10m (70m total) | 5 units | Housing search, voucher checklist, landlord communication coaching |
| **Harm Reduction & Overdose Prevention** | Harm Reduction & Safety | 30m / 10m / 5m (45m total) | 3 units | Fentanyl test strips, naloxone coaching, non-judgmental risk discussion |
| **Community Recovery & Mutual Aid Linkage** | Recovery Planning | 45m / 15m / 10m (70m total) | 5 units | Mutual aid meeting introduction, shared lived recovery storytelling |
| **Wellness Recovery Action Plan (WRAP)** | Crisis & Self-Advocacy | 60m / 0m / 10m (70m total) | 5 units | Triggers identification, daily maintenance list, supporter contact tree |
| **Justice Re-Entry & Probation Navigation** | Re-Entry & Legal Support | 45m / 20m / 10m (75m total) | 5 units | Re-entry check-in, probation appointment accompaniment, barrier problem-solving |
| **Enhanced Care Management (ECM) Multi-Disciplinary** | Health & System Navigation | 35m / 15m / 10m (60m total) | 4 units | Primary care appointment preparation, pharmacy navigation, care team debrief |
| **Vocational Readiness & Benefit Planning** | Employment & Education | 45m / 10m / 10m (65m total) | 5 units | Resume drafting, Medi-Cal Working Disabled 250% program advocacy |
| **Somatic Grounding & Emotional Regulation** | Self-Regulation & Coping | 30m / 0m / 5m (35m total) | 3 units | Box breathing (4-4-4-4), 5-4-3-2-1 sensory grounding, nervous system pacing |

Each template pre-populates:
* **Recommended Modality & Place of Service Code:** POS 15 (Field) or POS 11 (Office).
* **Precise Time Allocations:** Pre-calculates 15-minute billing units under DHCS rules ($$\\lceil \\text{Total Minutes} / 15 \\rceil$$).
* **Trauma-Informed 4-Part Structure:** CalAIM Goal Addressed, Peer Intervention, Client Response, and Action Plan for Next Meeting.

---

## 3. Circumnavigable Flex Wizard Stepper Engine
The **Flex Wizard** introduces a revolutionary 5-step stepper guiding documentation through the CalAIM Golden Thread:
* **Step 1:** Client & Careplan Milestone Linkage (Client selector, Date of Service, Modality/POS, Strengths-Based Goal).
* **Step 2:** CalAIM Time Accounting & Focus Domains (Direct Face-to-Face, Travel, Documentation, 1099 Contractor Ledger, and Focus Domains).
* **Step 3:** Peer Intervention & Shared Recovery Experience (Single-tap CalMHSA trauma-informed intervention chips and narrative).
* **Step 4:** Client Recovery Response & Plan (Client direct quotes, observable mood, and agreed action steps for next meeting).
* **Step 5:** Safety Check & Electronic Attestation Signature (De-escalation trigger and legal electronic attestation).

### Total Circumnavigation Freedom
Unlike clinical EHR steppers that lock subsequent steps behind form validation, the Peer Notebook Flex Wizard allows specialists to **jump to any step at will** by clicking the stepper pills. Validation status is displayed non-punitive via green checkmarks (\`✓\`), allowing specialists to capture fleeting field observations instantly before returning to complete previous sections.

### Dual-Mode Flexibility
Specialists can toggle between **Single-Page View** (continuous scroll) and **Flex Wizard View** (focused stepper) at any time with a single tap, preserving 100% of inputted state.`
  },
  {
    slug: 'Zero_Persistence_Auth_and_Stripe_Simulation_Pipeline',
    category: '04 Technical Architecture',
    title: 'Zero-Persistence Clean-Desk Auth & 4-State Stripe Simulation Pipeline',
    subtitle: 'Zero Local Credentials on Boot, Auto-Logout on Browser Close, and Bidirectional Supabase Sync',
    specCode: 'GA8-AUTH-05',
    lastUpdated: '2026-10-28',
    author: 'Principal Systems Architect & Security Engineering Lead',
    readTime: '11 min',
    canonicalUrl: 'https://www.peernotebook.com/docs/04-technical-architecture/Zero_Persistence_Auth_and_Stripe_Simulation_Pipeline',
    content: `# Zero-Persistence Clean-Desk Auth & 4-State Stripe Simulation Pipeline
**Compliance Framework:** HIPAA 45 CFR § 164.312(a)(2)(iii) (Automatic Logoff) & California CMIA  
**Component Engines:** \`src/context/AuthContext.tsx\` & \`src/services/stripeBillingService.ts\`  
**Cloud Relational Sync:** Supabase PostgreSQL \`public.user_profiles\`

---

## 1. Zero-Persistence Clean-Desk Auth Architecture
Shared workstations in community behavioral health centers, county clinic kiosks, and field tablets present severe exposure risks if credentials remain cached. Peer Notebook implements a **Zero-Persistence Clean-Desk Policy**:

### 1. Zero Authenticated Users on Boot
On initial application launch, \`currentUser\` strictly initializes to \`null\`. The application automatically invokes:
\`\`\`typescript
await supabase.auth.signOut();
safeStorage.removeItem('peernotebook_active_user_id');
safeStorage.removeItem('peernotebook_auth_token');
\`\`\`
No specialist data, client records, or administrative panels are accessible until explicit, conscious login occurs.

### 2. Auto-Logout on Window & Tab Close
Peer Notebook binds dual low-level browser lifecycle listeners to guarantee session destruction:
\`\`\`typescript
window.addEventListener('beforeunload', purgeSession);
window.addEventListener('pagehide', purgeSession);
\`\`\`
Upon closing the tab, browser, or navigating away, all active session tokens, cached specialist credentials, and in-memory authorization states are instantly purged from both memory and local storage.

---

## 2. 4-State Dummy/Live Stripe Simulation Pipeline
For rapid developer testing, county auditor demonstrations, and production subscription lifecycle management, Peer Notebook provides a 4-state Stripe simulation engine:

1. **\`active_subscriber\`:** Full unrestricted production access. Simulates an active paying customer with \`current_period_end\` set 30 days in the future.
2. **\`trialing\`:** Active 14-day free trial without credit card required. Displays real-time trial countdown telemetry in the UI.
3. **\`past_due\`:** Simulates an expired payment method or failed invoice charge. Triggers non-punitive warning banners prompting the specialist to update billing.
4. **\`canceled\`:** Simulates an explicitly terminated subscription. Restricts access to read-only mode and displays reinstatement actions.

### Bidirectional Supabase PostgreSQL Sync
Whenever a billing state transitions (either via live Stripe webhooks or one-click simulation buttons in the Billing Modal), Peer Notebook executes an atomic dual-write:
1. **Local Dexie.js Store:** Updates the local \`users\` store record with \`subscription_status\`, \`stripe_customer_id\`, and \`stripe_subscription_id\`.
2. **Supabase PostgreSQL \`user_profiles\` Table:** Dispatches an immediate upsert query:
\`\`\`typescript
await supabase.from('user_profiles').upsert({
  id: user.id,
  email: user.email,
  subscription_status: newStatus,
  stripe_customer_id: stripeCustomerId,
  stripe_subscription_id: stripeSubscriptionId,
  updated_at: new Date().toISOString()
}, { onConflict: 'id' });
\`\`\`
This ensures consistent subscription state across both offline client partitions and cloud administrative dashboards.`
  }
];
