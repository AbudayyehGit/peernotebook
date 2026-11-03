# Model County Intergovernmental CalAIM H0038 Peer Services Subcontract
**Document ID:** PN-LEGAL-2026-COUNTY-001 • **California DHCS CalAIM BHIN Standard**  
**Category:** 07-legal-administrative • **Regulatory:** California SB 803 / CalMHSA / Medi-Cal CalAIM  
**Organization:** Peer Notebook LLC • **Target Domain:** [peernotebook.com](https://peernotebook.com)  
**Standard:** H. Joe Abudayyeh Systems Production Standards  
**Copyright:** © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.  

---

## 1. Intergovernmental Master Framework

This Model Subcontract Agreement ("Agreement") is established for County Mental Health Plans (MHPs), Drug Medi-Cal Organized Delivery Systems (DMC-ODS), and contracted Community-Based Organizations (CBOs) utilizing **Peer Notebook** (`peernotebook.com`) for Medi-Cal CalAIM HCPCS H0038 service logging and supervisory oversight.

WHEREAS, County operates behavioral health programs under California's CalAIM (California Advancing and Innovating Medi-Cal) transformation; and

WHEREAS, California Senate Bill 803 (SB 803) establishes Certified Peer Support Specialists as an authorized Medi-Cal provider type under Behavioral Health Information Notice (BHIN) guidance; and

WHEREAS, Peer Notebook LLC provides an offline-first, zero-AI deterministic software platform conforming to California DHCS documentation rules, ANSI X12 837P EDI batch claims, and HL7 FHIR R4 interoperability;

NOW, THEREFORE, the participating County Behavioral Health Department, CBO Contractor, and Technology Provider agree to the following terms:

---

## 2. Service Definitions & Billing Parameters

1. **HCPCS Procedure Code H0038:**
   * Procedure Code: `H0038` (Self-help/peer services, per 15 minutes).
   * Modifiers: `U1` (Individual encounter), `U2` (Group session), `GQ` (Telehealth / audio-only under POS 02).
   * Unit Calculation: Strict CMS 8-minute rounding formula:
     * 8 – 22 minutes = 1 Unit
     * 23 – 37 minutes = 2 Units
     * 38 – 52 minutes = 3 Units
     * 53 – 67 minutes = 4 Units
2. **Place of Service (POS) Codes:**
   * POS `15`: Mobile / Field encounters (parks, encampments, client homes, community centers).
   * POS `11`: CBO clinic / agency office.
   * POS `02`: Telehealth / secure phone consultation.
3. **Daily Cap Limitation:** Total units logged per client across all specialists shall not exceed twenty-four (24) units (6 hours) per calendar day pursuant to county billing limitations.

---

## 3. Clinical Supervision & Electronic Attestation

1. **Qualified Supervisory Credentials:** Pursuant to CalMHSA guidelines, all peer encounter notes must be cosigned by a Qualified Supervisor holding one of the following active California licenses or certifications:
   * Licensed Clinical Social Worker (LCSW)
   * Licensed Marriage and Family Therapist (LMFT)
   * Licensed Professional Clinical Counselor (LPCC)
   * Licensed Clinical Psychologist (PhD / PsyD)
   * California Peer Support Specialist Supervisor (CPSS-S with 2+ years verified field experience)
2. **Cryptographic Attestation Seal:** All supervisor approvals must be electronically executed and bound to the note via SHA-256 digital attestation hashing within seventy-two (72) hours of note drafting.

---

## 4. EHR Interoperability & Claims Interchange

1. **ANSI X12 837P Generation:** The platform shall generate compliant 837P Electronic Data Interchange claim batch records for direct transmission to County Medi-Cal clearinghouses.
2. **HL7 FHIR R4 Write-Back:** Encounter, Observation, and DocumentReference bundles shall be exported in standard JSON format for county EHR ingestion (Epic, Cerner, Netsmart Avatar / myAvatar).
3. **Audit Readiness:** All records are preserved for a statutory minimum of ten (10) years with immutable SHA-256 chained audit logs.

---

## 5. Certification & Endorsement

**Executed for County Behavioral Health / Community Partner:**  
Agency Name: ________________________________  
County Code: ________________________________  
Authorized Official: __________________________  
Signature: ___________________________________  
Date: _______________________________________  

**Executed for Technology Provider:**  
Peer Notebook LLC  
_/s/ H. Joe Abudayyeh_  
H. Joe Abudayyeh, Managing Member  
Date: November 3, 2026 (2026-2027 Term)  
Corporate Stamp: `[PEER NOTEBOOK LLC - CALAIM SUB-CONTRACT FRAMEWORK SEAL]`  
