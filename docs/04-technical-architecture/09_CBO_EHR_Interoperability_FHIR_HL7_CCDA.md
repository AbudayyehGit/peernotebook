# CBO EHR Interoperability Specification: HL7 FHIR R4, HL7 v2.5.1 & C-CDA Progress Notes

**Document Version:** 1.0.0-GA  
**Target Domain:** peernotebook.com  
**Standard Authority:** HL7 International, ONC Cures Act 2015 Edition, California DHCS CalAIM  
**Implementation Source:** `src/services/ehrIntegrationService.ts`

---

## 1. Architectural Overview & Clinical Purpose

Community-Based Organizations (CBOs) contracting with California County Behavioral Health Departments under CalAIM require bidirectional or export-ready interoperability with enterprise Electronic Health Record (EHR) platforms (e.g., Epic, Cerner, Netsmart myAvatar, Welligent, Qualifacts Credible/CareLogic).

Peer Notebook adheres to strict zero-PII cloud leakage principles while providing full client-side generation and export of standard clinical exchange formats directly from encrypted local IndexedDB storage (Dexie.js).

```
+-------------------------------------------------------------------------+
|                  Dexie.js Local Vault (Client Encrypted)                |
|           Session Notes (H0038) + Client Profile + CBO Provider         |
+-------------------------------------------------------------------------+
                                    |
                    EhrIntegrationService (Client-Side)
                                    |
         +--------------------------+--------------------------+
         |                          |                          |
         v                          v                          v
+------------------+      +--------------------+      +------------------+
|   HL7 FHIR R4    |      |    HL7 v2.5.1      |      |   C-CDA R2.1     |
|   Bundle (.json) |      | Clinical Msg (.hl7)|      | Progress (.xml)  |
+------------------+      +--------------------+      +------------------+
```

---

## 2. HL7 FHIR R4 Specifications

### Resource Composition
- **Bundle Type:** `transaction` or `collection` (URN UUID addressing)
- **Patient Resource:** Medi-Cal CIN (System: `urn:oid:2.16.840.1.113883.4.3.06`), gender, birthDate.
- **Practitioner Resource:** CPSS-CA practitioner with National Provider Identifier (NPI) (`http://hl7.org/fhir/sid/us-npi`).
- **Encounter Resource:**
  - Status: `finished`
  - Class: `AMB` (Ambulatory)
  - Type: HCPCS `H0038` (Self-help/peer services, per 15 minutes)
  - Period: Exact start and end timestamps.
  - ServiceProvider: CBO Agency Organization reference.
- **DocumentReference Resource:**
  - Status: `current`
  - Type: LOINC `11488-4` (*Consultation note*)
  - Category: LOINC `LP173418-7` (*Behavioral health*)
  - Content Attachment: UTF-8 Base64 encoded four-part CalAIM encounter documentation (Goal Addressed, Peer Intervention, Client Response, Plan & Next Steps).

---

## 3. HL7 v2.5.1 Pipe-and-Hat Standard (MDM^T02 / ORU^R01)

### Segment Mappings
- **`MSH` (Message Header):** Delimiters `|^~\&`, Sending Application `PEER_NOTEBOOK`, Message Type `MDM^T02^MDM_T01` (Medical Document Management Notification), Processing ID `P`.
- **`PID` (Patient Identification):** Client ID, Medi-Cal CIN, Masked or Preferred Name.
- **`PV1` (Patient Visit):** Patient Class `O` (Outpatient), Assigned Location (POS 15 - Mobile Unit / Field), Attending Doctor CPSS-CA NPI and Name, Encounter Timestamp.
- **`TXA` / `OBR` (Document / Observation Request):** Universal Service Identifier `H0038^Self-Help/Peer Services 15m^HCPCS`.
- **`OBX` (Observation / Results Narrative Segments):**
  - `OBX|1|TX|GOAL^Careplan Goal Addressed^LN||...`
  - `OBX|2|TX|INTERVENTION^CPSS Lived Experience & Peer Mentoring^LN||...`
  - `OBX|3|TX|RESPONSE^Client Direct Engagement & Recovery Progress^LN||...`
  - `OBX|4|TX|PLAN^Collaborative Next Steps & Safety Continuity^LN||...`
  - `OBX|5|NM|H0038_UNITS^CalAIM Billable Units^LN||<Units>|{units}|`

---

## 4. HL7 CDA Release 2.1 (C-CDA Progress Note XML)

### Header & Template Identification
- **Document Type:** US Realm Header (Template `2.16.840.1.113883.10.20.22.1.1`).
- **Document Standard:** Progress Note (Template `2.16.840.1.113883.10.20.22.1.9`).
- **Document Code:** LOINC `11506-3` (*Progress note*).
- **Confidentiality:** `N` (Normal) with CMIA & HIPAA Safe Harbor pseudonymization.

### Structured Narrative Sections (LOINC)
1. **Assessment & Goals Section:** LOINC `51848-0` (*Evaluation and Plan Note*).
2. **Interventions Section:** LOINC `29554-3` (*Procedure Narrative* / Peer Support Mentoring).
3. **Subjective & Response Section:** LOINC `29299-5` (*Reason for Visit / Response Narrative*).
4. **Plan of Treatment Section:** LOINC `18776-5` (*Treatment Plan*).

---

## 5. Security & Multi-Tenant Data Portability

- Zero-Trust Client Verification: Encrypted browser-side generation ensures no unencrypted Protected Health Information (PHI) crosses intermediate proxies.
- Interoperability Export Triggers: Available in `SettingsPanel.tsx` under Data Portability and through programmatic invocations via `EhrIntegrationService`.
- Audit Trail Integrity: Every clinical data export logs an immutable SHA-256 verifiable entry to `audit_logs` in IndexedDB and Supabase PostgreSQL.
