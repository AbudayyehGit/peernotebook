# Peer Notebook: Master Documentation Binder & Technical Hub

> **Status:** General Availability (GA #8) Production Standard  
> **Target Domain:** [peernotebook.com](https://peernotebook.com)  
> **Repository Path:** `/docs/`  
> **Standard:** H. Joe Abudayyeh Systems Production Standards (ISO 9001:2015 Clause 7.5 & CalAIM Governance)  
> **Architect & Lead:** H. Joe Abudayyeh  
> **Copyright:** © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.  
> **Regulatory Alignment:** California SB 803 / CalMHSA / Medi-Cal CalAIM (HCPCS H0038) / HIPAA 45 CFR § 164

---

## Executive Overview
**Peer Notebook** is a specialized, trauma-informed software platform and progressive web application (PWA) engineered specifically for **Certified Peer Support Specialists (CPSS)**, Peer Recovery Coaches (CPRC), and community health workers. The platform streamlines day-to-day workflow tracking, session documentation, and resource navigation while establishing rigorous data privacy, county compliance, and administrative standards.

This centralized **Master Documentation Binder** provides the deterministic blueprint for system architecture, regulatory compliance (California SB 803 / CalMHSA / LACDMH), Medi-Cal CalAIM billing readiness (HCPCS H0038), human-centered UX design, engineering quality, and operational reliability. Organized according to the standardized 7-category numerical taxonomy (`01` through `07`), this binder eliminates cognitive fatigue, enforces clear separation of concerns, and ensures all specifications remain audit-ready.

---

## Master Directory Architecture & Business Organization Vault

```
docs/
├── README.md                          # Master Binder Index & System Manifest
├── checklist.md                       # Master Engineering & SDLC Verification Checklist (Phases 1-15 & Sprints 1-4)
├── ip-strategy-matrix.md              # IP Mechanism Mapping (Copyright, Trademark, Trade Secret, Patent)
├── filing-checklists.md               # USPTO Class 42 & USCO Source Code Deposit Checklists
├── templates/                         # Master Legal Boilerplate Templates
│   ├── unilateral-nda.md              # Unilateral Healthcare Software NDA Template
│   └── piia-clause.md                 # Perpetual Proprietary Information & Inventions Assignment Clause
├── compliance/                        # Regulatory & Independent Audit Records
│   ├── security_matrix.json           # SOC 2 Type 1 & ISO 27001 Control Mapping
│   ├── dr_runbook.md                  # Cold Disaster Recovery Simulation Runbook
│   └── usco_form_tx_deposit.txt       # USCO Form TX 50-Page Source Deposit Manifest
├── 01-project-management/             # Charters, roadmaps, sprint schedules, and governance
│   ├── README.md                      # Section Overview & Governance Guide
│   ├── project-charter.md             # Mission, scope, constraints, and success metrics
│   ├── product-roadmap.md             # Three-horizon milestones and release targets
│   ├── sprint-cadence.md              # 14-day agile sprint rituals and estimation scales
│   ├── stakeholder-matrix.md          # RACI governance matrix and escalation protocols
│   ├── 04_Project_Schedule_Milestones.md # Unified Master Sprint Backlog (26 items • 90 unit tests)
│   ├── admin-cbo-onboarding-guide.md  # 6-step guided onboarding & CalAIM capacity planning
│   └── checklist.md                   # SDLC verification matrix Phases 1-6
├── 02-business-strategy/              # Unit economics, market positioning, and clinical workflows
│   ├── README.md                      # Section Overview & Commercial Foundation
│   ├── product-vision-scope.md        # Trauma-informed mission, non-clinical ethos & personas
│   ├── clinical-workflow-h0038.md     # Medi-Cal H0038 field guidelines & 4-part note anatomy
│   ├── mvp-feature-spec.md            # Approved 1.0-GA MVP feature specification (MOD-01 to MOD-05)
│   ├── peer-core-competencies.md      # CalMHSA 17 Core Peer Competencies & intervention crosswalk
│   ├── value-proposition.md           # Pains, gains, and measurable agency administrative ROI
│   ├── market-analysis.md             # Behavioral health market sizing and CalAIM catalysts
│   ├── monetization-model.md          # Multi-tier pricing for solo specialists, CBOs & counties
│   ├── investor-financial-pitch.md    # Investor pitch and financial model ($2.5M-$4.0M M&A baseline)
│   ├── competitive-matrix.md          # Structural differentiation vs legacy medical EHRs
│   ├── 1099-independent-contractor-strategy.md # Solo 1099 practitioner workflow & mileage ledger
│   └── stripe-billing-architecture.md # Stripe multi-tier subscription & dual-persistence sync
├── 03-design-experience/              # Design system, personas, UX journeys, and regulatory guides
│   ├── README.md                      # Section Overview & Design Constitution
│   ├── design-system.md               # Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), 48px touch tokens
│   ├── user-personas.md               # Field CPSS, Recovery Coach, and Supervisor user archetypes
│   ├── information-architecture.md    # Single-screen vertical note logging stack & navigation trees
│   ├── accessibility-standards.md     # WCAG 2.2 Level AA checklists and keyboard navigation specs
│   ├── calmhsa-compliance-guide.md    # CalMHSA supervisory standards & non-clinical scope
│   ├── calmhsa-sb803-core-competencies.md # SB 803 Core Competencies mapping
│   └── medi-cal-billing-compliance.md # DHCS CalAIM payment reform & 15-minute billing unit rules
├── 04-technical-architecture/         # System topology, data schemas, sync contracts, and security
│   ├── README.md                      # Section Overview & Architectural Philosophy
│   ├── GA8_Production_Grade_Architecture_White_Paper.md # GA #8 Enterprise Architecture White Paper
│   ├── system-architecture.md         # Component topology, local-first IndexedDB, 7-step note lifecycle
│   ├── data-models.md                 # Entity relationship diagrams, TypeScript types & SQL schemas
│   ├── api-specifications.md          # REST/RPC contracts, JWT auth claims, and error taxonomies
│   ├── security-threat-model.md       # STRIDE evaluation, WebCrypto AES-GCM, and TLS 1.3 encryption
│   ├── 07_Offline_Sync_IndexedDB.md   # Dexie.js offline persistence, sync queue & conflict rules
│   ├── 05_Compliance_Engine_PDF_Export.md # Automated 4-part note validation & SHA-256 PDF export
│   ├── 08_HIPAA_BAA_Consent_Model.md  # HIPAA 45 CFR § 164, CMIA Civil Code § 56 & BAA checklist
│   ├── 09_CBO_EHR_Interoperability_FHIR_HL7_CCDA.md # HL7 FHIR R4, v2.5.1, and C-CDA XML engine
│   └── telemetry-monitoring-spec.md   # Dexie metrics, sync worker state, and SRE signals
├── 05-engineering-quality/            # CI/CD, testing methodology, code review, and QA standards
│   ├── README.md                      # Section Overview & Engineering Quality Charter
│   ├── testing-strategy.md            # Test pyramid (70% unit, 20% integration, 10% E2E)
│   ├── ci-cd-pipeline.md              # GitHub Actions workflows, build gates, and Vercel deploys
│   ├── code-review-standards.md       # PR guidelines, TypeScript strict mode, and review rubrics
│   ├── qa-checklists.md               # Mobile touch target (>48px) grids & regression suites
│   ├── hipaa-security-rule.md         # HIPAA 45 CFR § 164.312 technical safeguards verification
│   └── engineering-telemetry-monitoring.md # SRE Telemetry, golden signals, and monitoring standards
├── 06-operations-deployment/          # Infrastructure, telemetry, incident runbooks, and recovery
│   ├── README.md                      # Section Overview & SRE Reliability Standards
│   ├── infrastructure-runbook.md      # Vercel Edge custom domain DNS & Supabase PostgreSQL cluster
│   ├── monitoring-alerting.md         # Golden signals (latency, errors, sync queue) & SLO thresholds
│   ├── incident-response.md           # P0–P3 incident classifications, on-call paging, and war-rooms
│   ├── disaster-recovery.md           # RTO (< 15 min), RPO (< 1 min), storage quotas & OPFS recovery
│   ├── h0038-billing-operations.md    # Medi-Cal claims batching, billing modifiers (U1, U2, GQ)
│   ├── cbo-onboarding-governance.md   # 5-CBO Pilot Cohort Onboarding & County Bridge Validation
│   └── 05_Deployment_Verification_Guide.md # Canonical production deployment verification protocol
└── 07-legal-administrative/           # Compliance, privacy, licensing, corporate entity & IP
    ├── README.md                      # Section Overview & Legal Governance Framework
    ├── 00_Business_Organization_Binder_Vault_Handover.md # Master GA#8 Corporate Handover Vault & Dossier
    ├── 01_Terms_of_Service.md         # Master Terms of Service with Non-Clinical Disclaimers
    ├── 04_Independent_Contractor_Agreement_1099.md # Model 1099 Specialist Agreement (CA AB 5 / SB 803)
    ├── 05_County_Intergovernmental_CalAIM_Agreement.md # Model County Intergovernmental CalAIM Subcontract
    ├── 06_IP_Assignment_Agreement.md  # Executed Founder-to-LLC IP Assignment (H. Joe Abudayyeh to Peer Notebook LLC)
    ├── 07_Business_Associate_Agreement_BAA_Framework.md # Institutional BAA Framework (Supabase, AWS, Zero-AI Policy)
    ├── 08_Open_Source_License_Notice.md # Third-Party Dependency Attributions & Permissive License Matrix
    ├── privacy-policy-spec.md         # HIPAA Notice of Privacy Practices & CMIA Disclosures
    ├── compliance-matrix.md           # SOC 2 Type II, ISO 27001, HIPAA & CalMHSA crosswalk
    └── ip-licensing.md                # Software licensing inventory, open-source attribution & IP

config/
├── legal/
│   ├── entity_meta.json               # Delaware LLC, California Foreign Qualification, IRS EIN CP 575 A
│   └── trademark_filing.json          # USPTO Trademark "PEER NOTEBOOK" Class 042 & 009 Section 1(a)
└── tenants/
    └── beta_cohort.json               # 5 California CBO pilot entities (Alameda, LA, Fresno, Contra Costa, SD)
```

---

## 01. Project Management
*Governance, delivery velocity, milestone planning, and team synchronization.*

* [**01-project-management/README.md**](./01-project-management/README.md): Governance charter and CPSS project delivery standards.
* [**04_Project_Schedule_Milestones.md**](./01-project-management/04_Project_Schedule_Milestones.md): The **Authoritative Consolidated Master Sprint Backlog** (26 / 26 items completed, 130 pts, 90 / 90 tests passing).
* [**project-charter.md**](./01-project-management/project-charter.md): Approved 1.1-GA Project Charter establishing mission, non-clinical scope, Medi-Cal H0038 billing compliance, and key performance indicators.
* [**product-roadmap.md**](./01-project-management/product-roadmap.md): Three-horizon milestone schedule covering Horizon 1 (1.1-GA CPSS MVP & Field Logging), Horizon 2 (CalAIM & County Bridge), and Horizon 3 (Enterprise EHR Interoperability).
* [**sprint-cadence.md**](./01-project-management/sprint-cadence.md): Standardized 14-day sprint cycle, Fibonacci story-point estimation rules, and standup/retro agendas.
* [**stakeholder-matrix.md**](./01-project-management/stakeholder-matrix.md): Formal RACI matrix outlining decision rights across executive, engineering, clinical, and county operations leads.
* [**admin-cbo-onboarding-guide.md**](./01-project-management/admin-cbo-onboarding-guide.md): 6-step guided Medi-Cal onboarding and CalAIM capacity/revenue planning.
* [**checklist.md**](./01-project-management/checklist.md): Master Engineering & SDLC verification checklist across Phases 1 through 15 and Sprints 1 through 4.


---

## 02. Business Strategy & Clinical Practice
*Commercial positioning, unit economics, trauma-informed clinical practice, and non-clinical scope.*

* [**02-business-strategy/README.md**](./02-business-strategy/README.md): Commercial strategy and economic foundation overview.
* [**product-vision-scope.md**](./02-business-strategy/product-vision-scope.md): Approved 1.0-GA Product Vision & Scope: trauma-informed mission, non-clinical ethos, and CPSS personas.
* [**clinical-workflow-h0038.md**](./02-business-strategy/clinical-workflow-h0038.md): Medi-Cal H0038 field encounter guidelines, 4-part note anatomy, and CalAIM compliance workflows.
* [**mvp-feature-spec.md**](./02-business-strategy/mvp-feature-spec.md): Approved 1.0-GA MVP Feature Specification covering five core modules (MOD-01 to MOD-05).
* [**peer-core-competencies.md**](./02-business-strategy/peer-core-competencies.md): Complete crosswalk of CalMHSA 17 Core Peer Competencies and strengths-based recovery interventions.
* [**value-proposition.md**](./02-business-strategy/value-proposition.md): Value proposition canvas detailing customer friction points, cognitive relief vectors, and measurable administrative ROI.
* [**market-analysis.md**](./02-business-strategy/market-analysis.md): Quantitative behavioral health market analysis, CalAIM ECM catalysts, and macro industry tailwinds.
* [**monetization-model.md**](./02-business-strategy/monetization-model.md): Multi-tier subscription economics for solo specialists, community health centers, and county agencies.
* [**investor-financial-pitch.md**](./02-business-strategy/investor-financial-pitch.md): Strategic Investor Valuation White Paper: $35k MVP replacement value, $40k Year 1 baseline ARR, $2.5M-$4.0M M&A exit, and $20M decadal economic ecosystem.
* [**competitive-matrix.md**](./02-business-strategy/competitive-matrix.md): Structural comparison against legacy medical EHRs (Epic, Cerner, Netsmart) and generic note-taking tools.
* [**1099-independent-contractor-strategy.md**](./02-business-strategy/1099-independent-contractor-strategy.md): Solo 1099 independent contractor operational model, mileage ledger ($0.67/mi), and direct RLS isolation.
* [**stripe-billing-architecture.md**](./02-business-strategy/stripe-billing-architecture.md): Dual-path subscription Stripe architecture, webhook listener, and bidirectional Supabase sync.

---

## 03. Design Experience & Regulatory Compliance
*Human-centered interface standards, responsive design tokens, and cognitive accessibility.*

* [**03-design-experience/README.md**](./03-design-experience/README.md): Design constitution and human-centered design principles.
* [**design-system.md**](./03-design-experience/design-system.md): Mathematical typography scales, Soft Slate (`#F8FAFC`), Deep Navy (`#1E3A8A`), Muted Teal (`#0F766E`), and 48px touch target tokens.
* [**user-personas.md**](./03-design-experience/user-personas.md): Empirical user archetypes (Field CPSS, Peer Recovery Coach, Clinical Supervisor) with behavioral maps.
* [**information-architecture.md**](./03-design-experience/information-architecture.md): Single-screen vertical note logging stack, state transition flows, and breadcrumb taxonomies.
* [**accessibility-standards.md**](./03-design-experience/accessibility-standards.md): WCAG 2.2 Level AA conformance audit, ARIA landmark guidelines, and keyboard navigation specifications.
* [**calmhsa-compliance-guide.md**](./03-design-experience/calmhsa-compliance-guide.md): California SB 803 peer certification requirements, supervisory co-signing, and non-clinical practice boundaries.
* [**calmhsa-sb803-core-competencies.md**](./03-design-experience/calmhsa-sb803-core-competencies.md): CalMHSA SB 803 17 Core Competencies crosswalk and practice guide.
* [**medi-cal-billing-compliance.md**](./03-design-experience/medi-cal-billing-compliance.md): Medi-Cal H0038 billing audit criteria, Place of Service 15, and 3-way time verification rules.

---

## 04. Technical Architecture
*Distributed systems design, resilient state machines, schema contracts, and defensive security.*

* [**04-technical-architecture/README.md**](./04-technical-architecture/README.md): Architectural philosophy, zero-AI determinism, and dual-layer persistence principles.
* [**GA8_Production_Grade_Architecture_White_Paper.md**](./04-technical-architecture/GA8_Production_Grade_Architecture_White_Paper.md): Approved GA #8 Enterprise Architecture White Paper detailing system classification, dual persistence, and CalAIM alignment.
* [**system-architecture.md**](./04-technical-architecture/system-architecture.md): High-level system topology diagram, client-server sync protocols, and edge compute caching layers.
* [**data-models.md**](./04-technical-architecture/data-models.md): Strongly typed schema definitions, PostgreSQL DDL, multi-tenant RLS policies, and Medi-Cal H0038 / POS 15 compliance.
* [**api-specifications.md**](./04-technical-architecture/api-specifications.md): REST/RPC contracts, Supabase JWT auth claims, notes locking endpoints, and error codes.
* [**security-threat-model.md**](./04-technical-architecture/security-threat-model.md): Comprehensive STRIDE threat assessment, WebCrypto token validation pipelines, and KMS data-at-rest encryption.
* [**07_Offline_Sync_IndexedDB.md**](./04-technical-architecture/07_Offline_Sync_IndexedDB.md): Approved 1.0-GA Offline Synchronization & IndexedDB: Dexie.js local-first schemas, background sync worker queues, and Last-Write-Wins conflict resolution.
* [**05_Compliance_Engine_PDF_Export.md**](./04-technical-architecture/05_Compliance_Engine_PDF_Export.md): Automated 4-part note validation, immutable audit trails, SHA-256 tamper-evident hashing, and client-side PDF export.
* [**08_HIPAA_BAA_Consent_Model.md**](./04-technical-architecture/08_HIPAA_BAA_Consent_Model.md): HIPAA Security Rule 45 CFR § 164, CMIA Civil Code § 56, digital signature vector capture, and SHA-256 consent binding.
* [**09_CBO_EHR_Interoperability_FHIR_HL7_CCDA.md**](./04-technical-architecture/09_CBO_EHR_Interoperability_FHIR_HL7_CCDA.md): CBO EHR clinical interchange engine: HL7 FHIR R4 Encounter/Observation bundles, HL7 v2.5.1, and C-CDA XML progress notes.
* [**telemetry-monitoring-spec.md**](./04-technical-architecture/telemetry-monitoring-spec.md): SRE observability specifications, IndexedDB quota probes, and sync worker latency monitoring.

---

## 05. Engineering & Quality
*Verification gates, deterministic test harnesses, continuous delivery, and code craftsman rubrics.*

* [**05-engineering-quality/README.md**](./05-engineering-quality/README.md): Engineering quality charter and verification philosophy.
* [**testing-strategy.md**](./05-engineering-quality/testing-strategy.md): Test pyramid allocation (70% unit, 20% integration, 10% E2E) with Dexie.js offline-first mocking protocols.
* [**ci-cd-pipeline.md**](./05-engineering-quality/ci-cd-pipeline.md): Declarative GitHub Actions workflows, `tsc && vite build` quality gates, and Vercel edge deployment triggers.
* [**code-review-standards.md**](./05-engineering-quality/code-review-standards.md): Mandatory 2-reviewer consensus rules, automated lint barriers, and architectural change protocols.
* [**qa-checklists.md**](./05-engineering-quality/qa-checklists.md): Pre-flight deployment checklists, cross-browser test grids, and performance regression benchmarks.
* [**hipaa-security-rule.md**](./05-engineering-quality/hipaa-security-rule.md): Technical safeguards compliance mapping for HIPAA 45 CFR § 164.312 and California CMIA.
* [**engineering-telemetry-monitoring.md**](./05-engineering-quality/engineering-telemetry-monitoring.md): SRE Telemetry, golden signals, and automated verification standards.

---

## 06. Operations & Deployment
*Site reliability engineering, observability telemetry, incident mitigation, and operational continuity.*

* [**06-operations-deployment/README.md**](./06-operations-deployment/README.md): SRE practices and continuous operational uptime standards.
* [**infrastructure-runbook.md**](./06-operations-deployment/infrastructure-runbook.md): Production Vercel Edge configuration, DNS records for `peernotebook.com`, and Supabase cluster parameters.
* [**monitoring-alerting.md**](./06-operations-deployment/monitoring-alerting.md): Golden signal telemetry tracking (Latency, Traffic, Errors, Saturation) with PagerDuty escalation routes.
* [**incident-response.md**](./06-operations-deployment/incident-response.md): P0–P3 incident classifications, commander roles, war-room runbooks, and blameless post-mortem templates.
* [**disaster-recovery.md**](./06-operations-deployment/disaster-recovery.md): RTO (< 15 min) and RPO (< 1 min) failover scenarios, regional data replication, and restore drill schedules.
* [**h0038-billing-operations.md**](./06-operations-deployment/h0038-billing-operations.md): County Medi-Cal claims processing, billing modifiers (U1, U2, GQ), and audit preparation workflows.
* [**cbo-onboarding-governance.md**](./06-operations-deployment/cbo-onboarding-governance.md): 5-CBO Beta Pilot Cohort Onboarding and County Bridge operational validation protocol.
* [**05_Deployment_Verification_Guide.md**](./06-operations-deployment/05_Deployment_Verification_Guide.md): Canonical release and post-deployment solid-state verification protocol.

---

## 07. Legal & Administrative
*Corporate entity structure, IP assignment, institutional BAA, non-clinical disclaimers, and open-source licensing.*

* [**07-legal-administrative/README.md**](./07-legal-administrative/README.md): Legal governance and compliance overview.
* [**00_Business_Organization_Binder_Vault_Handover.md**](./07-legal-administrative/00_Business_Organization_Binder_Vault_Handover.md): Master GA#8 Corporate Handover Vault and Dossier certifying corporate charter, equity ownership, IP chain of title, statutory filings, and production certification.
* [**01_Terms_of_Service.md**](./07-legal-administrative/01_Terms_of_Service.md): Master Terms of Service with explicit disclaimer: administrative formatting aid only, no guarantee against Medi-Cal billing audits.
* [**04_Independent_Contractor_Agreement_1099.md**](./07-legal-administrative/04_Independent_Contractor_Agreement_1099.md): Model 1099 Specialist Independent Contractor Agreement conforming to California AB 5 and California SB 803 non-clinical scope of practice.
* [**05_County_Intergovernmental_CalAIM_Agreement.md**](./07-legal-administrative/05_County_Intergovernmental_CalAIM_Agreement.md): Model County Intergovernmental CalAIM H0038 Peer Services Subcontract with Qualified Clinical Supervision and ANSI 837P EDI specifications.
* [**06_IP_Assignment_Agreement.md**](./07-legal-administrative/06_IP_Assignment_Agreement.md): Executed Founder-to-LLC Intellectual Property Assignment Agreement transferring 100% of all source code, domain names (`peernotebook.com`), algorithms, and documentation from individual founder H. Joe Abudayyeh to **Peer Notebook LLC**.
* [**07_Business_Associate_Agreement_BAA_Framework.md**](./07-legal-administrative/07_Business_Associate_Agreement_BAA_Framework.md): Institutional BAA framework across Supabase, AWS S3 WORM storage, and Google Cloud zero-retention data logging policies.
* [**08_Open_Source_License_Notice.md**](./07-legal-administrative/08_Open_Source_License_Notice.md): Open-source dependency attributions (React, Vite, Tailwind CSS, Dexie.js, Supabase, jsPDF) and commercial dual-licensing framework.
* [**privacy-policy-spec.md**](./07-legal-administrative/privacy-policy-spec.md): Comprehensive HIPAA Notice of Privacy Practices, California CMIA disclosures, data retention timelines (10-year Medi-Cal requirement), and client confidentiality rights.
* [**compliance-matrix.md**](./07-legal-administrative/compliance-matrix.md): Multi-framework audit crosswalk mapping SOC 2 Type II, ISO/IEC 27001, HIPAA 45 CFR § 164, and CalMHSA requirements.
* [**ip-licensing.md**](./07-legal-administrative/ip-licensing.md): Software licensing inventory, patent declarations, and third-party open-source attribution tables.

---

## 08. Business Organization Binder Vault (Corporate, Legal & IP Records)

The **Business Organization Binder Vault** contains official corporate registry records, intellectual property deposits, and multi-tenant pilot cohort agreements:

1. **Corporate Entity Profile (`config/legal/entity_meta.json`):**
   - Entity: **Peer Notebook LLC** (Delaware formation 2024-01-15; California Foreign Qualification SOS Entity #202460110822).
   - Tax Profile: IRS EIN CP 575 A verification notice (`XX-XXX4819`), NAICS 541511 (Healthcare SaaS) & 621420 (Outpatient Mental Health Support).
   - HIPAA Status: Business Associate (45 CFR § 160.103) and 42 CFR Part 2 Qualified Service Organization (QSO).

2. **USPTO Trademark Filing Dossier (`config/legal/trademark_filing.json`):**
   - Mark: **"PEER NOTEBOOK"** (Class 009 Downloadable Mobile/PWA Application & Class 042 Healthcare SaaS).
   - Basis: Section 1(a) Use in Commerce with verified mobile interface specimens and SaaS billing portal screen captures.

3. **USCO Source Code Deposit Generator (`scripts/compliance/generate_usco_deposit.sh`):**
   - Form TX automated 50-page deposit manifest under 37 C.F.R. § 202.20 & Circular 61 with automated trade secret redactions.

4. **Multi-Tenant CBO Beta Pilot Cohort (`config/tenants/beta_cohort.json`):**
   - Five enrolled California CBO entities across Alameda, Los Angeles, Fresno, Contra Costa, and San Diego counties.
   - NPI validation, county Medi-Cal rates ($29.75–$34.00/unit), and offline token grace periods ($96\text{h}–168\text{h}$).

5. **Security & Independent Audit Controls (`docs/compliance/security_matrix.json` & `docs/compliance/dr_runbook.md`):**
   - SOC 2 Type 1 and ISO 27001 control mapping for enterprise health system procurement.
   - Semi-annual Cold Disaster Recovery simulation runbook with RTO $< 4\text{h}$ and RPO $< 15\text{m}$.

---

## 09. Standalone Extraction & Direct Vercel Deployment

### Deploying to peernotebook.com on Vercel

1. **GitHub Repository Sync**:
   ```bash
   git init -b main
   git remote add origin https://github.com/joeabudayyeh/peernotebook.git
   git add .
   git commit -m "feat: Peer Notebook GA #8 complete repository hardening & documentation bundle"
   git push -u origin main
   ```

2. **Vercel Direct Import**:
   - Navigate to [Vercel Dashboard](https://vercel.com/new).
   - Import the `peernotebook` repository.
   - Framework Preset: **Vite**.
   - Build Command: `tsc && vite build` (verified in `package.json`).
   - Output Directory: `dist`.
   - Install Command: `npm install --legacy-peer-deps` (configured in `vercel.json`).

3. **Custom Domain Binding**:
   - In Vercel Project Settings → **Domains**:
   - Add `peernotebook.com` (and `www.peernotebook.com`).
   - Configure DNS records with your registrar:
     - `A` record: `@` → `76.76.21.21`
     - `CNAME` record: `www` → `cname.vercel-dns.com`
   - SSL certificates automatically provision via Let's Encrypt.
