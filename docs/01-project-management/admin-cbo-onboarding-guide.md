# Community-Based Organization (CBO) Onboarding & Administrative Guide

**App URL Route:** `/admin/dashboard` & `#admin/dashboard`  
**Target Audience:** CBO Executive Directors, Clinical Supervisors (LCSW/LMFT), Compliance Officers, and Billing Managers  
**Framework:** CalAIM Behavioral Health Payment Reform & California Medi-Cal H0038 Peer Services  

---

## 1. Executive Summary

Community-Based Organizations (CBOs) play a pivotal role in delivering Medi-Cal CalAIM Community Supports, Enhanced Care Management (ECM), and county specialty mental health services. Peer Notebook provides CBOs with an enterprise multi-tenant administrative portal to manage provider rosters, enforce clinical supervision cosignature workflows, monitor monthly billable volume, and export standard EHR / ANSI 837P claims batches.

---

## 2. Six-Step Guided CBO Onboarding Checklist

Peer Notebook tracks onboarding progress dynamically in `AdminDashboard.tsx` across six mandatory milestones:

### Step 1: Execute Business Associate Agreement (BAA) with County / DHCS
- Legally binds client record confidentiality under California CMIA (Civil Code § 56) and federal HIPAA safeguards.
- Standard version deployed: `v2.4-GA8-CalAIM`.

### Step 2: Configure Medi-Cal County Provider ID & NPI
- Configures the agency's 10-digit National Provider Identifier (NPI) and County Medi-Cal Provider Number.
- Automatically populated into ANSI X12 837P Professional Claim Batches:
  - **Loop 2000A (Billing Provider):** CBO Entity Name, NPI, Tax ID.
  - **Loop 2000B (Subscriber / Client):** Client Identifier, Medi-Cal CIN.
  - **Loop 2400 (Service Line):** HCPCS H0038, Modifiers (e.g. HQ for group, U8 for ECM), Units.

### Step 3: Designate Clinical Supervisor Cosigning Protocol
- Enforces multi-tier Role-Based Access Control (RBAC):
  - `peer_specialist`: Formulates and signs initial encounter notes.
  - `supervisor` (LCSW / LMFT / LPCC): Audits, provides feedback, requests revisions, and executes digital cosignature.
  - `admin`: Manages roster, contracts, and export pipelines.

### Step 4: Enforce CMS 8-Minute Billing Increment Accounting
- Guarantees deterministic calculation under CMS and DHCS CalAIM rounding rules:
  $$\text{Units} = \lfloor \frac{\text{BillableMinutes} + 7}{15} \rfloor$$
- Billing brackets:
  - `< 8 mins`: 0 units (Non-billable)
  - `8–22 mins`: 1 unit
  - `23–37 mins`: 2 units
  - `38–52 mins`: 3 units
  - `53–67 mins`: 4 units

### Step 5: Specialist Staffing (W-2 Employees vs. 1099 Contractors)
- Supports hybrid agency staffing:
  - **W-2 Employees:** Direct agency payroll withholding, standard clinical supervision queue.
  - **1099 Contractors:** Tax ID tracking (EIN/SSN), hourly billable rate ($45/hr default), and IRS mileage reimbursement ($0.67/mile) for community field travel.

### Step 6: Verify EHR Interoperability
- Test export pipeline to county electronic health record systems using:
  - **HL7 FHIR R4:** Document Bundle with US Core ClinicalImpression.
  - **HL7 v2.5.1:** `MDM^T02` Medical Document Notification message string.
  - **HL7 C-CDA R2.1:** Consolidated Clinical Document Architecture Progress Note XML.

---

## 3. CalAIM Capacity & Revenue Tracking

The dashboard calculates real-time agency volume metrics:
- **Allocated Monthly Units:** Monthly contract allocation (e.g., 1,200 units).
- **Logged Units:** Sum of units across active encounters.
- **Estimated Reimbursement:** Calculated against the California county benchmark of **$32.50 per 15-minute unit** ($130.00/billable hour).
