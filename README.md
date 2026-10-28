# Peer Notebook (peernotebook.com)

> **Maturity Tier:** GA #8 (Production-Hardened Progressive Web Application)  
> **Target Domain:** [peernotebook.com](https://peernotebook.com)  
> **Architecture:** Offline-First PWA • Dual-Layer Persistence (Dexie.js IndexedDB + PostgreSQL Supabase RLS)  
> **Regulatory Alignment:** California SB 803 / CalMHSA / Medi-Cal CalAIM (HCPCS H0038) / HIPAA 45 CFR § 164 / California CMIA

---

## Overview
**Peer Notebook** is a specialized, trauma-informed software platform and progressive web application engineered specifically for **Certified Peer Support Specialists (CPSS-CA)**, 1099 Independent Recovery Coaches, and Community-Based Organizations (CBOs). 

Designed for low cognitive fatigue and field resilience in areas with intermittent or zero cellular connectivity (shelters, street outreach, encampments, emergency departments), Peer Notebook guarantees zero data loss via transactional client-side storage, generates audit-ready 4-part encounter notes in under 90 seconds, and automatically computes Medi-Cal H0038 15-minute billing units under California's CalAIM payment reform.

### Key Production Capabilities (GA #8)
* **Zero-Persistence Clean-Desk Security:** Starts with zero authenticated users on boot (`currentUser = null`), automatically purging tokens on load and executing instantaneous session destruction on window/tab close (`beforeunload` & `pagehide`) for shared workstations.
* **CalAIM H0038 Standardized Template Drawer:** Slide-out template drawer with 8 pre-validated non-clinical encounter presets (Housing Stabilization, Harm Reduction, Recovery Linkage, WRAP, Re-Entry, ECM, Vocational, Somatic Regulation) featuring exact 15-minute billing unit allocations.
* **Circumnavigable Flex Wizard Documentation Engine:** 5-step golden-thread stepper linking careplan milestones to peer interventions and client recovery responses, with total circumnavigation freedom (unblocked step-jumping) and instant toggle between Single-Page and Flex Wizard views.
* **4-State Stripe Billing Pipeline & Supabase Sync:** Instant simulation toggles (`active_subscriber`, `trialing`, `past_due`, `canceled`) with atomic bidirectional sync across client Dexie.js and Supabase PostgreSQL `user_profiles` table.
* **Dual-Tenant Architecture:** Seamlessly supports both multi-specialist CBO agencies and solo 1099 independent recovery coaches (`account_type = 'solo_1099'`) with dynamic Row-Level Security (RLS) isolation (`auth.uid() = specialist_id`).
* **Zero-Trust Field Privacy:** Instant one-click de-identification toggle masks client names into secure deterministic pseudonyms (`Client #A849`) for confidential documentation in public spaces.
* **Encrypted Web Crypto Export:** 256-bit AES-GCM passphrase-encrypted JSON archives and printable audit-ready clinical charts stamped with SHA-256 tamper-evident seals.
* **Plain-English Sync Telemetry:** User-facing status badges speak plain English ("Cloud Sync Active", "Notes Saved Locally") with zero raw library jargon or internal engineering tickers.
* **Zero-AI Deterministic Engine:** 100% deterministic TypeScript algorithms for strengths-based language cleansing, DHCS 8-minute rounding rules, and audit trail verification with zero generative AI hallucinations or PHI leakage.
* **Clean-Slate Data Integrity:** Pure production initialization with zero hardcoded mock arrays or fake demo patients.

---

## Master Documentation Binder (`/docs`)
The complete 27-document **Master Documentation Binder** is consolidated and maintained in the [`/docs`](./docs/README.md) directory, structured across 7 numerical categories:

| Category | Description | Key Documents |
|---|---|---|
| [**01. Project Management**](./docs/01-project-management/README.md) | Agile governance, delivery velocity, sprint cadence, and RACI matrices | [Project Charter](./docs/01-project-management/project-charter.md), [Roadmap](./docs/01-project-management/product-roadmap.md), [Sprint Cadence](./docs/01-project-management/sprint-cadence.md), [Checklist](./docs/01-project-management/checklist.md) |
| [**02. Business Strategy & Clinical Practice**](./docs/02-business-strategy/README.md) | Commercial positioning, 1099 contractor strategy, Stripe billing, and CalMHSA 17 Core Competencies | [Product Vision](./docs/02-business-strategy/product-vision-scope.md), [1099 Contractor Strategy](./docs/02-business-strategy/1099-independent-contractor-strategy.md), [Stripe Billing Architecture](./docs/02-business-strategy/stripe-billing-architecture.md), [H0038 Workflow](./docs/02-business-strategy/clinical-workflow-h0038.md), [17 Competencies](./docs/02-business-strategy/peer-core-competencies.md), [Feature Spec](./docs/02-business-strategy/mvp-feature-spec.md) |
| [**03. Design Experience & Compliance Regulatory**](./docs/03-design-experience/README.md) | Soft Slate tokens (`#F8FAFC`), 48px touch targets, WCAG 2.2 AA, and SB 803 rules | [Design System](./docs/03-design-experience/design-system.md), [Personas](./docs/03-design-experience/user-personas.md), [Accessibility](./docs/03-design-experience/accessibility-standards.md), [CalMHSA Guide](./docs/03-compliance-regulatory/calmhsa-compliance-guide.md) |
| [**04. Technical Architecture**](./docs/04-technical-architecture/README.md) | Offline-first PWA, Dexie.js, PostgreSQL dual-tenant RLS, WebCrypto SHA-256 seals, and PDF export | [Architecture White Paper](./docs/04-technical-architecture/GA8_Production_Grade_Architecture_White_Paper.md), [System Architecture](./docs/04-technical-architecture/system-architecture.md), [Data Models & Dual-Tenant RLS](./docs/04-technical-architecture/data-models.md), [Offline Sync](./docs/04-technical-architecture/07_Offline_Sync_IndexedDB.md) |
| [**05. Engineering Quality & Security Privacy**](./docs/05-engineering-quality/README.md) | Automated testing pyramid, CI/CD pipelines, HIPAA § 164.312, and QA checklists | [Testing Strategy](./docs/05-engineering-quality/testing-strategy.md), [CI/CD Pipeline](./docs/05-engineering-quality/ci-cd-pipeline.md), [Code Review](./docs/05-engineering-quality/code-review-standards.md), [HIPAA Security](./docs/05-security-privacy/hipaa-security-rule.md) |
| [**06. Operations Deployment & Billing Operations**](./docs/06-operations-deployment/README.md) | Vercel Edge configuration, SRE telemetry golden signals, and Medi-Cal claims batching | [Infrastructure Runbook](./docs/06-operations-deployment/infrastructure-runbook.md), [Monitoring & SLOs](./docs/06-operations-deployment/monitoring-alerting.md), [Incident Response](./docs/06-operations-deployment/incident-response.md), [H0038 Operations](./docs/06-operations-billing/h0038-billing-operations.md) |
| [**07. Legal & Administrative**](./docs/07-legal-administrative/README.md) | HIPAA Notice of Privacy Practices, Terms of Service, IP Assignment, BAA Framework, and Open Source Attribution | [Terms of Service](./docs/07-legal-administrative/01_Terms_of_Service.md), [IP Assignment](./docs/07-legal-administrative/06_IP_Assignment_Agreement.md), [BAA Framework](./docs/07-legal-administrative/07_Business_Associate_Agreement_BAA_Framework.md), [Open Source Notice](./docs/07-legal-administrative/08_Open_Source_License_Notice.md), [Compliance Matrix](./docs/07-legal-administrative/compliance-matrix.md) |

👉 **Read the full documentation:** [`/docs/README.md`](./docs/README.md)

---

## Technical Stack & Design System
* **Frontend Framework:** React 18 SPA with TypeScript (Strict Mode)
* **Build System:** Vite 6 with zero-downtime static bundle outputs
* **Styling & Ergonomics:** Tailwind CSS with trauma-informed clinical color tokens:
  * Soft Slate (`#F8FAFC` - Low-Arousal Surface Background)
  * Deep Navy (`#1E3A8A` - High-Contrast Headings & Navigation)
  * Muted Teal (`#0F766E` - Grounding Primary Actions)
  * Forest Green (`#16A34A` - Sync & Audit Success)
  * Warm Amber (`#D97706` - Offline-Queued / Caution State)
  * Touch Targets: Minimum 44px–48px hitboxes across all mobile viewports
* **Local Persistence Engine:** Dexie.js v4 (IndexedDB) with WebCrypto AES-GCM and SHA-256 tamper seals
* **Cloud Relational Store:** PostgreSQL 15 on Supabase with dual-tenant isolated Row-Level Security (RLS)
* **Hosting & Routing:** Vercel Global Edge Network with custom domain binding to `peernotebook.com`

---

## Quick Start & Local Development

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Start local development server (port 3000)
npm run dev

# 3. Type-check and production build
npm run build
```

---

## Deployment to peernotebook.com on Vercel

```bash
# Initialize git and push to GitHub
git init -b master
git remote add origin https://github.com/[handle]/peernotebook.git
git add .
git commit -m "feat: Peer Notebook GA #8 complete repository hardening & documentation bundle"
git push -u origin master
```

In the Vercel Dashboard:
* Import the repository.
* Framework Preset: **Vite**.
* Build Command: `tsc && vite build`.
* Output Directory: `dist`.
* Install Command: `npm install --legacy-peer-deps`.
* Domain: Bind `peernotebook.com` and `www.peernotebook.com`.

---

## Pre-Launch Governance & Corporate Milestones
In full alignment with pre-launch transparency and optimum primer standards:
* **Peer Notebook LLC Formation:** State filing of Articles of Organization and procurement of the Employer Identification Number (EIN) are formally designated as **Pending Pre-Launch Milestones**.
* **Founder-to-LLC IP Assignment:** Formal execution of the Founder-to-LLC Intellectual Property Assignment Agreement will be consummated upon LLC charter finalization.
* **Pre-Launch Ownership:** Prior to formation closure, all intellectual property, source code, and trademarks remain protected and managed in trust for Peer Notebook LLC.

---

## License
Copyright © 2026 Optimum Primers & Peer Notebook Contributors. All Rights Reserved.
Open specification components published under the Apache License 2.0.
