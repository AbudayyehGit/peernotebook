# ADR-003: SHA-256 Tamper-Evident Audit Trails & Cryptographic Sealing

## Status
**Accepted & Enforced** (Date: 2026-10-24)

## Context
Under HIPAA Security Rule 45 CFR § 164.312(b) and California Welfare and Institutions Code § 14043.2, all behavioral health clinical and peer support records must maintain an immutable, tamper-evident audit trail tracking the creation, alteration, review, and supervisor cosigning of electronic protected health information (ePHI).

## Decision
We enforce cryptographic **SHA-256 Tamper-Evident Sealing**:
1. **Audit Log Generation:** Every state mutation (create note, update note, client registration, cosignature approval) generates an immutable `AuditLogEntry`.
2. **Cryptographic Checksum:** A SHA-256 hash is computed across `{id, timestamp, actorId, action, entityId, payloadHash, previousLogChecksum}` using the browser's native `crypto.subtle.digest('SHA-256', ...)` API.
3. **Immutability:** Once stamped, audit logs cannot be modified. Deleting notes is restricted by PostgreSQL RLS to draft states only.
4. **County Clearinghouse Portability:** Supervisors and auditors can export verified JSON and CSV audit trails directly from `SettingsPanel.tsx` and `SupervisorDashboard.tsx`.

## Consequences
- **Positive:** Unchallengeable legal defensibility during county audits; immediate detection of any database tampering; zero performance penalty on modern client devices.
- **Trade-off:** Storage overhead is minimized by storing hashes and essential actor metadata rather than duplicating full record bodies.
