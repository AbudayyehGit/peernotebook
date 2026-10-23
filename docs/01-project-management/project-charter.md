# Peer Notebook Project Charter & Initiation Document (PID)

**Document Version:** 1.1-GA (Production Release)  
**Classification:** Internal Governance & Systems Engineering  
**Target Domain:** peernotebook.com  
**Maintainer:** Optimum Primers Architecture & Governance Lead  
**Regulatory Framework:** California SB 803 / CalMHSA / Medi-Cal CalAIM (HCPCS H0038)

---

## 1. Project Mission & Problem Statement
Certified Peer Support Specialists (CPSS) are healthcare workers with lived experience in mental health, substance use recovery, or community trauma who deliver crucial non-clinical navigation, de-escalation, and goal-directed mentoring. 

Legacy Electronic Health Records (EHR) fail peer specialists in three ways:
1. **Connectivity Failure in the Field:** County mobile outreach often takes place in basements, encampments, and rural zones where traditional cloud EHRs freeze and wipe unsaved text.
2. **Clinical Language Mismatch:** Traditional EHRs enforce DSM-5 diagnostic codes and clinical psychopathology terms that directly contradict non-clinical peer support recovery philosophy.
3. **CalAIM Billing Inefficiencies:** California's CalAIM payment reform requires strict 15-minute billing unit conversions (CMS 8-minute rule) and separation of direct contact, travel, and documentation time. Manual calculations cause claim denials and revenue loss for community agencies.

**Peer Notebook** is purpose-built to solve these challenges: providing an offline-first, dual-persistence Progressive Web Application (PWA) that records trauma-informed encounter notes in under 90 seconds while automatically calculating Medi-Cal H0038 billing units.

---

## 2. Scope Boundaries

### In Scope (GA #8 Release)
* **Single-Screen Encounter Logging:** Streamlined 4-part clinical note structure (Goal Addressed, Peer Intervention, Client Response with Quotes, Next Steps).
* **CalAIM & Medi-Cal H0038 Engine:** Automatic calculation of 15-minute billing units based on direct face-to-face minutes, travel time, and documentation duration.
* **Dual-Layer Persistence:** Client-side Dexie.js (IndexedDB) with instant local commits paired with Supabase PostgreSQL cloud sync upon reconnection.
* **Touch-First Accessibility:** Minimum 44px–48px touch targets, soft slate trauma-informed color scheme (`#F8FAFC`, `#1E3A8A`, `#0F766E`), and WCAG 2.2 Level AA compliance.
* **Immutable Audit Trail:** SHA-256 cryptographic hashing and HIPAA 45 CFR § 164 compliant change logs.

### Out of Scope (Explicit Anti-Goals)
* Artificial Intelligence (AI) generation of clinical encounter text (to prevent non-authentic clinical hallucination).
* Complex multi-nested psychiatric diagnostic diagnostic coding trees.
* Full enterprise billing clearinghouse adjudication (Peer Notebook exports validated billing-ready records to county clearinghouses).

---

## 3. Success Metrics & KPIs
* **Encounter Documentation Time:** Reduce average peer note documentation time from 18 minutes to < 3 minutes.
* **Offline Reliability:** 100% data retention during unexpected disconnections with zero primary key collisions.
* **Audit Compliance:** 0% Medi-Cal H0038 note rejection rate due to missing 4-part elements or incorrect unit calculation.
* **Field Specialist Usability:** System Usability Scale (SUS) score > 88 across mobile field tablet testing cohorts.
