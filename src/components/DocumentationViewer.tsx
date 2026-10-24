/**
 * Peer Notebook - Master Documentation Hub & Interactive Viewer
 * Route: /docs and #docs/*
 * GA #8 Standard • CalAIM, Medi-Cal H0038, CalMHSA & HIPAA Aligned
 * Tokens: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 * Responsive 48px touch-first geometry • Trauma-Informed Clinical Design
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Folder,
  FileText,
  Search,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Download,
  ArrowLeft,
  ShieldCheck,
  Scale,
  Award,
  Lock,
  Database,
  Code2,
  Server,
  Layers,
  HeartHandshake,
  Mail,
  Eye,
  Table as TableIcon
} from 'lucide-react';

export interface DocItem {
  id: string;
  categoryNumber: string;
  categoryTitle: string;
  title: string;
  slug: string;
  path: string;
  badge?: string;
  badgeColor?: string;
  summary: string;
  content: string;
}

export const MASTER_DOCUMENTS: DocItem[] = [
  // 01-project-management
  {
    id: '01-readme',
    categoryNumber: '01',
    categoryTitle: 'Project Management',
    title: 'Governance & Project Standards Overview',
    slug: '01-project-management/README',
    path: '/docs/01-project-management/README.md',
    badge: 'ISO 9001:2015',
    badgeColor: 'bg-blue-100 text-blue-800',
    summary: 'Governance charter, CPSS project delivery standards, and agile operational principles.',
    content: `# 01. Project Management Overview

**Status:** Production Active Standard  
**Framework:** ISO 9001:2015 Clause 7.5 & CalAIM Behavioral Health Governance

---

## Executive Summary
The **Project Management** documentation suite governs the software development lifecycle, milestone schedules, cross-functional delivery rituals, and stakeholder communication for **Peer Notebook** (peernotebook.com). Designed specifically for Certified Peer Support Specialists (CPSS), the project balances rapid agile iterations with clinical, county, and Medi-Cal regulatory compliance constraints.

### Core Delivery Principles
1. **Trauma-Informed Engineering:** We prioritize low cognitive fatigue and field stability over feature bloat.
2. **Offline-First Zero Data Loss:** Field specialists working in low-connectivity areas (shelters, rural routes, hospitals) must never lose note data.
3. **Audit-Ready Traceability:** All clinical documentation decisions must trace directly to CalMHSA core competencies and Medi-Cal billing rules.`
  },
  {
    id: '01-charter',
    categoryNumber: '01',
    categoryTitle: 'Project Management',
    title: 'Project Charter & Initiation Document (PID)',
    slug: '01-project-management/project-charter',
    path: '/docs/01-project-management/project-charter.md',
    badge: 'Approved 1.1-GA',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'Approved 1.1-GA Project Charter establishing trauma-informed mission, scope boundaries, and KPIs.',
    content: `# Peer Notebook Project Charter & Initiation Document (PID)

**Document Version:** 1.1-GA (Production Release)  
**Target Domain:** peernotebook.com  
**Regulatory Framework:** California SB 803 / CalMHSA / Medi-Cal CalAIM (HCPCS H0038)

---

## 1. Project Mission & Problem Statement
Certified Peer Support Specialists (CPSS) are healthcare workers with lived experience in mental health, substance use recovery, or community trauma who deliver crucial non-clinical navigation, de-escalation, and goal-directed mentoring.

Legacy Electronic Health Records (EHR) fail peer specialists in three ways:
1. **Connectivity Failure in the Field:** County mobile outreach often takes place in basements, encampments, and rural zones where traditional cloud EHRs freeze and wipe unsaved text.
2. **Clinical Language Mismatch:** Traditional EHRs enforce DSM-5 diagnostic codes and clinical psychopathology terms that directly contradict non-clinical peer support recovery philosophy.
3. **CalAIM Billing Inefficiencies:** California's CalAIM payment reform requires strict 15-minute billing unit conversions (CMS 8-minute rule) and separation of direct contact, travel, and documentation time.

**Peer Notebook** is purpose-built to solve these challenges: providing an offline-first, dual-persistence Progressive Web Application (PWA) that records trauma-informed encounter notes in under 90 seconds while automatically calculating Medi-Cal H0038 billing units.`
  },
  {
    id: '01-roadmap',
    categoryNumber: '01',
    categoryTitle: 'Project Management',
    title: 'Product Roadmap: Three Horizons of Delivery',
    slug: '01-project-management/product-roadmap',
    path: '/docs/01-project-management/product-roadmap.md',
    badge: 'CalAIM Roadmap',
    badgeColor: 'bg-teal-100 text-teal-800',
    summary: 'Three-horizon release schedule spanning MVP field logging, county bridge, and HL7 FHIR interoperability.',
    content: `# Peer Notebook Product Roadmap: Three Horizons of Delivery

**Document Version:** 1.1-GA  
**Target Domain:** peernotebook.com

---

## Horizon 1: Core PWA & Field Logging Engine (GA #8 Release — Current)
* Local-First IndexedDB Persistence: Zero-latency client note logging via Dexie.js.
* CalAIM H0038 Calculator: 3-way time capture (Direct, Travel, Doc) with automated 15-minute billing unit calculation.
* Trauma-Informed Design System: Strict light mode Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), and Muted Teal (#0F766E) with 48px touch targets.
* Cryptographic PDF Note Export: Client-side tamper-evident PDF generation with SHA-256 hash stamp.

## Horizon 2: County Health & Multi-Tenant Agency Bridge (Q3-Q4)
* Supervisor Review Queues and Specialist Cosigning.
* Medi-Cal 837P EDI electronic billing batch export for California county behavioral health clearinghouses.
* Automated County Audit Readiness: 1-click compliance binders with CalMHSA core competency tags.

## Horizon 3: Enterprise EHR Interoperability (Year 2)
* HL7 FHIR R4 Integration: Bi-directional sync with Epic, Cerner Millennium, and Netsmart myAvatar.
* SMART-on-FHIR Peer Launchpad: Launch Peer Notebook within hospital emergency department triage dashboards.`
  },
  {
    id: '01-sprint',
    categoryNumber: '01',
    categoryTitle: 'Project Management',
    title: 'Sprint Cadence & Agile Engineering Rituals',
    slug: '01-project-management/sprint-cadence',
    path: '/docs/01-project-management/sprint-cadence.md',
    badge: '14-Day Cadence',
    badgeColor: 'bg-blue-100 text-blue-800',
    summary: 'Bi-weekly sprint structure, modified Fibonacci story point scale, and Definition of Done.',
    content: `# Sprint Cadence & Agile Engineering Rituals

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Engineering Methodology:** Trauma-Informed Agile (14-Day Sprints)

---

## Definition of Done (DoD)
A user story or feature branch cannot be merged into \`master\` until:
1. \`tsc --noEmit\` and \`vite build\` complete with zero errors and zero warnings.
2. All interactive touch targets measure >= 44px (field tablet accessibility standard).
3. Local-first Dexie.js offline persistence verified by simulating \`navigator.onLine = false\`.
4. No clinical terminology violations (must maintain trauma-informed, non-clinical language).
5. Code passes TypeScript strict mode checks with zero \`any\` type escapes.`
  },
  {
    id: '01-stakeholders',
    categoryNumber: '01',
    categoryTitle: 'Project Management',
    title: 'Stakeholder Matrix & Governance (RACI)',
    slug: '01-project-management/stakeholder-matrix',
    path: '/docs/01-project-management/stakeholder-matrix.md',
    badge: 'RACI Governance',
    badgeColor: 'bg-purple-100 text-purple-800',
    summary: 'Formal RACI decision rights across engineering, clinical specialists, county compliance, and directors.',
    content: `# Stakeholder Matrix & Governance Protocols (RACI)

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com

---

## Escalation & Communication Protocols
* **P0 Production Blockers (Field Data Loss / Auth Lockout):** Direct alert to Principal Architect and Lead Frontend Engineer; response SLA < 15 minutes.
* **Compliance Changes (DHCS CalAIM Guidance Updates):** Consulted directly with Clinical CPSS Expert and County Compliance Officer within 48 hours.
* **Routine Feature Requests:** Logged to GitHub Issues, reviewed during bi-weekly Sprint Planning.`
  },

  // 02-business-strategy & clinical practice
  {
    id: '02-vision',
    categoryNumber: '02',
    categoryTitle: 'Business Strategy & Clinical Practice',
    title: 'Product Vision & Non-Clinical Peer Ethos',
    slug: '02-business-strategy/product-vision-scope',
    path: '/docs/02-business-strategy/product-vision-scope.md',
    badge: 'Trauma-Informed',
    badgeColor: 'bg-teal-100 text-teal-800',
    summary: 'Trauma-informed mission, non-clinical lived experience ethos, and scope boundaries.',
    content: `# Product Vision & Scope: Non-Clinical Peer Recovery Ethos

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Ethos:** Non-Clinical, Strengths-Based, Trauma-Informed Lived Experience

---

## 1. Product Vision Statement
To empower Certified Peer Support Specialists and Peer Recovery Coaches with a specialized, field-resilient tool that reduces note-logging anxiety from hours to minutes, safeguards audit compliance under California CalAIM, and honors the human dignity of peers through strengths-based, non-clinical language.

## 2. Core Pillars of Non-Clinical Peer Practice
1. **Mutuality & Lived Experience:** Peers share personal recovery journeys strategically to inspire hope, foster psychological safety, and reduce isolation.
2. **Strengths-Based Language:** Documentation focuses on client assets, self-advocacy, personal agency, and natural community supports rather than deficits.
3. **Trauma-Informed Design:** Low arousal, soft slate (#F8FAFC), zero pop-up alarm fatigue.
4. **Non-Judgmental Harm Reduction:** Meeting peers wherever they are in their recovery journey without punitive documentation requirements.`
  },
  {
    id: '02-workflow-h0038',
    categoryNumber: '02',
    categoryTitle: 'Business Strategy & Clinical Practice',
    title: 'Medi-Cal H0038 Field Documentation Guidelines',
    slug: '02-business-strategy/clinical-workflow-h0038',
    path: '/docs/02-business-strategy/clinical-workflow-h0038.md',
    badge: 'CalAIM H0038',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'Medi-Cal H0038 encounter standards, 4-part note anatomy, and CMS 8-minute rounding rules.',
    content: `# Clinical Workflow & Medi-Cal H0038 Encounter Documentation

**Document Version:** 1.0-GA  
**Billing Code:** HCPCS H0038 (Self-Help / Peer Support Services)  
**Standard:** California DHCS CalAIM Payment Reform & CMS 8-Minute Rule

---

## 1. Medi-Cal H0038 Overview
Procedure code **H0038** reimburses non-clinical peer support services provided by Certified Peer Support Specialists (CPSS). In California, under CalAIM, H0038 is billed in **15-minute increments** adhering strictly to the CMS 8-Minute Rule:
* Less than 8 minutes: 0 units (Non-billable)
* 8 – 22 minutes: 1 unit
* 23 – 37 minutes: 2 units
* 38 – 52 minutes: 3 units
* 53 – 67 minutes: 4 units
* 68 – 82 minutes: 5 units

## 2. The Standard 4-Part Peer Note Anatomy
1. **Recovery Plan Goal Addressed:** Specific client-chosen wellness recovery goal.
2. **Peer Support Intervention Provided:** Concrete CalMHSA peer support actions.
3. **Peer Engagement & Client Response:** Documenting emotional affect with mandatory verbatim client quote.
4. **Next Steps & Plan for Next Contact:** Concrete continuity date, location, and action item.`
  },
  {
    id: '02-competencies',
    categoryNumber: '02',
    categoryTitle: 'Business Strategy & Clinical Practice',
    title: 'CalMHSA 17 Core Peer Competencies Crosswalk',
    slug: '02-business-strategy/peer-core-competencies',
    path: '/docs/02-business-strategy/peer-core-competencies.md',
    badge: 'CalMHSA Certified',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'Crosswalk mapping all 17 CalMHSA Core Competencies directly to interactive intervention tags.',
    content: `# CalMHSA 17 Core Peer Competencies & Non-Clinical Practice Crosswalk

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Certifying Authority:** California Mental Health Services Authority (CalMHSA)  
**Legislation:** California Senate Bill 803

---

## Key Core Competency Mappings
* **CC-01 Role of Peer Specialist:** Role Modeling & Lived Experience
* **CC-02 Recovery Practices:** Recovery Goal Setting
* **CC-03 Trauma-Informed Approaches:** Safety & Grounding Support
* **CC-08 Multi-System Navigation:** Resource & Benefits Navigation
* **CC-11 Harm Reduction:** Overdose Prevention & Safety Planning
* **CC-12 Crisis Intervention:** De-escalation & Grounding Support
* **CC-15 Documentation:** CalAIM Compliant Note Logging`
  },
  {
    id: '02-mvp-spec',
    categoryNumber: '02',
    categoryTitle: 'Business Strategy & Clinical Practice',
    title: 'MVP Feature Specification (MOD-01 to MOD-05)',
    slug: '02-business-strategy/mvp-feature-spec',
    path: '/docs/02-business-strategy/mvp-feature-spec.md',
    badge: 'Feature Spec',
    badgeColor: 'bg-blue-100 text-blue-800',
    summary: 'Detailed architecture for encounter capture, 3-way time tracking, sync worker, roster, and PDF export.',
    content: `# MVP Feature Specification (MOD-01 through MOD-05)

**Document Version:** 1.0-GA  
**Standard:** CalAIM & Medi-Cal H0038 Alignment

---

* **MOD-01:** Encounters & 4-Part Note Logging Engine
* **MOD-02:** CalAIM H0038 3-Way Time Tracker (Direct, Travel, Documentation)
* **MOD-03:** Dual-Layer Persistence & Offline Synchronization
* **MOD-04:** Client Roster & Profile Management
* **MOD-05:** PDF Note Export & Tamper-Evident SHA-256 Audit Trails`
  },
  {
    id: '02-value-prop',
    categoryNumber: '02',
    categoryTitle: 'Business Strategy & Clinical Practice',
    title: 'Value Proposition & Agency Administrative ROI',
    slug: '02-business-strategy/value-proposition',
    path: '/docs/02-business-strategy/value-proposition.md',
    badge: 'ROI Analysis',
    badgeColor: 'bg-amber-100 text-amber-800',
    summary: 'Detailed customer friction points, cognitive relief vectors, and measurable agency administrative ROI.',
    content: `# Value Proposition Canvas & ROI Metrics

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com

---

## Agency Financial & Operational ROI
For a Community Behavioral Health Non-Profit employing 10 Certified Peer Support Specialists:
* **Weekly Admin Hours Saved:** 8.5 hours saved per specialist per week.
* **Additional Billable Encounters:** +4 encounters per week (+ $3,200 monthly Medi-Cal revenue).
* **H0038 Claim Denial Rate:** Reduced from 14.8% industry average to < 1.2%.`
  },
  {
    id: '02-investor-pitch',
    categoryNumber: '02',
    categoryTitle: 'Business Strategy & Clinical Practice',
    title: 'Strategic Valuation, Unit Economics & 5-Year M&A Exit Thesis',
    slug: '02-business-strategy/investor-financial-pitch',
    path: '/docs/02-business-strategy/investor-financial-pitch.md',
    badge: '$2.5M-$4.0M Exit',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'Turnkey $35k MVP replacement value, $40k Year 1 baseline ARR, $2.5M-$4.0M M&A exit, and $20M decadal economic ecosystem.',
    content: `# Investor Financial Pitch & Enterprise Valuation White Paper

**Document Identifier:** DOC-BIZ-010  
**Title:** Strategic Valuation, Unit Economics & 5-Year M&A Exit Thesis  
**Maturity Tier:** GA #8 Live Production Standard  
**Target Domain:** peernotebook.com  
**Applicability:** Angel/Seed Capital Raise, Strategic Acquirers (EHR Providers), California CBO Pilots  

---

## 1. Executive Summary & Investment Thesis
Peer Notebook is the pioneer offline-first Progressive Web Application (PWA) purpose-built for California's CalAIM behavioral health payment reform and Medi-Cal H0038 Peer Support Services.

Legacy Electronic Health Record (EHR) platforms—including Epic, Cerner, Netsmart, and PointClickCare—were designed for licensed clinical psychotherapists and psychiatric inpatient billing. When applied to Certified Peer Support Specialists (CPSS-CA), these legacy tools suffer from an 80%+ documentation rejection rate, frequent audit clawbacks due to clinical jargon contamination, and complete failure in community-based field outreach where cellular connectivity is nonexistent.

Peer Notebook resolves this systemic crisis through a dual-layer persistence architecture (client-side encrypted IndexedDB/Dexie.js synchronized seamlessly with PostgreSQL/Supabase), deterministic CalAIM 4-part structure parsing, non-clinical strengths-based language sanitization, and immutable SHA-256 cryptographic audit logging.

## 2. Four-Pillar Valuation Architecture
* **Pillar 1: Turnkey MVP Asset Valuation ($35,000 Baseline):** COCOMO II replacement cost covering offline synchronizer ($20,000), CalAIM H0038 parser ($7,500), and 27-document master compliance suite ($7,500).
* **Pillar 2: Year 1 ARR Baseline ($40,000 ARR):** Initial pilot deployment of 5 CBOs with 75 peer support specialists at $29/seat/mo ($26,100) plus agency platform subscriptions ($14,000) delivering $40,100 ARR.
* **Pillar 3: 3–5 Year Strategic M&A Exit ($2.5M – $4.0M):** Strategic bolt-on acquisition by Netsmart Technologies, PointClickCare, Qualifacts, or Welligent at 6.0x–9.5x ARR multiples.
* **Pillar 4: Decadal Economic Ecosystem ($20,000,000 Cumulative Value):** Medi-Cal billing recapture (saving $18,000/year/specialist) and elimination of 12% DHCS audit clawbacks statewide.

## 3. Unit Economics & Gross Margins
* **Average Revenue Per User (ARPU):** $29.00 / month / specialist
* **Hosting & Infrastructure Cost (COGS):** $0.85 / month / specialist
* **Gross Margin:** 95.5%
* **Customer Acquisition Cost (CAC):** $140
* **Lifetime Value (LTV, 36-mo):** $1,044.00
* **LTV : CAC Ratio:** 7.46x`
  },

  // 03-design-experience & compliance
  {
    id: '03-design-system',
    categoryNumber: '03',
    categoryTitle: 'Design Experience & Compliance',
    title: 'Trauma-Informed Clinical Design System',
    slug: '03-design-experience/design-system',
    path: '/docs/03-design-experience/design-system.md',
    badge: 'Strictly Light Mode',
    badgeColor: 'bg-slate-100 text-slate-800',
    summary: 'Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E), and minimum 48px touch tokens.',
    content: `# Trauma-Informed Clinical Design System

**Document Version:** 1.0-GA  
**Design Philosophy:** Strictly Light Mode • Low-Arousal Clinical Ergonomics • Zero-Glare Soft Slate

---

## Visual Token Architecture
* **Surface Background (#F8FAFC - Soft Slate):** Low-arousal off-white designed to prevent glare during field shifts.
* **Header & Structural Core (#1E3A8A - Deep Navy):** High-contrast stability, authority, and legibility.
* **Interactive Primary (#0F766E - Muted Teal):** Grounding, therapeutic teal for buttons and active states.
* **Success / Synced (#16A34A - Forest Green):** Indicates successful local-to-cloud synchronization.
* **Queued / Caution (#D97706 - Warm Amber):** Highlights offline-queued operations without inducing panic.

## Minimum 44px–48px Touch Targets
Every button, input field, and pill selector strictly conforms to a minimum 44px to 48px hitbox for field tablets.`
  },
  {
    id: '03-personas',
    categoryNumber: '03',
    categoryTitle: 'Design Experience & Compliance',
    title: 'Empirical User Personas & Behavioral Profiles',
    slug: '03-design-experience/user-personas',
    path: '/docs/03-design-experience/user-personas.md',
    badge: 'Field Archetypes',
    badgeColor: 'bg-teal-100 text-teal-800',
    summary: 'Profiles of Elena Martinez (Field CPSS), Marcus Vance (Recovery Coach), and Sarah Jenkins (Supervisor).',
    content: `# Empirical User Personas & Behavioral Friction Profiles

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com

---

* **Persona 1: Elena Martinez, CPSS-CA (Field Peer Support Specialist):** Street outreach worker using ruggedized tablet with intermittent LTE; needs zero-loss offline autosave and sub-2 minute note entry.
* **Persona 2: Marcus Vance, CPRC (Peer Recovery Coach):** Hybrid hospital/community coach needing 3-way time tracking and 1-click audit-ready PDF export.
* **Persona 3: Sarah Jenkins, LCSW (Clinical Supervisor):** Reviews peer notes for county Medi-Cal compliance and cosigns within 72 hours.`
  },
  {
    id: '03-accessibility',
    categoryNumber: '03',
    categoryTitle: 'Design Experience & Compliance',
    title: 'Accessibility Standards & WCAG 2.2 Level AA',
    slug: '03-design-experience/accessibility-standards',
    path: '/docs/03-design-experience/accessibility-standards.md',
    badge: 'WCAG 2.2 AA',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'Contrast verification (9.2:1), keyboard trap elimination, ARIA landmarks, and cognitive safety.',
    content: `# Accessibility Standards & WCAG 2.2 Level AA Conformance

**Document Version:** 1.0-GA  
**Standard:** WCAG 2.2 Level AA / Section 508 / ADA Title III

---

## Conformance Matrix Highlights
* **Contrast (1.4.3):** Deep Navy on Soft Slate achieves 9.2:1 contrast ratio (exceeds 4.5:1 requirement).
* **Target Size (2.5.5 / 2.5.8):** All clickable controls adhere to >= 44px x 44px minimum touch dimensions.
* **Keyboard Navigation (2.1.1):** Complete note entry and export cycle executable via keyboard alone.
* **Focus Visible (2.4.7):** Prominent 2px teal focus rings on all interactive elements.`
  },
  {
    id: '03-calmhsa-guide',
    categoryNumber: '03',
    categoryTitle: 'Design Experience & Compliance',
    title: 'CalMHSA & SB 803 Certification Compliance Guide',
    slug: '03-compliance-regulatory/calmhsa-compliance-guide',
    path: '/docs/03-compliance-regulatory/calmhsa-compliance-guide.md',
    badge: 'SB 803 Standard',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'California Senate Bill 803 mandates, supervisory co-signing, and non-clinical practice boundaries.',
    content: `# CalMHSA & California SB 803 Certification Compliance Guide

**Document Version:** 1.0-GA  
**Governing Statute:** California SB 803 / Welfare and Institutions Code § 14045.5

---

## Key Supervisory & Documentation Mandates
1. **Supervisory Oversight:** Medi-Cal peer encounters billed to county plans require supervision from a certified supervisor or licensed clinician (LCSW, LMFT, LPCC).
2. **72-Hour Timeliness:** Notes must be completed and submitted for cosigning within 72 business hours.
3. **Audit Trail Immutability:** Locked notes cannot be modified without auditable addendum notation.
4. **Non-Clinical Demarcation:** Strictly forbids clinical diagnostic formulations.`
  },

  // 04-technical-architecture
  {
    id: '04-white-paper',
    categoryNumber: '04',
    categoryTitle: 'Technical Architecture',
    title: 'GA #8 Production Architecture White Paper',
    slug: '04-technical-architecture/GA8_Production_Grade_Architecture_White_Paper',
    path: '/docs/04-technical-architecture/GA8_Production_Grade_Architecture_White_Paper.md',
    badge: 'Canonical White Paper',
    badgeColor: 'bg-blue-100 text-blue-800',
    summary: 'Approved enterprise architecture white paper detailing offline-first dual persistence and CalAIM alignment.',
    content: `# GA #8 Production-Grade Architecture White Paper

**System Classification:** Enterprise Behavioral Health & Peer Support EHR  
**Maturity Tier:** GA #8 (Production Hardened)  
**Target Platform:** Progressive Web Application (PWA) with Offline-First Dual Persistence

---

## Core Architectural Pillars
1. **Zero-Latency Local Commits:** Every client interaction and note is written first to the client-side Dexie.js transactional datastore.
2. **Deterministic Background Sync Worker:** An idempotent worker processes the local \`sync_queue\` when network connectivity resumes.
3. **Multi-Tenant Row-Level Security (RLS):** Supabase PostgreSQL database policies strictly restrict visibility to authorized agency boundaries (\`org_id\`).`
  },
  {
    id: '04-offline-sync',
    categoryNumber: '04',
    categoryTitle: 'Technical Architecture',
    title: 'Offline Sync & IndexedDB Technical Specification',
    slug: '04-technical-architecture/07_Offline_Sync_IndexedDB',
    path: '/docs/04-technical-architecture/07_Offline_Sync_IndexedDB.md',
    badge: 'Dexie.js Engine',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'Dexie.js v4 storage schemas, background sync worker state machine, and conflict resolution strategy.',
    content: `# Offline Sync & IndexedDB Technical Specification

**Module:** \`src/db/peerNotebookDatabase.ts\` & \`src/services/syncWorker.ts\`  
**Storage Engine:** Dexie.js v4 (IndexedDB Wrapper)  
**Cloud Bridge:** PostgreSQL / Supabase Realtime API

---

## Sync Worker State Machine
* **Online:** Active network connection detected. Mutations batched and dispatched within 600ms.
* **Offline:** Network lost. Operations enqueued to \`sync_queue\`. UI pill transitions to Warm Amber (#D97706).
* **Syncing:** Processing queue items sequentially with retry backoff.
* **Field Author Authority:** Conflict resolution enforces Last-Write-Wins with preserved local audit revision logs.`
  },
  {
    id: '04-compliance-engine',
    categoryNumber: '04',
    categoryTitle: 'Technical Architecture',
    title: 'Compliance Engine & Client-Side PDF Export',
    slug: '04-technical-architecture/05_Compliance_Engine_PDF_Export',
    path: '/docs/04-technical-architecture/05_Compliance_Engine_PDF_Export.md',
    badge: 'SHA-256 Tamper Seal',
    badgeColor: 'bg-purple-100 text-purple-800',
    summary: 'Automated 4-part note validation, immutable audit trails, and jsPDF tamper-evident client generation.',
    content: `# Compliance Engine & Client-Side PDF Export Specification

**Document Version:** 1.0-GA  
**Engine:** jsPDF Client-Side Generation with SHA-256 Tamper-Evident Stamping

---

## Cryptographic Tamper-Evident Hashing
When locked, the note payload is canonicalized into a standardized string and hashed using WebCrypto:
\`\`\`typescript
const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalString));
const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
\`\`\`
The exported PDF includes the SHA-256 seal and formal supervisor signature lines for county audit compliance.`
  },
  {
    id: '04-hipaa-baa',
    categoryNumber: '04',
    categoryTitle: 'Technical Architecture',
    title: 'HIPAA Security Rule, BAA & Consent Model',
    slug: '04-technical-architecture/08_HIPAA_BAA_Consent_Model',
    path: '/docs/04-technical-architecture/08_HIPAA_BAA_Consent_Model.md',
    badge: '45 CFR § 164',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'HIPAA Security Rule 45 CFR § 164, CMIA Civil Code § 56, digital signature vector capture, and SHA-256 consent binding.',
    content: `# HIPAA Security Rule, BAA Compliance & Client Consent Model

**Document Version:** 1.0-GA  
**Regulatory Standards:** HIPAA Security Rule (45 CFR § 164) / California CMIA (Civil Code § 56)

---

## Technical Safeguards Checklist
* **Access Control (§ 164.312(a)(1)):** Unique user identification and role-based access restrictions.
* **Audit Controls (§ 164.312(b)):** \`audit_trail_logs\` records all system mutations with immutable SHA-256 signatures.
* **Integrity (§ 164.312(c)(1)):** SHA-256 cryptographic hashing corroborates ePHI has not been altered post-lock.
* **Transmission Security (§ 164.312(e)(1)):** End-to-end TLS 1.3 encryption across all public network paths.`
  },

  // 05-engineering-quality & security
  {
    id: '05-testing',
    categoryNumber: '05',
    categoryTitle: 'Engineering Quality & Security',
    title: 'Testing Strategy & Automated Quality Gates',
    slug: '05-engineering-quality/testing-strategy',
    path: '/docs/05-engineering-quality/testing-strategy.md',
    badge: 'Testing Pyramid',
    badgeColor: 'bg-blue-100 text-blue-800',
    summary: '70% unit, 20% integration, 10% E2E testing ratios with Dexie.js offline-first mocking protocols.',
    content: `# Testing Strategy & Automated Quality Gates

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com

---

## Test Pyramid Allocation
* **Unit Tests (70%):** CMS 8-Minute billing unit calculator, 4-part note validation rules, CalAIM time calculations.
* **Integration Tests (20%):** Dual-layer IndexedDB writes and background sync dispatch to Supabase REST endpoints.
* **End-to-End Tests (10%):** Offline simulation user journeys, mobile touch target (>44px) verification on simulated 375px viewports.`
  },
  {
    id: '05-cicd',
    categoryNumber: '05',
    categoryTitle: 'Engineering Quality & Security',
    title: 'CI/CD Pipeline & Production Build Specifications',
    slug: '05-engineering-quality/ci-cd-pipeline',
    path: '/docs/05-engineering-quality/ci-cd-pipeline.md',
    badge: 'Passing',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'GitHub Actions declarative workflows, tsc && vite build quality gates, and Vercel edge deployment.',
    content: `# CI/CD Deployment Pipeline Specification

**Document Version:** 1.0-GA  
**CI/CD Engine:** GitHub Actions + Vercel Edge Deployment

---

## Build Pipeline Stages
1. Dependency Installation (\`npm install --legacy-peer-deps\`)
2. Type Safety Verification (\`tsc --noEmit\`)
3. Production Bundle Compilation (\`npm run build\`)
4. Vercel Global Edge Zero-Downtime Atomic Rollout`
  },
  {
    id: '05-code-review',
    categoryNumber: '05',
    categoryTitle: 'Engineering Quality & Security',
    title: 'Code Review Standards & TypeScript Strictness',
    slug: '05-engineering-quality/code-review-standards',
    path: '/docs/05-engineering-quality/code-review-standards.md',
    badge: 'TS Strict',
    badgeColor: 'bg-blue-100 text-blue-800',
    summary: 'Mandatory review rules, zero-jargon linting, TypeScript strict mode, and offline resilience checks.',
    content: `# Code Review Standards & Craftsmanship Rubric

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com

---

## Review Rules
* **Rule 1 (Zero Clinical Jargon):** Reject code introducing DSM-5 psychiatric terms into peer workflows.
* **Rule 2 (Strict Touch Target Sizing):** All interactive elements must explicitly ensure >= 44px hitboxes.
* **Rule 3 (Zero TypeScript Escapes):** No \`any\` or \`@ts-ignore\` allowed; strict typing across all data models.
* **Rule 4 (Offline-First Integrity):** All state mutations must persist locally in Dexie before network calls.`
  },

  // 06-operations-deployment & billing
  {
    id: '06-infra',
    categoryNumber: '06',
    categoryTitle: 'Operations & Billing Deployment',
    title: 'Production Infrastructure Runbook & Domain Setup',
    slug: '06-operations-deployment/infrastructure-runbook',
    path: '/docs/06-operations-deployment/infrastructure-runbook.md',
    badge: 'peernotebook.com',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'Vercel Edge custom domain routing, DNS apex and CNAME records, and Supabase cluster topology.',
    content: `# Production Infrastructure Runbook & Domain Setup

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Host Architecture:** Vercel Edge Network + Supabase PostgreSQL Cluster

---

## Domain DNS Configuration
* **A Record:** \`@\` -> \`76.76.21.21\` (Vercel Global Edge Proxy)
* **CNAME:** \`www\` -> \`cname.vercel-dns.com\`
* **SSL:** Automatic Let's Encrypt TLS 1.3 provisioning with 60-day auto-renewals.`
  },
  {
    id: '06-h0038-ops',
    categoryNumber: '06',
    categoryTitle: 'Operations & Billing Deployment',
    title: 'Medi-Cal H0038 Billing Operations & Claims Batching',
    slug: '06-operations-billing/h0038-billing-operations',
    path: '/docs/06-operations-billing/h0038-billing-operations.md',
    badge: 'Medi-Cal Claims',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'County Medi-Cal claims processing, billing modifiers (U1, U2, GQ), and audit preparation workflows.',
    content: `# Medi-Cal H0038 Billing Operations & Claims Processing

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Billing Framework:** Medi-Cal Behavioral Health CalAIM / HCPCS H0038

---

## Common Procedure Modifiers
* **H0038 (Standard):** 1-on-1 community field peer support encounter (15-min unit)
* **H0038 + HQ:** Peer group encounter facilitation
* **H0038 + GQ:** Synchronous telehealth peer encounter
* **H0038 + U1/U2:** County-specific specialized level of care (DMC-ODS / Specialty Mental Health)`
  },

  // 07-legal-administrative
  {
    id: '07-privacy',
    categoryNumber: '07',
    categoryTitle: 'Legal & Administrative',
    title: 'Privacy Policy Specification & HIPAA Privacy Practices',
    slug: '07-legal-administrative/privacy-policy-spec',
    path: '/docs/07-legal-administrative/privacy-policy-spec.md',
    badge: 'HIPAA & CMIA',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'HIPAA Notice of Privacy Practices, California CMIA disclosures, data retention, and client confidentiality rights.',
    content: `# Privacy Policy Specification & HIPAA Privacy Practices

**Document Version:** 1.0-GA  
**Applicable Statutes:** HIPAA Privacy Rule / California CMIA (Civil Code § 56) / CCPA

---

## Core Privacy Commitments
1. **Zero Data Monetization:** We never sell, rent, or trade peer client data or encounter records.
2. **Minimal Data Collection:** Collect only data strictly required for audit-ready Medi-Cal H0038 compliance.
3. **Client De-Identification Support:** Pseudonymized client identifiers (MRN / Alias) supported for mobile field protection.
4. **10-Year Medi-Cal Retention:** Encrypted records retained in accordance with California DHCS audit mandates.`
  },
  {
    id: '07-terms',
    categoryNumber: '07',
    categoryTitle: 'Legal & Administrative',
    title: 'Terms of Service & Specialist Acceptable Use Policy',
    slug: '07-legal-administrative/terms-of-service',
    path: '/docs/07-legal-administrative/terms-of-service.md',
    badge: 'Master Services Agreement',
    badgeColor: 'bg-blue-100 text-blue-800',
    summary: 'Non-clinical scope of practice attestation, security responsibilities, and SLA performance terms.',
    content: `# Terms of Service & Specialist Acceptable Use Policy

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com

---

## Non-Clinical Scope Attestation
Users attest that Peer Notebook is a specialized documentation software platform for Certified Peer Support Specialists and does NOT provide medical advice or psychiatric treatment. Users operate strictly within certified peer support scope under California SB 803.`
  },
  {
    id: '07-compliance-matrix',
    categoryNumber: '07',
    categoryTitle: 'Legal & Administrative',
    title: 'Multi-Framework Compliance Crosswalk Matrix',
    slug: '07-legal-administrative/compliance-matrix',
    path: '/docs/07-legal-administrative/compliance-matrix.md',
    badge: 'SOC 2 & HIPAA',
    badgeColor: 'bg-purple-100 text-purple-800',
    summary: 'Comprehensive crosswalk mapping SOC 2 Type II, ISO 27001, HIPAA 45 CFR § 164, and CalMHSA requirements.',
    content: `# Multi-Framework Compliance Crosswalk Matrix

**Document Version:** 1.0-GA  
**Standards:** SOC 2 Type II / ISO 27001 / HIPAA / CalAIM / CalMHSA

---

## Key Framework Verification
* **Data Protection at Rest:** PostgreSQL AES-256 + WebCrypto AES-GCM (HIPAA § 164.312 / ISO 27001 A.10.1).
* **Transmission Security:** TLS 1.3 + HSTS preload (SOC 2 CC6.6).
* **Audit Trails:** Immutable SHA-256 signed change logs.
* **CalMHSA Core Competencies:** 17 competencies integrated with non-clinical linguistic guardrails.`
  },
  {
    id: '07-ip',
    categoryNumber: '07',
    categoryTitle: 'Legal & Administrative',
    title: 'Intellectual Property, Licensing & Open-Source Attribution',
    slug: '07-legal-administrative/ip-licensing',
    path: '/docs/07-legal-administrative/ip-licensing.md',
    badge: 'Dual-License',
    badgeColor: 'bg-slate-100 text-slate-800',
    summary: 'Software licensing inventory, open-source attributions, and proprietary code protections.',
    content: `# Intellectual Property, Licensing & Open-Source Attribution

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Copyright:** (c) 2026 Peer Notebook LLC. All Rights Reserved.

---

## Open-Source Attribution
* **React:** MIT License (Meta Platforms, Inc.)
* **Vite:** MIT License (Evan You & Vite Contributors)
* **Dexie.js:** Apache 2.0 (David Fahlander)
* **Tailwind CSS:** MIT License (Tailwind Labs Inc.)
* **Lucide Icons:** ISC License (Lucide Project)`
  },
  {
    id: '07-ip-assignment',
    categoryNumber: '07',
    categoryTitle: 'Legal & Administrative',
    title: 'Founder-to-LLC IP Assignment Agreement',
    slug: '07-legal-administrative/06_IP_Assignment_Agreement',
    path: '/docs/07-legal-administrative/06_IP_Assignment_Agreement.md',
    badge: 'Executed IP Transfer',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'Executed agreement transferring 100% of source code, domain peernotebook.com, algorithms, and documentation from founder Hani Joe Abudayyeh to Peer Notebook LLC.',
    content: `# Intellectual Property Assignment & Contribution Agreement

**Document ID:** PN-LEGAL-2026-IP-001  
**Category:** 07-legal-administrative  
**Effective Date:** October 22, 2026  
**Governing Law:** State of California

---

## 1. Parties to the Agreement
* **Assignor (Individual Founder):** Hani Joe Abudayyeh
* **Assignee (Corporate Entity):** Peer Notebook LLC (California Limited Liability Company)

---

## 2. Scope of Assigned Intellectual Property
Assignor hereby unconditionally and irrevocably sells, assigns, transfers, and conveys to Peer Notebook LLC all worldwide right, title, and interest in and to:
1. **Source Code & Architecture:** All React 18, Vite 6, Tailwind CSS 4, Dexie.js IndexedDB, and Supabase PostgreSQL RLS source files.
2. **Domain Properties:** peernotebook.com and www.peernotebook.com.
3. **Master Documentation Binder:** Complete 27-document suite across categories 01 through 07.
4. **Clinical & Billing Algorithms:** CalAIM Medi-Cal HCPCS H0038 15-minute billing unit calculation engine (CMS 8-minute rule) and 3-way time tracking logic.
5. **Trademarks & Trade Dress:** Peer Notebook® trademark, HeartHandshake mark, and trauma-informed clinical color tokens.`
  },
  {
    id: '07-baa-framework',
    categoryNumber: '07',
    categoryTitle: 'Legal & Administrative',
    title: 'Business Associate Agreement (BAA) Institutional Framework',
    slug: '07-legal-administrative/07_Business_Associate_Agreement_BAA_Framework',
    path: '/docs/07-legal-administrative/07_Business_Associate_Agreement_BAA_Framework.md',
    badge: '45 CFR § 164',
    badgeColor: 'bg-blue-100 text-blue-800',
    summary: 'Institutional BAA framework across Supabase, AWS S3 WORM storage, and Google Cloud zero-retention data logging policies.',
    content: `# Business Associate Agreement (BAA) Institutional Framework

**Document ID:** PN-LEGAL-2026-BAA-007  
**Category:** 07-legal-administrative  
**Entity:** Peer Notebook LLC  
**Governing Regulation:** HIPAA Privacy & Security Rules (45 CFR Parts 160/164) / California CMIA (Cal. Civ. Code § 56)

---

## Subprocessor Compliance Matrix
* **Supabase, Inc. (Database & Auth):** Dedicated PostgreSQL 15, AES-256 disk encryption, Enterprise HIPAA BAA executed.
* **Amazon Web Services (Backup Tier):** AWS S3 WORM Object Locking for WAL logs, HIPAA BAA active, California data residency.
* **Vercel Edge Network:** Stateless frontend asset delivery; zero PHI stored or logged at the edge.
* **Zero-AI / Zero-Log Data Policy:** Strict zero-data-retention, zero-model-training policy. Encounter text is never parsed for machine learning model training.
* **Breach Notification Protocol:** Written notice provided to contracting Covered Entities within 48 hours.`
  },
  {
    id: '07-terms-disclaimer',
    categoryNumber: '07',
    categoryTitle: 'Legal & Administrative',
    title: 'Terms of Service with Non-Clinical & Billing Disclaimers',
    slug: '07-legal-administrative/01_Terms_of_Service',
    path: '/docs/07-legal-administrative/01_Terms_of_Service.md',
    badge: 'Administrative Aid',
    badgeColor: 'bg-amber-100 text-amber-800',
    summary: 'Explicit disclaimers: administrative productivity and formatting aid only, no guarantee against Medi-Cal billing audits.',
    content: `# Peer Notebook Master Terms of Service & Administrative Use Agreement

**Document ID:** PN-LEGAL-2026-TOS-001  
**Category:** 07-legal-administrative  
**Entity:** Peer Notebook LLC  
**Target Domain:** peernotebook.com

---

## EXPLICIT NON-CLINICAL & ADMINISTRATIVE PRODUCTIVITY DISCLAIMER
1. **Not a Medical Device or Clinical Diagnostic Service:** Peer Notebook is an administrative workflow, note-formatting, and productivity aid only. The platform does not provide medical advice, psychiatric diagnosis, or clinical psychotherapeutic treatment.
2. **Disclaimer of Medi-Cal Billing & Fraud Compliance Guarantees:** Peer Notebook LLC makes no guarantee that notes exported will be approved without audit challenge. Contracting agencies and practitioners maintain sole responsibility for claim accuracy and medical necessity.`
  },
  {
    id: '07-oss-notice',
    categoryNumber: '07',
    categoryTitle: 'Legal & Administrative',
    title: 'Open-Source License Notice & Dependency Attributions',
    slug: '07-legal-administrative/08_Open_Source_License_Notice',
    path: '/docs/07-legal-administrative/08_Open_Source_License_Notice.md',
    badge: 'SPDX Clean',
    badgeColor: 'bg-slate-100 text-slate-800',
    summary: 'Attributions for React, Vite, Tailwind CSS, Dexie.js, Supabase, and jsPDF verifying zero GPL contamination for clean acquisition.',
    content: `# Open-Source Licensing & Third-Party Dependency Attribution

**Document ID:** PN-LEGAL-2026-OSS-008  
**Category:** 07-legal-administrative  
**Entity:** Peer Notebook LLC  
**Target Domain:** peernotebook.com

---

## Clean Acquisition Verification
* **Zero GPL / AGPL Contamination:** Audit confirms no Copyleft dependencies in the production runtime bundle.
* **Clean IP Chain of Title:** 100% of custom authoring assigned to Peer Notebook LLC.
* **Permissive Licenses Only:** React (MIT), Vite (MIT), Dexie.js (Apache 2.0), Tailwind CSS (MIT), Lucide (ISC), Supabase JS (MIT), jsPDF (MIT).`
  },
  // 08-architecture-decision-records (ADRs)
  {
    id: '08-adr-001',
    categoryNumber: '08',
    categoryTitle: 'Architecture Decision Records (ADRs)',
    title: 'ADR-001: Zero-AI Runtime Deterministic Engine',
    slug: '08-adr/001-zero-ai-runtime',
    path: '/docs/adr/ADR-001_Zero_AI_Runtime_Deterministic_Engine.md',
    badge: 'Enforced',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'Prohibits embedding generative AI models in production runtime to prevent PHI leakage, clinical hallucinations, and audit disallowances.',
    content: `# ADR-001: Zero-AI Runtime Deterministic Engine

**Status:** Accepted & Enforced  
**Date:** 2026-10-24  
**Primary Standard:** HIPAA 45 CFR § 164 & Zero PHI Transmission

---

## Context
Certified Peer Support Specialists (CPSS) in California document encounters under Medi-Cal CalAIM (HCPCS H0038 / POS 15) and California Mental Health Services Authority (CalMHSA) regulations. Emerging clinical software vendors frequently embed generative Artificial Intelligence (LLMs) to synthesize clinical notes.

However, in peer support environments:
1. **Confidentiality & PHI Leakage:** Transmitting peer narratives containing substance use recovery, community trauma, or psychiatric distress to cloud LLM APIs risks HIPAA 45 CFR § 164 and 42 CFR Part 2 non-compliance.
2. **Clinical Jargon & Hallucination Risk:** Generative AI models default to DSM-5 pathology language, which directly contradicts trauma-informed, strengths-based peer support recovery philosophy.
3. **Audit Disallowances:** County behavioral health clearinghouses disallow claims when AI-generated notes do not accurately reflect the authentic, real-time mutual aid encounter.

## Decision
We enforce a strict **Zero-AI Production Runtime Codebase Mandate**:
- Zero artificial intelligence or machine learning packages exist in the production runtime bundle of peernotebook.com.
- All note validations, strengths-based language cleansing, and 15-minute billing unit conversions are executed strictly via deterministic, transparent, and auditable client-side TypeScript algorithms.
- A runtime badge \`<ZeroAiBadge />\` displays "runtime: Zero-AI (Deterministic)" across all user-facing headers and footers.`
  },
  {
    id: '08-adr-002',
    categoryNumber: '08',
    categoryTitle: 'Architecture Decision Records (ADRs)',
    title: 'ADR-002: Dual-Layer Persistence (Dexie.js to Supabase)',
    slug: '08-adr/002-dual-layer-persistence',
    path: '/docs/adr/ADR-002_Dual_Layer_Persistence_Dexie_To_Supabase.md',
    badge: 'Enforced',
    badgeColor: 'bg-teal-100 text-teal-800',
    summary: 'Offline-first client IndexedDB buffering with background synchronization to Supabase PostgreSQL (≥99.5% reliability SLA).',
    content: `# ADR-002: Dual-Layer Persistence (Dexie.js IndexedDB to Supabase PostgreSQL)

**Status:** Accepted & Enforced  
**Date:** 2026-10-24  
**Primary Standard:** Offline-First PWA Resilience (≥ 99.5% SLA)

---

## Context
Peer Support Specialists frequently operate in outreach zones with severe network limitations, including hospital basements, encampments, rural agricultural corridors, and homeless shelters. Traditional cloud-first EHR platforms freeze or discard form state when connectivity is interrupted.

## Decision
We implement a **Dual-Layer Persistence Architecture**:
1. **Tier 1 (Client-Side Storage):** Dexie.js (IndexedDB wrapper) serves as the primary local write target. Encounters commit within 11ms–19ms.
2. **Tier 2 (Cloud Relational Store):** Supabase PostgreSQL with strict Row-Level Security (RLS) policies serves as the centralized agency repository.
3. **Synchronization Worker:** A background sync daemon continuously monitors network state, buffers mutations in an immutable queue, and executes reconciliation upon network re-establishment without duplicate keys using deterministic UUIDv4 identifiers.`
  },
  {
    id: '08-adr-003',
    categoryNumber: '08',
    categoryTitle: 'Architecture Decision Records (ADRs)',
    title: 'ADR-003: SHA-256 Tamper-Evident Audit Trails',
    slug: '08-adr/003-sha256-audit-trails',
    path: '/docs/adr/ADR-003_SHA256_Tamper_Evident_Audit_Trails.md',
    badge: 'Enforced',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    summary: 'Native Web Crypto cryptographic signature sealing on all notes, edits, and supervisor cosigns.',
    content: `# ADR-003: SHA-256 Tamper-Evident Audit Trails & Cryptographic Sealing

**Status:** Accepted & Enforced  
**Date:** 2026-10-24  
**Primary Standard:** HIPAA Security Rule 45 CFR § 164.312(b)

---

## Context
Under HIPAA Security Rule 45 CFR § 164.312(b) and California Welfare and Institutions Code § 14043.2, all behavioral health clinical and peer support records must maintain an immutable, tamper-evident audit trail tracking the creation, alteration, review, and supervisor cosigning of electronic protected health information (ePHI).

## Decision
We enforce cryptographic **SHA-256 Tamper-Evident Sealing**:
1. **Audit Log Generation:** Every state mutation generates an immutable AuditLogEntry.
2. **Cryptographic Checksum:** A SHA-256 hash is computed using native Web Crypto crypto.subtle.digest.
3. **Portability:** Supervisors can export verified JSON and CSV audit trails directly for county clearinghouse audits.`
  },
  {
    id: '08-adr-004',
    categoryNumber: '08',
    categoryTitle: 'Architecture Decision Records (ADRs)',
    title: 'ADR-004: WCAG 2.1/2.2 AA Trauma-Informed Design Tokens',
    slug: '08-adr/004-wcag-trauma-informed-tokens',
    path: '/docs/adr/ADR-004_WCAG_2_1_AA_Trauma_Informed_Design_Tokens.md',
    badge: 'Enforced',
    badgeColor: 'bg-blue-100 text-blue-800',
    summary: 'Low-arousal Soft Slate (#F8FAFC) light-mode exclusive design system with min 44px touch targets.',
    content: `# ADR-004: WCAG 2.1/2.2 AA Trauma-Informed Design Tokens

**Status:** Accepted & Enforced  
**Date:** 2026-10-24  
**Primary Standard:** ADA Title III & Section 508

---

## Decision
We enforce **Trauma-Informed Light-Mode Tokens & WCAG 2.1/2.2 AA Standards**:
1. **Background Surface:** Low-arousal Soft Slate off-white (#F8FAFC). Pure black or harsh dark modes are excluded to avoid visual shock in unpredictable lighting.
2. **Card Surfaces:** Pure White (#FFFFFF) with subtle borders and soft shadows.
3. **Typography & Contrast:** Deep Navy (#1E3A8A) for headers (contrast ratio ≥ 7:1); Muted Teal (#0F766E) for primary interactive triggers (contrast ≥ 4.6:1).
4. **Touch Ergonomics:** All clickable elements maintain a minimum touch bounding box of 44px–48px.
5. **Responsive Markdown Wrappers:** All documentation containers use w-full overflow-x-auto to eliminate horizontal scrolling across small viewports (<640px).`
  },
  {
    id: '08-adr-005',
    categoryNumber: '08',
    categoryTitle: 'Architecture Decision Records (ADRs)',
    title: 'ADR-005: Medi-Cal H0038 15-Minute Billing Unit Calculations',
    slug: '08-adr/005-medi-cal-billing-calculations',
    path: '/docs/adr/ADR-005_Medi_Cal_H0038_15_Minute_Billing_Calculations.md',
    badge: 'Enforced',
    badgeColor: 'bg-blue-100 text-blue-800',
    summary: 'Enforces CMS 8-Minute Rounding Rule and mandatory 4-part CalMHSA note validation for Procedure Code H0038.',
    content: `# ADR-005: Medi-Cal H0038 15-Minute Billing Unit Calculations

**Status:** Accepted & Enforced  
**Date:** 2026-10-24  
**Primary Standard:** DHCS CalAIM Payment Reform & CMS 8-Minute Rule

---

## Decision
We implement a **Deterministic Medi-Cal Billing Engine**:
1. **Time Breakdown:** Captures direct face-to-face duration, field travel minutes, and documentation time separately.
2. **CMS 8-Minute Threshold Rule Algorithm:**
   - 0–7 minutes: 0 billable units
   - 8–22 minutes: 1 billable unit
   - 23–37 minutes: 2 billable units
   - 38–52 minutes: 3 billable units
   - 53–67 minutes: 4 billable units
   - ≥ 68 minutes: floor((minutes + 7) / 15) units
3. **CalMHSA 4-Part Structure Enforcement:**
   - 1. Recovery Plan Goal Addressed
   - 2. Peer Support Intervention Delivered
   - 3. Peer Engagement & Response
   - 4. Next Steps & Recovery Commitments`
  },
  {
    id: '08-openapi-spec',
    categoryNumber: '08',
    categoryTitle: 'Architecture Decision Records (ADRs)',
    title: 'OpenAPI 3.1.0 Specification & API Compliance',
    slug: '08-adr/openapi-specification',
    path: '/docs/04-technical-architecture/openapi.json',
    badge: 'OpenAPI 3.1',
    badgeColor: 'bg-teal-100 text-teal-800',
    summary: 'Machine-readable OpenAPI 3.1.0 specification documenting CalAIM telemetry, daily digests, and lead capture endpoints.',
    content: `# Peer Notebook OpenAPI 3.1.0 Specification

**Status:** Active GA Standard  
**Format:** OpenAPI 3.1.0 JSON  
**Live Location:** \`/openapi.json\`

---

## Endpoints Summary
1. **POST /api/daily-digest** — Dispatches 24-hour telemetry, lead counts, and traffic summaries to \`support@peernotebook.com\`.
2. **POST /api/lead-capture** — Registers CBO and specialist beta cohort inquiries with automated notification.
3. **Client-Side Sync Interface** — RESTful sync to Supabase PostgreSQL with Row-Level Security (RLS) enforcement.`
  }
];

interface ParsedBlock {
  type: 'heading' | 'code' | 'table' | 'blockquote' | 'hr' | 'list' | 'paragraph';
  level?: number;
  lang?: string;
  code?: string;
  headers?: string[];
  rows?: string[][];
  items?: string[];
  ordered?: boolean;
  text?: string;
}

const renderInlineMarkdown = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.substring(lastIndex, match.index)}</span>);
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={key++} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded bg-slate-100 text-[#0F766E] font-mono text-[11px] sm:text-xs border border-slate-200 break-all font-semibold"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkText = token.slice(1, token.indexOf(']('));
      const linkUrl = token.slice(token.indexOf('](') + 2, -1);
      parts.push(
        <a
          key={key++}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0F766E] font-semibold underline hover:text-[#1E3A8A]"
        >
          {linkText}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.substring(lastIndex)}</span>);
  }
  return parts.length > 0 ? parts : text;
};

const CodeBlockComponent: React.FC<{ code: string; lang?: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full overflow-x-auto my-4 rounded-xl border border-slate-700 bg-slate-900 shadow-sm text-left">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-800/90 border-b border-slate-700/60 text-slate-300 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500/80 inline-block"></span>
          <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block"></span>
          <span className="ml-1 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            {lang || 'snippet'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="min-h-[32px] px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
          title="Copy snippet"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-emerald-300 whitespace-pre overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const TableBlockComponent: React.FC<{ headers: string[]; rows: string[][] }> = ({
  headers,
  rows
}) => {
  return (
    <div className="w-full overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-2xs bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
        {headers.length > 0 && (
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} scope="col" className="px-4 py-3 whitespace-nowrap">
                  {renderInlineMarkdown(h)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-2.5 text-xs text-slate-600 align-top">
                  {renderInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ResponsiveMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const blocks = useMemo(() => {
    const lines = content.split('\n');
    const result: ParsedBlock[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Fenced code block
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        result.push({
          type: 'code',
          lang: lang || 'text',
          code: codeLines.join('\n')
        });
        continue;
      }

      // Markdown Table
      if (line.trim().startsWith('|') && line.includes('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        if (tableLines.length >= 2) {
          const headers = tableLines[0]
            .split('|')
            .slice(1, -1)
            .map(h => h.trim());
          const startRow = tableLines[1].includes('---') ? 2 : 1;
          const rows: string[][] = [];
          for (let r = startRow; r < tableLines.length; r++) {
            const cells = tableLines[r]
              .split('|')
              .slice(1, -1)
              .map(c => c.trim());
            rows.push(cells);
          }
          result.push({
            type: 'table',
            headers,
            rows
          });
          continue;
        }
      }

      // Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        result.push({
          type: 'heading',
          level: headingMatch[1].length,
          text: headingMatch[2].trim()
        });
        i++;
        continue;
      }

      // Blockquote
      if (line.trim().startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        result.push({
          type: 'blockquote',
          text: quoteLines.join(' ')
        });
        continue;
      }

      // Horizontal Rule
      if (/^(\*\*\*|---|___)$/.test(line.trim())) {
        result.push({ type: 'hr' });
        i++;
        continue;
      }

      // List item
      const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
      if (listMatch) {
        const isOrdered = /^\d+\./.test(listMatch[2]);
        const items: string[] = [];
        while (i < lines.length) {
          const itemMatch = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
          if (!itemMatch) break;
          items.push(itemMatch[3]);
          i++;
        }
        result.push({
          type: 'list',
          ordered: isOrdered,
          items
        });
        continue;
      }

      // Blank line
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Paragraph
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !lines[i].trim().startsWith('#') &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].trim().startsWith('>') &&
        !lines[i].trim().startsWith('|') &&
        !lines[i].match(/^(\s*)([-*]|\d+\.)\s+/) &&
        !/^(\*\*\*|---|___)$/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length > 0) {
        result.push({
          type: 'paragraph',
          text: paraLines.join(' ')
        });
      }
    }

    return result;
  }, [content]);

  return (
    <div className="w-full min-w-0 space-y-2 text-slate-800">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading': {
            if (block.level === 1) {
              return (
                <h1
                  key={idx}
                  className="text-xl sm:text-2xl font-bold text-[#1E3A8A] mt-6 mb-3 pb-2 border-b border-slate-200 tracking-tight break-words"
                >
                  {renderInlineMarkdown(block.text || '')}
                </h1>
              );
            }
            if (block.level === 2) {
              return (
                <h2
                  key={idx}
                  className="text-lg sm:text-xl font-bold text-[#1E3A8A] mt-5 mb-2.5 tracking-tight flex items-center gap-2 break-words"
                >
                  {renderInlineMarkdown(block.text || '')}
                </h2>
              );
            }
            if (block.level === 3) {
              return (
                <h3
                  key={idx}
                  className="text-base font-bold text-[#0F766E] mt-4 mb-2 tracking-tight break-words"
                >
                  {renderInlineMarkdown(block.text || '')}
                </h3>
              );
            }
            return (
              <h4
                key={idx}
                className="text-sm font-semibold text-slate-800 mt-3 mb-1.5 break-words"
              >
                {renderInlineMarkdown(block.text || '')}
              </h4>
            );
          }
          case 'code':
            return (
              <CodeBlockComponent
                key={idx}
                code={block.code || ''}
                lang={block.lang}
              />
            );
          case 'table':
            return (
              <TableBlockComponent
                key={idx}
                headers={block.headers || []}
                rows={block.rows || []}
              />
            );
          case 'blockquote':
            return (
              <blockquote
                key={idx}
                className="w-full overflow-x-auto my-3 border-l-4 border-[#0F766E] bg-teal-50/70 p-3.5 rounded-r-xl text-slate-700 text-xs sm:text-sm italic leading-relaxed break-words"
              >
                {renderInlineMarkdown(block.text || '')}
              </blockquote>
            );
          case 'hr':
            return <hr key={idx} className="border-t border-slate-200 my-6" />;
          case 'list': {
            if (block.ordered) {
              return (
                <ol
                  key={idx}
                  className="my-3 space-y-1.5 list-decimal list-inside text-xs sm:text-sm text-slate-700 pl-1"
                >
                  {(block.items || []).map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed break-words">
                      {renderInlineMarkdown(item)}
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul
                key={idx}
                className="my-3 space-y-1.5 list-disc list-inside text-xs sm:text-sm text-slate-700 pl-1"
              >
                {(block.items || []).map((item, itemIdx) => (
                  <li key={itemIdx} className="leading-relaxed break-words">
                    {renderInlineMarkdown(item)}
                  </li>
                ))}
              </ul>
            );
          }
          case 'paragraph':
          default:
            return (
              <p
                key={idx}
                className="my-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed break-words"
              >
                {renderInlineMarkdown(block.text || '')}
              </p>
            );
        }
      })}
    </div>
  );
};

interface DocumentationViewerProps {
  initialSlug?: string;
  onSlugChange?: (slug: string) => void;
  onReturnToWorkspace?: () => void;
  onReturnToLanding?: () => void;
}

export const DocumentationViewer: React.FC<DocumentationViewerProps> = ({
  initialSlug,
  onSlugChange,
  onReturnToWorkspace,
  onReturnToLanding
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(() => {
    if (initialSlug) {
      const found = MASTER_DOCUMENTS.find(
        d => d.slug.toLowerCase() === initialSlug.toLowerCase() ||
             d.path.toLowerCase().includes(initialSlug.toLowerCase()) ||
             initialSlug.toLowerCase().includes(d.id.toLowerCase())
      );
      if (found) return found.id;
    }
    return MASTER_DOCUMENTS[0].id;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  // Synchronize slug if initialSlug updates
  useEffect(() => {
    if (initialSlug) {
      const clean = initialSlug.replace(/^\/?(docs\/)?/, '').replace(/\.md$/, '');
      const found = MASTER_DOCUMENTS.find(
        d => d.slug.toLowerCase().includes(clean.toLowerCase()) ||
             clean.toLowerCase().includes(d.slug.toLowerCase())
      );
      if (found) setSelectedDocId(found.id);
    }
  }, [initialSlug]);

  const activeDoc = useMemo(() => {
    return MASTER_DOCUMENTS.find(d => d.id === selectedDocId) || MASTER_DOCUMENTS[0];
  }, [selectedDocId]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    MASTER_DOCUMENTS.forEach(d => {
      map.set(d.categoryNumber, d.categoryTitle);
    });
    return Array.from(map.entries()).map(([num, title]) => ({ num, title }));
  }, []);

  const filteredDocs = useMemo(() => {
    return MASTER_DOCUMENTS.filter(doc => {
      const matchesCat = selectedCategory === 'all' || doc.categoryNumber === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCat;
      const matchesText =
        doc.title.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query) ||
        doc.categoryTitle.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query);
      return matchesCat && matchesText;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyMarkdown = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeDoc.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([activeDoc.content], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeDoc.slug.split('/').pop() || 'document'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#0F766E] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="bg-[#1E3A8A] border-b border-blue-950 sticky top-0 z-40 shadow-sm text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-16 py-2 sm:py-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={onReturnToLanding || onReturnToWorkspace}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm ring-1 ring-white/20 hover:opacity-90 transition-opacity shrink-0"
              title="Return to App"
            >
              <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  Peer Notebook Documentation Hub
                </h1>
                <span className="hidden xs:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-800/90 border border-blue-700/80 text-blue-100 font-semibold shrink-0">
                  GA #8 Standard
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-200 truncate">
                33-Document Master Binder &amp; ADR Suite • CalAIM, Medi-Cal H0038 &amp; CalMHSA
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="#trust"
              className="min-h-[44px] px-3 sm:px-3.5 py-2 bg-blue-900/70 hover:bg-blue-800 text-blue-100 border border-blue-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trust Center</span>
            </a>
            {onReturnToWorkspace && (
              <button
                onClick={onReturnToWorkspace}
                className="min-h-[44px] px-3.5 sm:px-4 py-2 bg-[#0F766E] hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Launch Clinical Workspace</span>
              </button>
            )}
            {onReturnToLanding && (
              <button
                onClick={onReturnToLanding}
                className="min-h-[44px] px-3 sm:px-3.5 py-2 bg-blue-900/70 hover:bg-blue-800 text-blue-100 border border-blue-700/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Landing &amp; Checklist
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Documentation Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar: Navigation & Search */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          {/* Search Box */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search master documentation..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all"
              />
            </div>

            {/* Category Filter Pills - Flex-wrap to prevent clipping & overflow on narrow screens */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px]">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#1E3A8A] text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All (27)
              </button>
              {categories.map(c => (
                <button
                  key={c.num}
                  onClick={() => setSelectedCategory(c.num)}
                  className={`min-h-[36px] px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === c.num
                      ? 'bg-[#1E3A8A] text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cat {c.num}
                </button>
              ))}
            </div>
          </div>

          {/* Document List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 overflow-y-auto max-h-[calc(100vh-250px)] divide-y divide-slate-100">
            {filteredDocs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No matching documentation files found.
              </div>
            ) : (
              filteredDocs.map(doc => {
                const isSelected = doc.id === activeDoc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      onSlugChange?.(doc.slug);
                      if (typeof window !== 'undefined') {
                        window.location.hash = `#docs/${doc.slug}`;
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer my-1 ${
                      isSelected
                        ? 'bg-blue-50/80 border border-blue-200 shadow-xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#1E3A8A] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[10px] font-mono text-slate-400">
                          {doc.categoryNumber}
                        </span>
                        {doc.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                              doc.badgeColor || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {doc.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs font-semibold line-clamp-1 mt-0.5 ${
                          isSelected ? 'text-[#1E3A8A]' : 'text-slate-800'
                        }`}
                      >
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {doc.summary}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Main Panel: Document Reader */}
        <main className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col">
          {/* Breadcrumbs & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-[#0F766E]">
                Category {activeDoc.categoryNumber}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600 font-medium">
                {activeDoc.categoryTitle}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold truncate max-w-[130px] xs:max-w-[200px] sm:max-w-xs lg:max-w-sm">
                {activeDoc.title}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleCopyMarkdown}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy markdown text to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy MD</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download .md file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Document Header Metadata */}
          <div className="py-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold break-all">
                {activeDoc.path}
              </span>
              {activeDoc.badge && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${
                    activeDoc.badgeColor || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {activeDoc.badge}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A] tracking-tight break-words">
              {activeDoc.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed break-words">
              {activeDoc.summary}
            </p>
          </div>

          {/* Reading Mode Switcher & Responsive Body */}
          <div className="py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('formatted')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'formatted'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Formatted View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('raw')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'raw'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Raw Markdown</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Deterministic Parser • Responsive Stackable Blocks
            </span>
          </div>

          {/* Formatted Markdown Content Body - Strict zero-overflow & auto-scroll for wide markdown tables */}
          <article className="py-5 flex-1 text-slate-800 leading-relaxed text-sm w-full min-w-0">
            {viewMode === 'formatted' ? (
              <div className="w-full min-w-0">
                <ResponsiveMarkdownRenderer content={activeDoc.content} />
              </div>
            ) : (
              <div className="w-full overflow-x-auto p-4 sm:p-6 bg-slate-900 rounded-2xl border border-slate-800 text-emerald-300 font-mono text-xs leading-relaxed whitespace-pre shadow-inner">
                {activeDoc.content}
              </div>
            )}
          </article>

          {/* Reader Footer Navigation with Master Trust Anchors */}
          <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>CalAIM H0038 Verified</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] border border-emerald-200 font-bold text-[11px]">
                HIPAA/CMIA Aligned
              </span>
              <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0F766E] border border-teal-200 font-bold text-[11px]">
                CalMHSA Standard Compliant
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="mailto:support@peernotebook.com"
                className="text-[#0F766E] hover:text-[#1E3A8A] hover:underline flex items-center gap-1 font-semibold"
                title="Email Documentation Support"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>support@peernotebook.com</span>
              </a>
              <span className="text-slate-300">·</span>
              <a
                href={`https://github.com/optimumprimers/peernotebook/blob/master${activeDoc.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
              >
                <span>GitHub Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
