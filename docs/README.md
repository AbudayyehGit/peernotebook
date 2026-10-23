# Peer Notebook: Master Documentation Binder & Technical Hub

> **Status:** General Availability (GA #8) Production Standard  
> **Target Domain:** [peernotebook.com](https://peernotebook.com)  
> **Repository Path:** `/docs/`  
> **Standard:** ISO 9001:2015 Clause 7.5 (Documented Information) & CalAIM Behavioral Health Governance  
> **Regulatory Alignment:** California SB 803 / CalMHSA / Medi-Cal CalAIM (HCPCS H0038) / HIPAA 45 CFR § 164

---

## Executive Overview
**Peer Notebook** is a specialized, trauma-informed software platform and progressive web application (PWA) engineered specifically for **Certified Peer Support Specialists (CPSS)**, Peer Recovery Coaches (CPRC), and community health workers. The platform streamlines day-to-day workflow tracking, session documentation, and resource navigation while establishing rigorous data privacy, county compliance, and administrative standards.

This centralized **Master Documentation Binder** provides the deterministic blueprint for system architecture, regulatory compliance (California SB 803 / CalMHSA / LACDMH), Medi-Cal CalAIM billing readiness (HCPCS H0038), human-centered UX design, engineering quality, and operational reliability. Organized according to the standardized 7-category numerical taxonomy (`01` through `07`), this binder eliminates cognitive fatigue, enforces clear separation of concerns, and ensures all specifications remain audit-ready.

---

## Master Directory Architecture

```
docs/
├── README.md                          # Master Binder Index & System Manifest
├── checklist.md                       # Master Engineering & SDLC Verification Checklist
├── 01-project-management/             # Charters, roadmaps, sprint schedules, and governance
│   ├── README.md                      # Section Overview & Governance Guide
│   ├── project-charter.md             # Mission, scope, constraints, and success metrics
│   ├── product-roadmap.md             # Three-horizon milestones and release targets
│   ├── sprint-cadence.md              # 14-day agile sprint rituals and estimation scales
│   ├── stakeholder-matrix.md          # RACI governance matrix and escalation protocols
│   └── checklist.md                   # SDLC verification matrix Phases 1-6
├── 02-business-strategy/              # Unit economics, market positioning, and value drivers
│   ├── README.md                      # Section Overview & Commercial Foundation
│   ├── product-vision-scope.md        # Trauma-informed mission, non-clinical ethos & personas
│   ├── clinical-workflow-h0038.md     # Medi-Cal H0038 field guidelines & 4-part note anatomy
│   ├── mvp-feature-spec.md            # Approved 1.0-GA MVP feature specification (MOD-01 to MOD-05)
│   ├── peer-core-competencies.md      # CalMHSA 17 Core Peer Competencies & intervention crosswalk
│   ├── value-proposition.md           # Pains, gains, and measurable agency administrative ROI
│   ├── market-analysis.md             # Behavioral health market sizing and CalAIM catalysts
│   ├── monetization-model.md          # Multi-tier pricing for solo specialists, CBOs & counties
│   └── competitive-matrix.md          # Structural differentiation vs legacy medical EHRs
├── 02-clinical-practice/              # Non-clinical practice guidelines & CalMHSA crosswalk
│   ├── README.md                      # Section Overview & Clinical Practice Standards
│   ├── clinical-workflow-h0038.md     # Medi-Cal H0038 encounter documentation standards
│   ├── peer-core-competencies.md      # CalMHSA 17 Core Competencies & non-clinical examples
│   ├── product-vision-scope.md        # Lived-experience recovery philosophy & boundary safeguards
│   └── value-proposition.md           # Administrative relief & audit protection benefits
├── 03-design-experience/              # Design system, personas, UX journeys, and accessibility
│   ├── README.md                      # Section Overview & Design Constitution
│   ├── design-system.md               # Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), 48px touch tokens
│   ├── user-personas.md               # Field CPSS, Recovery Coach, and Supervisor user archetypes
│   ├── information-architecture.md    # Single-screen vertical note logging stack & navigation trees
│   ├── accessibility-standards.md     # WCAG 2.2 Level AA checklists and keyboard navigation specs
│   ├── calmhsa-compliance-guide.md    # CalMHSA supervisory standards & non-clinical scope
│   └── medi-cal-billing-compliance.md # DHCS CalAIM payment reform & 15-minute billing unit rules
├── 03-compliance-regulatory/          # Regulatory compliance, certification, and Medi-Cal audits
│   ├── README.md                      # Section Overview & Regulatory Framework
│   ├── calmhsa-compliance-guide.md    # California SB 803 & CalMHSA certification compliance
│   ├── medi-cal-billing-compliance.md # Medi-Cal H0038 audit defense & CMS 8-minute rounding logic
│   ├── accessibility-standards.md     # Section 508 & WCAG 2.2 AA accessibility requirements
│   └── design-system.md               # Trauma-informed low-arousal clinical UI specifications
├── 04-technical-architecture/         # System topology, data schemas, sync contracts, and security
│   ├── README.md                      # Section Overview & Architectural Philosophy
│   ├── GA8_Production_Grade_Architecture_White_Paper.md # GA #8 Enterprise Architecture White Paper
│   ├── system-architecture.md         # Component topology, local-first IndexedDB, 7-step note lifecycle
│   ├── data-models.md                 # Entity relationship diagrams, TypeScript types & SQL schemas
│   ├── api-specifications.md          # REST/RPC contracts, JWT auth claims, and error taxonomies
│   ├── security-threat-model.md       # STRIDE evaluation, WebCrypto AES-GCM, and TLS 1.3 encryption
│   ├── 07_Offline_Sync_IndexedDB.md   # Dexie.js offline persistence, sync queue & conflict rules
│   ├── 05_Compliance_Engine_PDF_Export.md # Automated 4-part note validation & SHA-256 PDF export
│   └── 08_HIPAA_BAA_Consent_Model.md  # HIPAA 45 CFR § 164, CMIA Civil Code § 56 & BAA checklist
├── 05-engineering-quality/            # CI/CD, testing methodology, code review, and QA standards
│   ├── README.md                      # Section Overview & Engineering Quality Charter
│   ├── testing-strategy.md            # Test pyramid (70% unit, 20% integration, 10% E2E)
│   ├── ci-cd-pipeline.md              # GitHub Actions workflows, build gates, and Vercel deploys
│   ├── code-review-standards.md       # PR guidelines, TypeScript strict mode, and review rubrics
│   ├── qa-checklists.md               # Mobile touch target (>48px) grids & regression suites
│   └── hipaa-security-rule.md         # HIPAA 45 CFR § 164.312 technical safeguards verification
├── 05-security-privacy/               # Technical security safeguards & privacy engineering
│   ├── README.md                      # Section Overview & Defensive Security Architecture
│   ├── hipaa-security-rule.md         # 45 CFR § 164.312 Technical Safeguards & CMIA Civil Code § 56
│   ├── testing-strategy.md            # Automated security boundary & RLS tenant isolation tests
│   ├── code-review-standards.md       # Privacy-by-design review rules & zero-jargon linters
│   └── qa-checklists.md               # Security regression checklists and offline data audits
├── 06-operations-deployment/          # Infrastructure, telemetry, incident runbooks, and recovery
│   ├── README.md                      # Section Overview & SRE Reliability Standards
│   ├── infrastructure-runbook.md      # Vercel Edge custom domain DNS & Supabase PostgreSQL cluster
│   ├── monitoring-alerting.md         # Golden signals (latency, errors, sync queue) & SLO thresholds
│   ├── incident-response.md           # P0–P3 incident classifications, on-call paging, and war-rooms
│   ├── disaster-recovery.md           # RTO (< 15 min), RPO (< 1 min), storage quotas & OPFS recovery
│   └── h0038-billing-operations.md    # Medi-Cal claims batching, billing modifiers (U1, U2, GQ)
├── 06-operations-billing/             # Medi-Cal billing workflows & county claims processing
│   ├── README.md                      # Section Overview & Billing Operations
│   ├── h0038-billing-operations.md    # Medi-Cal H0038 claims batching & clearinghouse uploads
│   ├── infrastructure-runbook.md      # Cloud hosting topology, DNS records & edge routing
│   ├── incident-response.md           # Operational incident response & sync failure protocols
│   └── disaster-recovery.md           # Data retention, backup restoration, and disaster recovery
└── 07-legal-administrative/           # Compliance, privacy, licensing, corporate entity & IP
    ├── README.md                      # Section Overview & Legal Governance Framework
    ├── 01_Terms_of_Service.md         # Master Terms of Service with Non-Clinical Disclaimers
    ├── terms-of-service.md            # Standard Master Services Agreement (MSA) & Acceptable Use
    ├── privacy-policy-spec.md         # HIPAA Notice of Privacy Practices & CMIA Disclosures
    ├── 06_IP_Assignment_Agreement.md  # Founder-to-LLC IP Assignment Agreement (Hani Joe Abudayyeh to Peer Notebook LLC)
    ├── 07_Business_Associate_Agreement_BAA_Framework.md # Institutional BAA Framework (Supabase, AWS, Zero-AI Policy)
    ├── 08_Open_Source_License_Notice.md # Third-Party Dependency Attributions & Permissive License Matrix
    ├── compliance-matrix.md           # SOC 2 Type II, ISO 27001, HIPAA & CalMHSA crosswalk
    └── ip-licensing.md                # Software licensing inventory, open-source attribution & IP
```

---

## 01. Project Management
*Governance, delivery velocity, milestone planning, and team synchronization.*

* [**01-project-management/README.md**](./01-project-management/README.md): Governance charter and CPSS project delivery standards.
* [**project-charter.md**](./01-project-management/project-charter.md): Approved 1.1-GA Project Charter establishing mission, non-clinical scope, Medi-Cal H0038 billing compliance, and key performance indicators.
* [**product-roadmap.md**](./01-project-management/product-roadmap.md): Three-horizon milestone schedule covering Horizon 1 (1.1-GA CPSS MVP & Field Logging), Horizon 2 (CalAIM & County Bridge), and Horizon 3 (Enterprise EHR Interoperability).
* [**sprint-cadence.md**](./01-project-management/sprint-cadence.md): Standardized 14-day sprint cycle, Fibonacci story-point estimation rules, and standup/retro agendas.
* [**stakeholder-matrix.md**](./01-project-management/stakeholder-matrix.md): Formal RACI matrix outlining decision rights across executive, engineering, clinical, and county operations leads.
* [**checklist.md**](./01-project-management/checklist.md): Master Engineering & SDLC verification checklist across Phases 1 through 6.

---

## 02. Business Strategy & Clinical Practice
*Commercial positioning, unit economics, trauma-informed clinical practice, and non-clinical scope.*

* [**02-business-strategy/README.md**](./02-business-strategy/README.md): Commercial strategy and economic foundation overview.
* [**02-clinical-practice/README.md**](./02-clinical-practice/README.md): Clinical practice standards and non-clinical recovery philosophy.
* [**product-vision-scope.md**](./02-business-strategy/product-vision-scope.md): Approved 1.0-GA Product Vision & Scope: trauma-informed mission, non-clinical ethos, and CPSS personas.
* [**clinical-workflow-h0038.md**](./02-business-strategy/clinical-workflow-h0038.md): Medi-Cal H0038 field encounter guidelines, 4-part note anatomy, and CalAIM compliance workflows.
* [**mvp-feature-spec.md**](./02-business-strategy/mvp-feature-spec.md): Approved 1.0-GA MVP Feature Specification covering five core modules (MOD-01 to MOD-05).
* [**peer-core-competencies.md**](./02-business-strategy/peer-core-competencies.md): Complete crosswalk of CalMHSA 17 Core Peer Competencies and strengths-based recovery interventions.
* [**value-proposition.md**](./02-business-strategy/value-proposition.md): Value proposition canvas detailing customer friction points, cognitive relief vectors, and measurable administrative ROI.
* [**market-analysis.md**](./02-business-strategy/market-analysis.md): Quantitative behavioral health market analysis, CalAIM ECM catalysts, and macro industry tailwinds.
* [**monetization-model.md**](./02-business-strategy/monetization-model.md): Multi-tier subscription economics for solo specialists, community health centers, and county agencies.
* [**investor-financial-pitch.md**](./02-business-strategy/investor-financial-pitch.md): Strategic Investor Valuation White Paper: $35k MVP replacement value, $40k Year 1 baseline ARR, $2.5M-$4.0M M&A exit, and $20M decadal economic ecosystem.
* [**competitive-matrix.md**](./02-business-strategy/competitive-matrix.md): Structural comparison against legacy medical EHRs (Epic, Cerner, Netsmart) and generic note-taking tools.

---

## 03. Design Experience & Compliance Regulatory
*Human-centered interface standards, responsive design tokens, and cognitive accessibility.*

* [**03-design-experience/README.md**](./03-design-experience/README.md): Design constitution and human-centered design principles.
* [**03-compliance-regulatory/README.md**](./03-compliance-regulatory/README.md): Regulatory compliance framework and audit readiness.
* [**design-system.md**](./03-design-experience/design-system.md): Mathematical typography scales, Soft Slate (`#F8FAFC`), Deep Navy (`#1E3A8A`), Muted Teal (`#0F766E`), and 48px touch target tokens.
* [**user-personas.md**](./03-design-experience/user-personas.md): Empirical user archetypes (Field CPSS, Peer Recovery Coach, Clinical Supervisor) with behavioral maps.
* [**information-architecture.md**](./03-design-experience/information-architecture.md): Single-screen vertical note logging stack, state transition flows, and breadcrumb taxonomies.
* [**accessibility-standards.md**](./03-design-experience/accessibility-standards.md): WCAG 2.2 Level AA conformance audit, ARIA landmark guidelines, and keyboard navigation specifications.
* [**calmhsa-compliance-guide.md**](./03-compliance-regulatory/calmhsa-compliance-guide.md): California SB 803 peer certification requirements, supervisory co-signing, and non-clinical practice boundaries.
* [**medi-cal-billing-compliance.md**](./03-compliance-regulatory/medi-cal-billing-compliance.md): Medi-Cal H0038 billing audit criteria, Place of Service 15, and 3-way time verification rules.

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

---

## 05. Engineering & Quality
*Verification gates, deterministic test harnesses, continuous delivery, and code craftsman rubrics.*

* [**05-engineering-quality/README.md**](./05-engineering-quality/README.md): Engineering quality charter and verification philosophy.
* [**05-security-privacy/README.md**](./05-security-privacy/README.md): Defensive security architecture and technical privacy safeguards.
* [**testing-strategy.md**](./05-engineering-quality/testing-strategy.md): Test pyramid allocation (70% unit, 20% integration, 10% E2E) with Dexie.js offline-first mocking protocols.
* [**ci-cd-pipeline.md**](./05-engineering-quality/ci-cd-pipeline.md): Declarative GitHub Actions workflows, `tsc && vite build` quality gates, and Vercel edge deployment triggers.
* [**code-review-standards.md**](./05-engineering-quality/code-review-standards.md): Mandatory 2-reviewer consensus rules, automated lint barriers, and architectural change protocols.
* [**qa-checklists.md**](./05-engineering-quality/qa-checklists.md): Pre-flight deployment checklists, cross-browser test grids, and performance regression benchmarks.
* [**hipaa-security-rule.md**](./05-security-privacy/hipaa-security-rule.md): Technical safeguards compliance mapping for HIPAA 45 CFR § 164.312 and California CMIA.

---

## 06. Operations & Deployment
*Site reliability engineering, observability telemetry, incident mitigation, and operational continuity.*

* [**06-operations-deployment/README.md**](./06-operations-deployment/README.md): SRE practices and continuous operational uptime standards.
* [**06-operations-billing/README.md**](./06-operations-billing/README.md): Medi-Cal billing operations and claims processing workflows.
* [**infrastructure-runbook.md**](./06-operations-deployment/infrastructure-runbook.md): Production Vercel Edge configuration, DNS records for `peernotebook.com`, and Supabase cluster parameters.
* [**monitoring-alerting.md**](./06-operations-deployment/monitoring-alerting.md): Golden signal telemetry tracking (Latency, Traffic, Errors, Saturation) with PagerDuty escalation routes.
* [**incident-response.md**](./06-operations-deployment/incident-response.md): P0–P3 incident classifications, commander roles, war-room runbooks, and blameless post-mortem templates.
* [**disaster-recovery.md**](./06-operations-deployment/disaster-recovery.md): RTO (< 15 min) and RPO (< 1 min) failover scenarios, regional data replication, and restore drill schedules.
* [**h0038-billing-operations.md**](./06-operations-deployment/h0038-billing-operations.md): County Medi-Cal claims processing, billing modifiers (U1, U2, GQ), and audit preparation workflows.

---

## 07. Legal & Administrative
*Corporate entity structure, IP assignment, institutional BAA, non-clinical disclaimers, and open-source licensing.*

* [**07-legal-administrative/README.md**](./07-legal-administrative/README.md): Legal governance and compliance overview.
* [**01_Terms_of_Service.md**](./07-legal-administrative/01_Terms_of_Service.md): Master Terms of Service with explicit disclaimer: administrative formatting aid only, no guarantee against Medi-Cal billing audits.
* [**terms-of-service.md**](./07-legal-administrative/terms-of-service.md): Standard enterprise SaaS agreements, acceptable use, and limitation of liability clauses.
* [**privacy-policy-spec.md**](./07-legal-administrative/privacy-policy-spec.md): Comprehensive HIPAA Notice of Privacy Practices, California CMIA disclosures, data retention timelines (10-year Medi-Cal requirement), and client confidentiality rights.
* [**06_IP_Assignment_Agreement.md**](./07-legal-administrative/06_IP_Assignment_Agreement.md): Executed Founder-to-LLC Intellectual Property Assignment Agreement transferring 100% of all source code, domain names (`peernotebook.com`), algorithms, and documentation from individual founder Hani Joe Abudayyeh to **Peer Notebook LLC**.
* [**07_Business_Associate_Agreement_BAA_Framework.md**](./07-legal-administrative/07_Business_Associate_Agreement_BAA_Framework.md): Institutional BAA framework across Supabase, AWS S3 WORM storage, and Google Cloud zero-retention data logging policies.
* [**08_Open_Source_License_Notice.md**](./07-legal-administrative/08_Open_Source_License_Notice.md): Open-source dependency attributions (React, Vite, Tailwind CSS, Dexie.js, Supabase, jsPDF) and commercial dual-licensing framework.
* [**compliance-matrix.md**](./07-legal-administrative/compliance-matrix.md): Multi-framework audit crosswalk mapping SOC 2 Type II, ISO/IEC 27001, HIPAA 45 CFR § 164, and CalMHSA requirements.
* [**ip-licensing.md**](./07-legal-administrative/ip-licensing.md): Software licensing inventory, patent declarations, and third-party open-source attribution tables.

---

## 08. Standalone Extraction & Direct Vercel Deployment

### Deploying to peernotebook.com on Vercel

1. **GitHub Repository Sync**:
   ```bash
   git init -b master
   git remote add origin https://github.com/[handle]/peernotebook.git
   git add .
   git commit -m "feat: Peer Notebook GA #8 complete repository hardening & documentation bundle"
   git push -u origin master
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
