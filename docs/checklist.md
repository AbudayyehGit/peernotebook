# Peer Notebook: Master Engineering & SDLC Checklist

**Document Version:** 1.2.0-GA (Production Release)  
**Target Domain:** peernotebook.com  
**Parent Documentation Path:** optimumprimers.com/peernotebook/docs/checklist.md  
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
  - Deep Navy (`#1E3A8A` / `@utility bg-clinical-navy`)
  - Muted Teal (`#0F766E` / `#14b8a6` / `@utility bg-clinical-teal`)
  - Soft Slate (`#F8FAFC` / `@utility bg-clinical-neutral`)
  - Forest Green (`#16A34A` / `@utility bg-clinical-synced`)
  - Warm Amber (`#D97706` / `@utility bg-clinical-warning`)
- [x] Configure Tailwind CSS design tokens and responsive viewports for field tablets.

### Phase 3: Core PWA Component Implementation (`SettingsPanel.tsx`) — [COMPLETE]
- [x] Local Storage Diagnostics: Query Dexie.js / IndexedDB for storage usage, client record counts, and unsynced notes.
- [x] Data Portability: Implement "Download JSON Backup" serialization and validated "Import Backup" file picker.
- [x] Synchronization Controls: Build manual "Force Sync with Supabase" trigger with loading states and last-sync timestamps.
- [x] Maintenance Utilities: Secure local cache reset protected by a confirmation modal.

### Phase 4: Standalone Repository & Deployment Pipeline — [COMPLETE]
- [x] Isolate application code from legacy OptimumPrimers subfolder into a clean standalone directory.
- [x] Initialize fresh git repository and push to GitHub (`github.com/[handle]/peernotebook`).
- [x] Configure root-level Vercel project deployment (`"build": "tsc && vite build"`).
- [x] Bind custom domain `peernotebook.com` directly to Vercel production root.
- [x] Purge legacy host-conditioned rewrite rules from the parent Optimum Primers repository.

### Phase 5: Integration Testing & Hardening — [COMPLETE]
- [x] Execute local-first edge case testing (offline IndexedDB persistence and recovery).
- [x] Validate cross-device touch targets (>48px) and WCAG 2.1 AA accessibility compliance.
- [x] Verify Supabase Row-Level Security (RLS) policies and immutable audit logs.

### Phase 6: General Availability (GA) Public Launch Sign-Off — [COMPLETE / PRODUCTION LIVE]
- [x] Static asset analysis, code-splitting, and bundle optimization (`tsc && vite build`).
- [x] PWA manifest (`manifest.json`) and offline service worker caching configured.
- [x] Vercel Edge custom domain resolution (`peernotebook.com` / `www.peernotebook.com`) verified with active SSL/TLS.
- [x] User-facing documentation, Medi-Cal H0038 billing codes, and CalAIM compliance runbooks published to `optimumprimers.com/peernotebook/docs`.
- [x] Platform ready for specialist cohort onboarding and real-world field utilization.

### Phase 7: Interactive Checklist State Engine & CBO Interoperability — [COMPLETE]
- [x] Dynamic Cross-Session State Engine (`checklistStateService.ts`):
  - CalAIM 7-Point Quality Audit Checklist (Goal linkage, Non-clinical language, Client quote, Concrete intervention, 3-way time accounting, 15-min billing units, CPSS attestation signature).
  - Master Engineering & SDLC Deployment Checklist (Phases 1-6).
  - Event-driven cross-tab and cross-session persistence via `peernotebook:checklist-update`.
- [x] Interactive Checklist UI (`InteractiveChecklistWidget.tsx`):
  - Modal overlay and embedded inline modes with real-time completion progress tracking.
  - 48px touch targets, zero-pill discipline, "Copy Text Summary", and "Reset Baseline".
  - Embedded in Navigation drawer, Settings Panel, and Session Note Form.
- [x] CBO EHR Clinical Interchange Pipeline (`ehrIntegrationService.ts`):
  - HL7 FHIR R4 Encounter & DocumentReference Bundle JSON export.
  - HL7 v2.5.1 Clinical Message (ORU^R01 / MDM^T02) export.
  - C-CDA Release 2.1 Progress Note XML export.
  - Integrated with ANSI X12 837P batch claims generator.

### Phase 8: California SB 803 Core Competencies Alignment — [COMPLETE]
- [x] Master SB 803 17 Core Competencies Dataset (`src/data/sb803Competencies.ts`):
  - Mapped all 17 competencies defined under Senate Bill 803 (Chapter 150, Statutes of 2020) and CalMHSA.
  - Formulated plain-English documentation prompts for CalAIM H0038 medical necessity defense.
- [x] In-App Competency Guide & Selector (`src/components/SB803CompetencyGuide.tsx`):
  - Category filters: Foundation, Practice, Navigation, Ethics & Wellness.
  - Integrated into `SessionNoteForm.tsx` for encounter note tagging.
  - Tagged competencies bundled into Dexie.js records, printable chart exports (`ExportSessionPDF.tsx`), and FHIR R4 bundles.
- [x] Regulatory Documentation: `docs/03-compliance-regulatory/calmhsa-sb803-core-competencies.md`.

### Phase 9: CBO Onboarding & Administrative Governance (`/admin/dashboard`) — [COMPLETE]
- [x] CBO Dashboard Component (`src/components/AdminDashboard.tsx`):
  - Route `/admin/dashboard` wired in React Router and workspace navigation.
  - CBO Entity Profile Management (NPI, Medi-Cal Provider ID, County Code, Active CalAIM BAA).
- [x] 6-Step Guided Medi-Cal Provider Onboarding Checklist:
  1. Business Associate Agreement (BAA) execution with County/DHCS.
  2. Medi-Cal County Provider ID & NPI claim parameter configuration.
  3. Clinical Supervisor cosignature delegation protocol (LCSW/LMFT/LPCC).
  4. CMS 8-minute rounding accounting formula validation.
  5. Specialist roster onboarding (W-2 Employees & 1099 Subcontractors).
  6. Interoperability verification test export (FHIR R4 / HL7 / CCDA).
- [x] CalAIM Capacity & Revenue Estimator:
  - Monthly billable units used vs. contract cap.
  - Estimated reimbursement at California standard $32.50 / 15-min county benchmark.
- [x] Operational Documentation: `docs/01-project-management/admin-cbo-onboarding-guide.md`.

### Phase 10: Engineering Telemetry & System Monitoring Portal (`/engineering/monitoring`) — [COMPLETE]
- [x] Telemetry Portal Component (`src/components/EngineeringMonitoring.tsx`):
  - Route `/engineering/monitoring` wired in workspace navigation and Navbar menu.
  - Real-time IndexedDB Dexie.js storage quota metrics (bytes used, quota, table counts).
  - Background Sync Worker state machine, queue backlog latency, and network connection listener.
  - Cryptographic SHA-256 Audit Trail Checksum Validator verifying zero data tampering.
  - Transactional Email Dispatch Monitor (Resend API registration, verification code, waitlist routes).
  - 1-Click In-Browser Self-Diagnostic Test Suite executing 5 architectural verification checks.
- [x] Technical Specification: `docs/04-technical-architecture/telemetry-monitoring-spec.md`.

### Phase 11: 1099 Independent Contractor vs. W-2 Employee Classification — [COMPLETE]
- [x] Schema & Database Modeling (`src/db/peerNotebookDatabase.ts`):
  - Added `employmentType: 'w2_employee' | '1099_contractor'` to `User` interface.
  - Mileage tracking ($0.67/mile IRS standard rate) and hourly contractor rate.
- [x] Onboarding & Registration Toggles:
  - `AuthModal.tsx`: High-visibility plain-English toggle during account creation.
  - `BetaOnboardingModal.tsx`: Specialist classification toggle with real-time profile persistence.
  - `AdminDashboard.tsx`: Roster filter by W-2 vs. 1099 with modal editing.

### Phase 12: STAR Behavioral Interview Modules & 80-Hr / 40-Hr Curriculum Tracks — [COMPLETE]
- [x] Master Curriculum Dataset (`src/data/curriculumData.ts`):
  - 80-Hour California CalMHSA Peer Support Specialist Core Certification Track (17 modules aligned with SB 803 core competencies).
  - 40-Hour Specialized & Advanced Practice Track (CalAIM ECM, Forensic Reentry, Street Medicine, and Crisis Peer Respite).
  - STAR (Situation, Task, Action, Result) Behavioral Interview Simulator: 5 real-world California county and CBO hiring scenarios with model non-clinical exemplar responses, red-flag pitfalls, and CalMHSA ethical benchmarks.
- [x] Interactive Curriculum Lab Component (`src/components/STARCurriculumView.tsx`):
  - Tabbed interface: 80-Hour Core Track, 40-Hour Specialized Track, STAR Interview Simulator, and DHCS Code of Ethics.
  - Offline-first progress tracking with persistent hour logs in `safeStorage`.
  - 1-Click candidate practice notes, scenario copying, and printable training hour attestations.
  - Integrated into main workspace navigation (`/curriculum` and `tab=curriculum`).

### Phase 13: DHCS & CalMHSA Code of Ethics & CalAIM Golden Thread Note Standard — [COMPLETE]
- [x] 10-Point DHCS & CalMHSA Code of Ethics Boundary Checklist (`checklistStateService.ts` & `InteractiveChecklistWidget.tsx`):
  - Self-determination, non-clinical scope integrity, zero dual relationships, purposeful lived experience disclosure, confidentiality limits (CANRA/Tarasoff), financial/gift integrity, cultural humility, harm reduction affirmation, duty to consult, and self-care.
  - Real-time interactive completion tracking, clipboard export, and baseline reset.
- [x] CalAIM Golden Thread™ Clinical Standard in Encounter Notes (`SessionNoteForm.tsx`):
  - Interactive visual continuity banner verifying the unbroken 4-link chain:
    1. Recovery Care Plan Goal Linkage
    2. Non-Clinical Peer Intervention (with SB 803 Core Competencies tagged)
    3. Observable Client Response with mandatory direct quote (`"..."`)
    4. Collaborative Plan and scheduled next meeting
  - 1-Tap "Insert Direct Quote Template" button and real-time audit verification pill.
  - Mandatory DHCS/CalMHSA Code of Ethics boundary attestation checkbox prior to electronic signing.


