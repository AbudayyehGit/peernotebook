# Peer Notebook Documentation

> **Status:** Production-Ready Active Standard  
> **Target Domain:** optimumprimers.com  
> **Folder Path:** `peernotebook/docs/`  
> **Resource Hub Taxonomic Link:** [`[Peer Notebook Documentation](/peernotebook/docs/README.md)`](/peernotebook/docs/README.md)  
> **Maintainer:** Optimum Primers Systems Architecture & Technical Documentation Team  
> **Framework:** ISO 9001:2015 Clause 7.5 (Documented Information) & Grade Craftsmanship Standards

---

## Executive Overview
**Peer Notebook** is a specialized, trauma-informed software platform and tool suite delivered via web and mobile applications. It is engineered specifically for Certified Peer Support Specialists (CPSS), Peer Recovery Coaches, and community health workers. The platform streamlines day-to-day workflow tracking, session documentation, and resource navigation while establishing rigorous data privacy, county compliance, and administrative standards.

This centralized **Peer Notebook Documentation Hub** provides the deterministic blueprint for system architecture, regulatory compliance (California Senate Bill 803 / CalMHSA and LACDMH), Medi-Cal CalAIM billing readiness (HCPCS H0038), human-centered UX design, engineering quality, and operational reliability. Organized according to the Optimum Primers standardized numerical taxonomy (`01` through `07`), this repository minimizes cognitive fatigue, enforces clear separation of concerns, and ensures all specifications remain audit-ready.

---

## Directory Architecture & Master Table of Contents

```
peernotebook/docs/
├── README.md                          # Master Index & Taxonomic Manifest
├── 01-project-management/             # Charters, roadmaps, sprint schedules, and governance
│   ├── README.md                      # Section Overview & Governance Guide
│   ├── project-charter.md             # Mission, scope, constraints, and success metrics
│   ├── product-roadmap.md             # Multi-phase milestones and release targets
│   ├── sprint-cadence.md              # Bi-weekly rituals, estimation scales, and velocity tracking
│   └── stakeholder-matrix.md          # RACI chart and communication protocols
├── 02-business-strategy/              # Unit economics, market positioning, and value drivers
│   ├── README.md                      # Section Overview & Commercial Thesis
│   ├── product-vision-scope.md        # Approved 1.0-GA Product Vision, MVP Scope & Personas
│   ├── market-analysis.md             # TAM/SAM/SOM, market drivers, and competitive landscape
│   ├── monetization-model.md          # Pricing tiers, SaaS margins, and revenue mechanics
│   ├── competitive-matrix.md          # Feature-by-feature differentiation and moat analysis
│   └── value-proposition.md           # Core customer pains, gains, and UVP statements
├── 03-design-experience/              # Design system, personas, UX journeys, and accessibility
│   ├── README.md                      # Section Overview & Design Constitution
│   ├── design-system.md               # Typography scales, color tokens, and atomic components
│   ├── user-personas.md               # User archetypes, behavioral drivers, and friction points
│   ├── information-architecture.md    # Site map, taxonomy hierarchies, and navigation trees
│   └── accessibility-standards.md     # WCAG 2.2 AA checklists and keyboard navigation specs
├── 04-technical-architecture/         # System topology, data schemas, API contracts, and security
│   ├── README.md                      # Section Overview & Architectural Philosophy
│   ├── system-architecture.md         # Component topology, microservices, and event flows
│   ├── data-models.md                 # Entity relationship diagrams and Firestore/SQL schemas
│   ├── api-specifications.md          # REST/RPC endpoints, payload schemas, and error codes
│   └── security-threat-model.md       # STRIDE evaluation, authentication, and encryption at rest
├── 05-engineering-quality/            # CI/CD, testing methodology, code review, and QA standards
│   ├── README.md                      # Section Overview & QA Benchmarks
│   ├── testing-strategy.md            # Unit, integration, E2E testing ratios, and coverage bars
│   ├── ci-cd-pipeline.md              # GitHub Actions workflows, build gates, and automated deploys
│   ├── code-review-standards.md       # PR guidelines, linter configurations, and review rubrics
│   └── qa-checklists.md               # Pre-release verification matrices and regression suites
├── 06-operations-deployment/          # Infrastructure, telemetry, incident runbooks, and recovery
│   ├── README.md                      # Section Overview & Reliability Engineering
│   ├── infrastructure-runbook.md      # Cloud resource definitions, VPC layout, and scaling rules
│   ├── monitoring-alerting.md         # SLIs, SLOs, Prometheus/Datadog metrics, and alert thresholds
│   ├── incident-response.md           # Severity definitions, paging escalations, and post-mortems
│   └── disaster-recovery.md           # RTO/RPO targets, automated failover, and backup verification
└── 07-legal-administrative/           # Compliance, privacy, licensing, and commercial agreements
    ├── README.md                      # Section Overview & Regulatory Framework
    ├── privacy-policy-spec.md         # GDPR/CCPA data handling disclosures and user rights
    ├── terms-of-service.md            # Acceptable use policies, warranty disclaimers, and liabilities
    ├── compliance-matrix.md           # SOC 2 Type II, ISO 27001, and HIPAA compliance mapping
    └── ip-licensing.md                # Open-source dependencies, copyright notices, and patent clauses
```

---

## 01. Project Management
*Governance, delivery velocity, milestone planning, and team synchronization.*

* [**01-project-management/README.md**](./01-project-management/README.md): Governance charter and CPSS project delivery standards.
* [**project-charter.md**](./01-project-management/project-charter.md): Approved 1.1-GA Project Charter & Initiation Document (PID) establishing trauma-informed CPSS platform mission, LACDMH/CalMHSA alignment, Medi-Cal HCPCS architecture, scope boundaries, and KPIs.
* [**product-roadmap.md**](./01-project-management/product-roadmap.md): Three-horizon milestone schedule covering Horizon 1 (1.1-GA CPSS MVP & Field Logging), Horizon 2 (CalAIM & LACDMH County Bridge), and Horizon 3 (Enterprise EHR Interoperability).
* [**sprint-cadence.md**](./01-project-management/sprint-cadence.md): Standardized 14-day sprint cycle, Fibonacci story-point estimation rules, and standup/retro agendas.
* [**stakeholder-matrix.md**](./01-project-management/stakeholder-matrix.md): Formal RACI matrix outlining decision rights across executive, engineering, design, and operations leads.

---

## 02. Business Strategy
*Commercial positioning, unit economic viability, monetization mechanics, and market moats.*

* [**02-business-strategy/README.md**](./02-business-strategy/README.md): Commercial strategy and economic foundation overview.
* [**product-vision-scope.md**](./02-business-strategy/product-vision-scope.md): Approved 1.0-GA Product Vision & Scope: trauma-informed mission, non-clinical ethos, MVP in-scope/out-of-scope boundaries, and CPSS personas.
* [**mvp-feature-spec.md**](./02-business-strategy/mvp-feature-spec.md): Approved 1.0-GA MVP Feature Specification: five core modules (MOD-01 to MOD-05), functional specs, and LACDMH/CalMHSA billing alignment.
* [**value-proposition.md**](./02-business-strategy/value-proposition.md): Value proposition canvas detailing customer friction points, cognitive relief vectors, and measurable administrative ROI.
* [**market-analysis.md**](./02-business-strategy/market-analysis.md): Quantitative behavioral health market analysis, CalAIM ECM catalysts, and macro industry tailwinds.
* [**monetization-model.md**](./02-business-strategy/monetization-model.md): Multi-tier subscription economics for solo specialists, community health centers, and county behavioral health agencies.
* [**competitive-matrix.md**](./02-business-strategy/competitive-matrix.md): Structural comparison against legacy medical EHRs and generic note-taking tools.

---

## 03. Design & Experience
*Human-centered interface standards, responsive design tokens, and cognitive accessibility.*

* [**03-design-experience/README.md**](./03-design-experience/README.md): Design constitution and human-centered design principles.
* [**ui-ux-wireframes-flows.md**](./03-design-experience/ui-ux-wireframes-flows.md): Approved 1.2-GA UI/UX Wireframes & Interaction Flows: single-screen note capture, progressive disclosure, and touch target standards.
* [**design-system.md**](./03-design-experience/design-system.md): Mathematical typography scales, semantic color variables, elevation levels, and atomic component anatomy.
* [**user-personas.md**](./03-design-experience/user-personas.md): Empirical user archetypes (Peer Specialist, Peer Recovery Coach, Supervisor) with behavioral maps.
* [**information-architecture.md**](./03-design-experience/information-architecture.md): Hierarchical navigation graphs, page state flows, and breadcrumb routing taxonomies.
* [**accessibility-standards.md**](./03-design-experience/accessibility-standards.md): WCAG 2.2 Level AA conformance audit, ARIA landmark guidelines, and keyboard trap prevention.

---

## 04. Technical Architecture
*Distributed systems design, resilient state machines, schema contracts, and defensive security.*

* [**04-technical-architecture/README.md**](./04-technical-architecture/README.md): Architectural philosophy and zero-trust engineering principles.
* [**01_System_Architecture_Data_Flow.md**](./04-technical-architecture/01_System_Architecture_Data_Flow.md): Approved 1.0-GA System Architecture & Data Flow: local-first IndexedDB, TLS 1.3 gateway, and 7-step note persistence lifecycle.
* [**02_Database_ERD_Data_Dictionary.md**](./04-technical-architecture/02_Database_ERD_Data_Dictionary.md): Approved 1.0-GA Database ERD & Data Dictionary: PostgreSQL DDL, multi-tenant RLS policies, and Medi-Cal H0038 / POS 15 compliance.
* [**03_UI_Component_Architecture.md**](./04-technical-architecture/03_UI_Component_Architecture.md): Approved 1.0-GA UI Component Architecture: React form state, Dexie/IndexedDB auto-save, and progressive disclosure intervention pills.
* [**04_Backend_API_Integration.md**](./04-technical-architecture/04_Backend_API_Integration.md): Approved 1.0-GA Backend API Integration: Supabase JWT auth claims, multi-tenant Express middleware, and notes locking audit endpoints.
* [**05_Compliance_Engine_PDF_Export.md**](./04-technical-architecture/05_Compliance_Engine_PDF_Export.md): Approved 1.0-GA Compliance Engine & PDF Export: immutable audit trails, SHA-256 tamper-evident hashing, and jsPDF client-side generation.
* [**06_Security_Load_Testing_Domain.md**](./04-technical-architecture/06_Security_Load_Testing_Domain.md): Approved 1.0-GA Security Hardening, Load Testing & Domain Configuration: TLS 1.3, CSP, k6 500-user concurrency benchmarks, and Vercel/Supabase topology.
* [**07_Offline_Sync_IndexedDB.md**](./04-technical-architecture/07_Offline_Sync_IndexedDB.md): Approved 1.0-GA Offline Synchronization & IndexedDB: Dexie.js local-first schemas, background sync worker queues, and Last-Write-Wins conflict resolution.
* [**07_Disaster_Recovery_IndexedDB.md**](./04-technical-architecture/07_Disaster_Recovery_IndexedDB.md): Approved 1.0-GA Disaster Recovery & Storage Quota Management: `storage.persist()`, quota warning thresholds, IndexedDB integrity probes, and OPFS snapshot recovery.
* [**08_Agency_Dashboard_RBAC.md**](./04-technical-architecture/08_Agency_Dashboard_RBAC.md): Approved 1.0-GA Agency Dashboard & RBAC: Multi-tenant role permissions, supervisor review queue components, and agency-isolated RLS.
* [**08_HIPAA_BAA_Consent_Model.md**](./04-technical-architecture/08_HIPAA_BAA_Consent_Model.md): Approved 1.0-GA HIPAA BAA Compliance & Digital Consent: Supabase/Vercel BAA checklist, digital signature vector capture, and SHA-256 consent binding.
* [**09_Beta_Testing_Field_Trials.md**](./04-technical-architecture/09_Beta_Testing_Field_Trials.md): Approved 1.0-GA Beta Testing & Field Trials: Week 8 field trials, 14-day telemetry KPIs, and BetaFeedbackWidget feedback loops.
* [**10_Production_Deployment_Polish.md**](./04-technical-architecture/10_Production_Deployment_Polish.md): Approved 1.0-GA Production Deployment & Polish: Code splitting, Lighthouse 95+ SLAs, GitHub Actions CI/CD, and pre-flight checklists.
* [**12_Offline_Token_Auth_Handling.md**](./04-technical-architecture/12_Offline_Token_Auth_Handling.md): Approved 1.0-GA Offline Token Auth Handling: Expired JWT resilience in POS 15, WebCrypto ECDSA queue signing, and pre-reconnection auth gate.
* [**13_Migration_Rollback_Protocol.md**](./04-technical-architecture/13_Migration_Rollback_Protocol.md): Approved 1.0-GA Database Migration & Rollback Protocol: Zero-downtime expand/contract patterns, stale offline schema adapters, and paired up/down SQL runbooks.
* [**system-architecture.md**](./04-technical-architecture/system-architecture.md): High-level system topology diagram, client-server sync protocols, and edge compute caching layers.
* [**data-models.md**](./04-technical-architecture/data-models.md): Strongly typed schema definitions, CalMHSA core competencies, and transactional boundary models.
* [**api-specifications.md**](./04-technical-architecture/api-specifications.md): OpenAPI 3.1 specification, idempotency key requirements, and rate-limiting schemas.
* [**security-threat-model.md**](./04-technical-architecture/security-threat-model.md): Comprehensive STRIDE threat assessment, token validation pipelines, and KMS data-at-rest encryption.

---

## 05. Engineering & Quality
*Verification gates, deterministic test harnesses, continuous delivery, and code craftsman rubrics.*

* [**05-engineering-quality/README.md**](./05-engineering-quality/README.md): Engineering quality charter and verification philosophy.
* [**testing-strategy.md**](./05-engineering-quality/testing-strategy.md): Test pyramid allocation (70% unit, 20% integration, 10% E2E) with strict flake mitigation routines.
* [**ci-cd-pipeline.md**](./05-engineering-quality/ci-cd-pipeline.md): Declarative workflow manifests, staging smoke-test suites, and zero-downtime blue/green deployment triggers.
* [**code-review-standards.md**](./05-engineering-quality/code-review-standards.md): Mandatory 2-reviewer consensus rules, automated lint barriers, and architectural change protocols.
* [**qa-checklists.md**](./05-engineering-quality/qa-checklists.md): Pre-flight deployment checklists, cross-browser test grids, and performance regression benchmarks.

---

## 06. Operations & Deployment
*Site reliability engineering, observability telemetry, incident mitigation, and operational continuity.*

* [**06-operations-deployment/README.md**](./06-operations-deployment/README.md): SRE practices and continuous operational uptime standards.
* [**infrastructure-runbook.md**](./06-operations-deployment/infrastructure-runbook.md): Infrastructure-as-code deployment procedures, load balancer configuration, and autoscaling thresholds.
* [**monitoring-alerting.md**](./06-operations-deployment/monitoring-alerting.md): Golden signal telemetry tracking (Latency, Traffic, Errors, Saturation) with PagerDuty escalation routes.
* [**incident-response.md**](./06-operations-deployment/incident-response.md): P0–P3 incident classifications, commander roles, war-room runbooks, and blameless post-mortem templates.
* [**disaster-recovery.md**](./06-operations-deployment/disaster-recovery.md): RTO (< 15 min) and RPO (< 1 min) failover scenarios, regional data replication, and restore drill schedules.

---

## 07. Legal & Administrative
*Regulatory compliance, intellectual property protection, terms of service, and privacy safeguards.*

* [**07-legal-administrative/README.md**](./07-legal-administrative/README.md): Legal governance and compliance overview.
* [**privacy-policy-spec.md**](./07-legal-administrative/privacy-policy-spec.md): Data retention periods, telemetry consent mechanisms, and third-party data processor disclosures.
* [**terms-of-service.md**](./07-legal-administrative/terms-of-service.md): Standard enterprise SaaS agreements, SLA performance commitments, and liability limitation clauses.
* [**compliance-matrix.md**](./07-legal-administrative/compliance-matrix.md): Security control mapping against SOC 2 Type II criteria, ISO/IEC 27001, and HIPAA compliance requirements.
* [**ip-licensing.md**](./07-legal-administrative/ip-licensing.md): Software licensing inventory, patent declarations, and third-party open-source attribution tables.

---

## Quality Checkpoints & Document Revision Standard
In compliance with **Optimum Primers Grade Craftsmanship**:
1. **Single Source of Truth**: Every architectural decision must be logged in its respective `.md` artifact prior to implementation pull requests.
2. **Review Cadence**: All documents must undergo quarterly audits by the respective area leads identified in the Stakeholder Matrix.
3. **Change Control**: Document revisions require semantic version incrementation and timestamped entries in the revision history block of each document.
