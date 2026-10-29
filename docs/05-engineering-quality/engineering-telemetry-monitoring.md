# Engineering Telemetry, Storage Monitoring & Self-Diagnostics

**Document Version:** 1.0-GA  
**Target Module:** `/engineering/monitoring`  
**Standard:** GA #8 Production Architecture • Zero-Trust Deterministic Engine  
**Domain:** peernotebook.com

---

## 1. Overview
The **Engineering Telemetry Portal (`/engineering/monitoring`)** provides runtime visibility into client-side storage, synchronization queues, cryptographic audit trails, and transactional email dispatch.

### Core Architecture Components:
1. **IndexedDB (Dexie.js) Table Capacities & Storage Quota:**
   - Real-time disk utilization queries via `navigator.storage.estimate()`
   - Exact record counts across `clients`, `session_notes`, `audit_logs`, and `sync_queue`
2. **Background Sync Worker Telemetry:**
   - Online / offline connectivity state
   - Pending mutation backlog in `sync_queue`
   - Latency to Supabase PostgreSQL cluster
   - Last successful sync timestamp
3. **Cryptographic SHA-256 Audit Integrity Validator:**
   - Validates tamper-proof SHA-256 checksums across all stored audit log events
   - Real-time detection of data tampering, field modification, or unauthorized record injection
4. **Transactional Email Monitor:**
   - Monitors 6-digit PIN OTP delivery and Resend API gateway
   - Fallback domain routing (`onboarding@resend.dev`) to prevent silent failures
5. **Interactive In-Browser Self-Diagnostic Test Suite:**
   - 1-click execution of automated checks:
     - IndexedDB read/write latency test
     - WebCrypto SHA-256 engine verification
     - CalAIM 15-minute billing unit calculator validation
     - Offline sync queue ingestion test
     - Non-clinical jargon sanitization test
     - ANSI 837P batch claim serializer validation
