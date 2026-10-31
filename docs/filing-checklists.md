# Operational Intellectual Property Filing Checklists & Regulatory Compliance Execution

---

## 1. USPTO Trademark Filing Checklist: "PEER NOTEBOOK"

### 1.1 International Class Selection
- **Class 042 (Primary):** Software as a Service (SaaS) featuring software for healthcare documentation, peer support specialist clinical encounter note management, Medi-Cal CalAIM H0038 billing code translation, and electronic health record (EHR) interoperability.
- **Class 009 (Companion):** Downloadable computer software and mobile application software for clinical workflow management, offline-first client encounter tracking, and healthcare provider compliance logging.

### 1.2 Statutory Specimen Preparation (37 C.F.R. § 2.56; TMEP § 904.03(i))
A service mark specimen for Class 42 SaaS must show the applied-for mark directly associated with the sale, advertising, or rendering of the software services. A mere marketing flyer or passive logo without service functionality will trigger an Office Action rejection.

#### Specimen Technical Execution Protocol:
1. **Viewport & Display Standard:**
   - Capture a clean, full-browser desktop screenshot showing the live URL bar (`https://peernotebook.com` or `https://peernotebook.com/app`).
   - The screenshot must legibly display the system clock and calendar date at the bottom or top of the OS frame (or provide a verified screenshot timestamp).
2. **Prominent Mark Association:**
   - The mark **"Peer Notebook"** must appear prominently in the application header/navigation banner in direct proximity to the active clinical workspace controls (e.g., "Encounter Notes", "CalAIM H0038 Validator", "Client Roster").
3. **Transactional/Rendering Evidence:**
   - The specimen must depict either:
     - **Option A (Point-of-Sale / Account Gateway):** The live pricing/subscription checkout screen displaying "Solo Pro - $19/mo" or "CBO Agency Tier", complete with active subscription action button ("Upgrade to Solo Pro") and clear service description.
     - **Option B (In-Use Service Rendering):** The logged-in active clinical documentation workspace showing a drafted CalAIM note, the active H0038 15-minute billing calculator, and the peer support electronic signature block.
4. **File Specifications:**
   - Format: JPG or PDF format, RGB color profile, minimum 300 DPI, maximum file size 5 MB.
   - Do NOT submit digital mockups, Figma artboards, or altered graphics. Specimen must represent the live, functioning production build.

---

## 2. U.S. Copyright Office (USCO) Source Code Deposit & Redaction Protocol
### Statutory Authority: 17 U.S.C. § 408; 37 C.F.R. § 202.20(c)(2)(vii)(A)(2)

To register copyright in the Peer Notebook computer program while securing statutory trade secret status under 37 C.F.R. § 202.20, the applicant must deposit identifying portions of the source code according to one of the approved statutory trade secret deposit alternatives.

### 2.1 Statutory Trade Secret Deposit Options (Choose Option 1 or 2)
- **Option 1 (First and Last 25 Pages with Redactions):**
  - Extract the first 25 pages and last 25 pages of human-readable source code (or the entire program if under 50 pages).
  - Redact up to **50%** of the lines on each page containing proprietary trade secrets (e.g., proprietary billing formulas, state machine transition tables, cryptographic hashing logic).
  - The unredacted portion must contain a sufficient quantity of original copyrightable computer code to allow the Copyright Office to determine copyrightability.
- **Option 2 (Clean First & Last 10 Pages without Redactions):**
  - Submit the first 10 pages and last 10 pages of human-readable source code with **zero redactions**, provided no trade secret logic appears on those specific 20 pages.
- **Option 3 (First & Last 25 Pages of Object Code):**
  - Submit object code printouts accompanied by a Rule of Doubt letter (not recommended due to evidentiary burdens in litigation).

*Standard Recommendation:* Execute **Option 1** to maximize documented code footprint while blocking proprietary translation tables.

### 2.2 Mechanical Extraction & Formatting Requirements
1. **Compilation Script:**
   - Extract continuous human-readable source files from `/src` (e.g., `App.tsx`, `peerNotebookDatabase.ts`, `checklistStateService.ts`, `ehrIntegrationService.ts`, `stripeBillingService.ts`, `SessionNoteForm.tsx`).
   - Concatenate code into a single sequential text document.
2. **Page & Layout Constraints:**
   - Page count: Exactly the first 25 numbered pages and the last 25 numbered pages (Total: 50 pages).
   - Font: Monospaced 10pt (Courier or Courier New).
   - Margins: 1 inch on all sides.
   - Headers: Document title ("Peer Notebook Client SPA & Translation Engine v1.2"), Date of Creation (2025/2026), and continuous page numbering ("Page X of 50").
   - Copyright Notice: Include on Page 1: `// Copyright © 2026 Peer Notebook LLC. All Rights Reserved.`
3. **Redaction Standard (Black-Out Protocol):**
   - Apply solid black rectangular redactions over proprietary business logic:
     - CMS 15-minute billing calculation formulas and county rate matrices.
     - Database schema encryption salt and SHA-256 integrity hashing procedures.
     - Supabase RPC internal endpoints and Brevo REST API payload parameter builders.
   - Ensure redactions do NOT obscure more than 50% of the total lines of code on any single page.
   - Retain standard UI rendering, event listeners, component lifecycle methods, and TypeScript type signatures in unredacted text to prove copyrightable authorship.
4. **Deposit File Format:**
   - Single searchable PDF document.
   - File size under 500 MB for eCO online submission portal upload.

---

## 3. Formal Filing Workstep Sequence

| Step | Action Item | Platform / System | Documentation Required | Estimated Processing Time |
| :--- | :--- | :--- | :--- | :--- |
| **01** | Execute Founder-to-LLC IP Assignment Agreement | Internal LLC Corporate Records | Executed Assignment Agreement + Schedule A Asset List | Immediate (Day 1) |
| **02** | Generate 50-Page Redacted Source Code PDF | Local Build Environment (`scripts/extract_deposit.sh`) | 50-page PDF meeting 37 C.F.R. § 202.20 | 1 Business Day |
| **03** | Submit Form TX Electronic Application | USCO eCO Portal (`copyright.gov`) | Redacted Code PDF + $65 statutory fee | 3–6 months for certificate |
| **04** | Capture Timestamped Live Production Specimen | Browser viewport on `peernotebook.com` | Full-screen screenshot showing SaaS mark & live UI | 1 Hour |
| **05** | Submit TEAS Plus Trademark Application | USPTO TEAS Portal (`uspto.gov`) | Specimen image + Class 042 description + $250 fee | 9–12 months for first action |
