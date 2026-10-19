# GA #8 Production-Grade Architecture White Paper
**System Classification:** Enterprise Behavioral Health & Peer Support EHR
**Maturity Tier:** GA #8 (Production Hardened)
**Target Platform:** Progressive Web Application (PWA) with Offline-First Dual Persistence
**Canonical Source:** https://peernotebook.com/docs/04-technical-architecture/GA8_Production_Grade_Architecture_White_Paper

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
```
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
```

1. **Zero-Latency Local Commits:** Every client interaction, draft note, and electronic signature is written first to the client-side Dexie.js transactional datastore.
2. **Deterministic Background Sync Worker:** An idempotent worker processes the local `sync_queue`. When network connectivity resumes, mutations are flushed to Supabase with automatic retry, exponential backoff, and timestamp-based conflict resolution.
3. **Multi-Tenant Row-Level Security (RLS):** Database policies strictly restrict visibility to authorized agency boundaries (`organization_id`) and role credentials (`user_role`).

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
  $$\text{Total Billable Minutes} = \text{Face-to-Face Direct Service} + \text{Field Travel Time} + \text{Direct Documentation Time}$$
* **Structured DAP Narrative Format:**
  * **Data / Strengths-Based Goal:** Client-centered recovery plan objective.
  * **Assessment / Peer Intervention:** Specific CPSS interventions (lived experience sharing, somatic grounding, system navigation).
  * **Plan / Response:** Measurable client reaction, direct client quotes, and follow-up milestones.

---

## 4. Security, BAA, & Cryptographic Audit Trail
* **HIPAA 45 CFR § 164.312(b):** Immutable audit ledger capturing every client record view, encounter modification, supervisor approval, and export action.
* **Tamper-Evident SHA-256 Hashes:** Each audit entry calculates a deterministic SHA-256 checksum over the actor ID, action, target entity, and timestamp.
* **42 CFR Part 2 Substance Use Confidentiality:** Client identities utilize pseudonymized Medical Record Numbers (MRN format `PN-XXXX`), insulating beneficiaries against unauthorized disclosure.
