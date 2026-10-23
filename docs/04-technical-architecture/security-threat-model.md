# Security Threat Model & STRIDE Evaluation

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Standards:** HIPAA Security Rule (45 CFR § 164.312) / California CMIA / NIST SP 800-53

---

## 1. STRIDE Threat Analysis

| Threat Category | Potential Attack Vector | Peer Notebook Mitigation Architecture |
|---|---|---|
| **Spoofing** | Attacker attempts to impersonate a peer specialist or agency supervisor. | Supabase Auth with secure JWT tokens, device origin validation, and optional multi-factor authentication (MFA). |
| **Tampering** | Specialist or rogue actor modifies a locked note post-supervision to alter billing. | Cryptographic SHA-256 seal computed at lock; any modification triggers validation mismatch; database trigger forbids `UPDATE` on locked notes without supervisor addendum. |
| **Repudiation** | Specialist denies writing or locking a specific encounter record. | Immutable `audit_trail_logs` records every transaction with timestamp, specialist UUID, and client IP hash. |
| **Information Disclosure** | Unauthorized user accesses Protected Health Information (PHI) across agency boundaries. | PostgreSQL Row-Level Security (RLS) ensures multi-tenant data isolation; client storage encrypted via WebCrypto AES-GCM. |
| **Denial of Service** | Field specialist loses connectivity or cloud database becomes unreachable. | 100% local-first Dexie.js persistence allows full application operation while offline without service disruption. |
| **Elevation of Privilege** | Specialist alters role in JWT token to cosign own notes. | JWT claims signed with HS256/RS256 secret key on server; Supabase RLS validates role against internal `users` table. |

---

## 2. Encryption Standards
* **Data in Transit:** Enforced TLS 1.3 with HSTS (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`).
* **Data at Rest (Client):** IndexedDB stored within origin sandbox; sensitive payloads sealed with WebCrypto API.
* **Data at Rest (Cloud):** Supabase PostgreSQL encrypted via AES-256 block-level encryption with customer-managed keys.
