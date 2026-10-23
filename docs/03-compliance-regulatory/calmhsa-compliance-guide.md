# CalMHSA & California SB 803 Certification Compliance Guide

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Certifying Entity:** California Mental Health Services Authority (CalMHSA)  
**Governing Statute:** California SB 803 / Welfare and Institutions Code § 14045.5

---

## 1. Regulatory Background
Senate Bill 803 required the California Department of Health Care Services (DHCS) to establish statewide standards for Medi-Cal Peer Support Specialists. CalMHSA was designated as the certifying entity responsible for approving curriculum, certifying specialists, and setting supervisory standards.

---

## 2. Key Supervisory & Documentation Mandates
1. **Supervisory Oversight:** All Medi-Cal peer support encounters billed to county behavioral health plans must receive supervisory review from an authorized Peer Support Specialist Supervisor or licensed clinician (LCSW, LMFT, LPCC, Clinical Psychologist, or Psychiatrist).
2. **Timeliness of Documentation:** Notes must be completed, locked, and submitted for cosigning within **72 business hours** of the field encounter.
3. **Audit Trail Immutability:** Once cosigned, records must be permanently locked against retrospective modification unless accompanied by an explicit, auditable addendum notation.
4. **Non-Clinical Demarcation:** Notes must never state clinical formulations (e.g. "Specialist treated client's Borderline Personality Disorder")—doing so risks severe audit clawbacks and exceeds legal peer scope of practice.

---

## 3. How Peer Notebook Enforces Compliance
* **Automated Cosign Generation:** Exported PDFs include formalized supervisory signature blocks with date stamps and credential designations.
* **Addendum Management:** Any post-lock annotation is stored in the `audit_trail_logs` table with previous state preservation.
* **Boundary Guard:** Inline linting alerts specialists if clinical psychotherapy phrases are inadvertently keyed in.
