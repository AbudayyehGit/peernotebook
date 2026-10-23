# MVP Feature Specification (MOD-01 through MOD-05)

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Standard:** CalAIM & Medi-Cal H0038 Alignment

---

## Module Overview
Peer Notebook GA #8 is structured around five cohesive architectural modules:

### MOD-01: Encounters & 4-Part Note Logging Engine
* **Single-Screen Capture:** Continuous vertical form stack with immediate field responsiveness.
* **4-Part Note Fields:**
  1. Recovery Plan Goal Addressed (text, min 10 chars).
  2. Peer Intervention Selected (interactive CalMHSA competency pills + details).
  3. Client Engagement & Verbatim Direct Quotes (enforces quotes for compliance).
  4. Next Steps & Scheduled Follow-up (concrete date and action).
* **Validation Engine:** Real-time badge indicators for compliance readiness.

### MOD-02: CalAIM H0038 3-Way Time Tracker
* **Direct Minutes:** Face-to-face service duration.
* **Travel Minutes:** Field transit time.
* **Documentation Minutes:** Note preparation time.
* **Automated Unit Conversion:** CMS 8-minute rule table calculation (0-6+ units).
* **Billing Warning:** Flags encounters < 8 minutes as non-billable for county reimbursement.

### MOD-03: Dual-Layer Persistence & Offline Synchronization
* **Local Layer:** Dexie.js (IndexedDB) database initialized on app load.
* **Cloud Layer:** Supabase PostgreSQL cluster with Row-Level Security (RLS).
* **Sync Worker:** Background queue listener that synchronizes unsaved notes when connectivity resumes.
* **Visual Status Pill:** Forest Green (`#16A34A`) when synced, Warm Amber (`#D97706`) with count when queued offline.

### MOD-04: Client Roster & Profile Management
* **Basic Client Demographics:** Client identifier (MRN/Alias), pronouns, county case number, phone, active recovery goals.
* **Encounter History:** Chronological reverse-sorted history of past sessions with filter by specialist.
* **Emergency Safety Contacts:** Rapid access to harm reduction resources and natural support contacts.

### MOD-05: PDF Note Export & Tamper-Evident Audit Trails
* **Cryptographic Hashing:** Computes SHA-256 hash of finalized note fields upon lock.
* **Client-Side PDF Generation:** jsPDF formatted note ready for printing or attaching to county EHRs.
* **Cosign & Approval Stamp:** Formatted signature lines for Certified Peer Specialist and Clinical Supervisor.
