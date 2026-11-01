# Peer Notebook Product Roadmap: Three Horizons of Delivery

**Document Version:** 1.1-GA  
**Target Domain:** peernotebook.com  
**Alignment:** CalAIM Payment Reform & County Behavioral Health Partnerships

---

## Horizon 1: Core PWA & Field Logging Engine (GA #8 Release — Current) — [100% COMPLETE]
**Focus:** Solo Specialists & Small Community Non-Profits

* [x] **DONE** - **Local-First IndexedDB Persistence:** Zero-latency client note logging via Dexie.js.
* [x] **DONE** - **CalAIM H0038 Calculator:** 3-way time capture (Direct, Travel, Documentation) with automated 15-minute billing unit calculation (CMS 8-minute rule).
* [x] **DONE** - **Trauma-Informed Design System:** Strict light mode Soft Slate (`#F8FAFC`), Deep Navy (`#1E3A8A`), and Muted Teal (`#0F766E`) with 48px touch targets.
* [x] **DONE** - **Cryptographic PDF Note Export:** Client-side tamper-evident PDF generation with SHA-256 hash stamp for supervisor cosigning.
* [x] **DONE** - **Lead Magnet & Outreach Toolkit:** Downloadable CalAIM audit checklist and peer specialist outreach templates.

---

## Horizon 2: County Health & Multi-Tenant Agency Bridge — [100% COMPLETE]
**Focus:** Medium-to-Large Community Behavioral Health Agencies

* [x] **DONE** - **Role-Based Access Control (RBAC):** Agency Supervisor Review Queues, Specialist Cosigning, and Multi-Specialist Roster Management (`src/context/AuthContext.tsx`, `SupervisorQueue.tsx`).
* [x] **DONE** - **Batch Claims Export:** Medi-Cal 837P EDI electronic billing export formatted for California county behavioral health clearinghouses (`src/services/ehrIntegrationService.ts`).
* [x] **DONE** - **Automated County Audit Readiness:** 1-click generation of county compliance binders with CalMHSA core competency tags (`SB803CompetencyGuide.tsx`, `ExportSessionPDF.tsx`).
* [x] **DONE** - **Enhanced Offline Token Refresh:** Resilient WebCrypto AES-GCM OAuth and JWT offline rotation for field tablets disconnected > 72 hours up to 168 hours (`src/auth/offline_token_engine.ts`).

---

## Horizon 3: Enterprise EHR Interoperability — [100% COMPLETE]
**Focus:** County Departments of Mental Health & Health Systems

* [x] **DONE** - **HL7 FHIR R4 Bundle Export:** Formatted JSON DocumentReference / Encounter bundle generation (`src/services/ehrIntegrationService.ts`).
* [x] **DONE** - **Bi-directional Direct EHR Sync:** Bi-directional HL7 FHIR R4 Encounter, Observation, and DocumentReference write-back to Epic, Cerner Millennium, and Netsmart myAvatar (`src/interop/fhir_r4_client.ts`).
* [x] **DONE** - **SMART-on-FHIR Peer Launchpad:** Hospital Emergency Department SMART App Launch v2 flow with PKCE RFC 7636 challenge generation and crisis diversion note routing (`src/interop/smart_launchpad.ts`).
* [x] **DONE** - **Aggregated Multi-County Population Telemetry:** Statewide recovery capital, housing stability, and harm reduction population health analytics with strict $k$-anonymity ($k \ge 5$) (`src/analytics/telemetry_aggregator.ts`).

