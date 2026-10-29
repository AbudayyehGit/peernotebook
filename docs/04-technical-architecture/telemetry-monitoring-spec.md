# Engineering Telemetry & System Monitoring Specification

**App URL Route:** `/engineering/monitoring` & `#telemetry`  
**Architecture Grade:** GA #8 Production  
**Component:** `src/components/EngineeringMonitoring.tsx`  
**Target:** Engineering, DevOps, and Security Compliance Teams  

---

## 1. Overview & Architectural Boundaries

Peer Notebook operates as a zero-trust, offline-first progressive web application. Telemetry must never leak unencrypted Protected Health Information (PHI) or Personally Identifiable Information (PII). The Engineering Telemetry Portal provides live system observability into:

1. **Client-Side Storage Engine (Dexie.js / IndexedDB)**
2. **Background Sync Worker & Network Health**
3. **Cryptographic SHA-256 Audit Trail Checksum Validation**
4. **Transactional Email Dispatch Pipeline (Resend API)**
5. **In-Browser Diagnostic Test Suite Execution**

---

## 2. Storage Subsystem Telemetry

- **Database Identifier:** `PeerNotebook_GA8_DB`
- **Schema Version:** `1`
- **Tables Monitored:**
  - `clients`: Pseudonymized client roster and CalAIM goals.
  - `session_notes`: CalAIM H0038 DAP notes and billable durations.
  - `audit_logs`: Tamper-proof event logs.
  - `sync_queue`: Pending mutation items for Supabase PostgreSQL.
  - `organizations`: Multi-tenant agency parameters.
  - `users`: Specialist credentials, roles, and tax classifications.
  - `settings`: System configurations and encryption parameters.
- **Quota Measurement:** Evaluated dynamically via `navigator.storage.estimate()` returning bytes used, bytes available, and utilization percentage.

---

## 3. Bi-Directional Sync Worker Telemetry

The sync worker (`src/services/syncWorker.ts`) operates a deterministic queue-based replication model:
- **Network State Listener:** Binds to `window.addEventListener('online')` and `window.addEventListener('offline')`.
- **States:** `idle` | `syncing` | `offline` | `error`.
- **Retry Backoff Schedule:** Exponential backoff sequence ($1\text{s} \to 2\text{s} \to 4\text{s} \to 8\text{s} \dots$) capped at 60 seconds with automatic jitter.
- **Conflict Resolution:** Client-side timestamp verification (last-write-wins with cryptographic checksum validation).

---

## 4. Cryptographic SHA-256 Checksum Validator

To satisfy HIPAA Security Rule § 164.312(c)(1) (Data Integrity) and California CMIA requirements, every write operation creates an audit log entry sealed with a SHA-256 digest:

$$\text{Checksum} = \text{SHA256}(\text{actorId} + \text{action} + \text{entityId} + \text{timestamp} + \text{detailsJSON})$$

The Telemetry Portal includes a one-click validation engine that traverses all audit logs in IndexedDB, recomputes the checksums, and reports any tampered or corrupted records in real time.

---

## 5. Transactional Email Gateway Health

Monitors dispatch events from the Resend API (`/api/send-email`):
- **Welcome / Registration Confirmation:** Automatically sent upon user sign-up.
- **Email Verification Codes:** 6-digit OTP delivery for authenticity verification.
- **Waitlist Inquiries:** Automated routing to `support@peernotebook.com`.
