# HIPAA Security Rule, BAA Compliance & Client Consent Model

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Regulatory Standards:** HIPAA Security Rule (45 CFR Part 160 & Part 164, Subparts A and C) / California Confidentiality of Medical Information Act (CMIA)  
**Canonical Source:** https://peernotebook.com/docs/04-technical-architecture/08_HIPAA_BAA_Consent_Model

---

## 1. Business Associate Agreement (BAA) Architecture
When deployed for covered entities (health plans, county behavioral health agencies, community mental health centers), Peer Notebook operates as a Business Associate under HIPAA:

* **Supabase Cloud Infrastructure:** Covered under enterprise BAA providing physical, technical, and administrative safeguards.
* **Vercel Edge Global Hosting:** Configured in strict stateless edge mode; no Protected Health Information (PHI) is logged or stored in edge server caches.
* **Client Local Sandbox:** Field tablet storage runs in browser origin sandbox with IndexedDB encryption.

---

## 2. 45 CFR § 164.312 Technical Safeguards Checklist
* **§ 164.312(a)(1) Access Control:** Unique user identification, automatic session timeout, and role-based access restrictions.
* **§ 164.312(b) Audit Controls:** Mechanisms to record and examine activity in systems containing or using electronic protected health information (ePHI) via `audit_trail_logs`.
* **§ 164.312(c)(1) Integrity:** Electronic mechanism to corroborate that ePHI has not been altered or destroyed without authorization via SHA-256 digital seals.
* **§ 164.312(d) Transmission Security:** End-to-end TLS 1.3 encryption for all data traversing public communication networks.

---

## 3. Client Digital Consent Model
In accordance with California CMIA (Civil Code § 56.11), client consent for peer support documentation is established:
1. **Voluntary Participation Notice:** Informs peer that services are non-clinical, lived-experience peer recovery mentoring.
2. **Confidentiality Limits:** Explains mandatory reporting exceptions (harm to self/others, child/elder abuse).
3. **Information Sharing Scope:** Authorizes documentation sharing with the designated supervising agency for Medi-Cal reimbursement.
