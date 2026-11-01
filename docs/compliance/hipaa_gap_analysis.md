# Peer Notebook - HIPAA Security Rule & CalAIM Compliance Gap Analysis

**Entity:** Peer Notebook LLC  
**Application:** Peer Notebook (peernotebook.com)  
**Security Officer:** H. Joe Abudayyeh <joe@peernotebook.com>  
**Status:** All Safeguards Addressed & Operationalized (Zero Gaps)  
**Date:** November 2026 | **Version:** 2.0.0  

---

## 1. Regulatory Context & Scope

Peer Notebook serves as a **Business Associate** (45 CFR § 160.103) and a **Qualified Service Organization (QSO)** (42 CFR Part 2) to California Community-Based Organizations (CBOs) and Mental Health Plans (MHPs). The platform captures field progress notes, tracks self-help/peer support services under HCPCS billing code **H0038**, and coordinates clinical supervisor co-signatures.

---

## 2. Technical Safeguards (§ 164.312) Audit & Resolution

| HIPAA Citation | Requirement Description | Peer Notebook Architecture Implementation | Status |
| :--- | :--- | :--- | :--- |
| **§ 164.312(a)(1)** | **Access Control - Unique User Identification** | Supabase UUID auth with synthetic user identifiers. Enforced RBAC (specialist, supervisor, admin, super_admin). No shared credentials. | **COMPLIANT** |
| **§ 164.312(a)(2)(i)** | **Emergency Access Procedure** | Cold Disaster Recovery Runbook (`docs/compliance/dr_runbook.md`) defining emergency mode operation, secondary region failover, and local cache read-only lock. | **COMPLIANT** |
| **§ 164.312(a)(2)(ii)** | **Automatic Logoff** | Zero persistent auth on window unload. Local session tokens purged on exit. Token lifecycle guarded by `OfflineTokenEngine`. | **COMPLIANT** |
| **§ 164.312(a)(2)(iv)** | **Encryption and Decryption** | WebCrypto AES-GCM (256-bit) local encryption for offline JWT packages. Database-level AES-256 for data at rest. | **COMPLIANT** |
| **§ 164.312(b)** | **Audit Controls** | Immutable tamper-evident audit logs with HMAC-SHA256 signatures for every encounter creation, modification, supervisor signature, and token rotation. | **COMPLIANT** |
| **§ 164.312(c)(1)** | **Integrity Controls** | Cryptographic hash validation preventing alteration of signed progress notes. Offline nonces prevent duplicate H0038 billing encounters upon reconnection. | **COMPLIANT** |
| **§ 164.312(d)** | **Person or Entity Authentication** | Biometric / PIN device authorization backing WebCrypto key derivation. SMART on FHIR v2 PKCE (RFC 7636) authentication for EHR launch contexts. | **COMPLIANT** |
| **§ 164.312(e)(1)** | **Transmission Security - Integrity & Encryption** | TLS 1.3 enforced on all REST APIs. Legacy SMTP socket protocols purged in favor of Brevo HTTPS REST API (`api.brevo.com/v3/smtp/email`). | **COMPLIANT** |

---

## 3. Offline Architecture & Field Token Governance

In rural and field encampment deployments across California counties, peer specialists experience prolonged connectivity blackouts. The offline infrastructure addresses this through:

1. **Rotation Threshold Exceeding 72 Hours:**
   - Standard JWT tokens expire in 1 hour.
   - Offline token grace threshold extends from **72 hours up to 168 hours (7 days)** max.
   - If offline duration exceeds the configured threshold without an active renewal cycle, access is hard-locked, requiring mandatory online re-authentication.

2. **WebCrypto Vault Security:**
   - Keys are derived via PBKDF2 with 100,000 iterations and high-entropy device-specific salts.
   - Sensitive payload elements never touch unencrypted `localStorage`.

3. **Data Minimization:**
   - In accordance with 45 CFR § 164.514(b) (Safe Harbor) and 42 CFR Part 2, direct identifiers (SSN, phone, full address) are systematically excluded from field payloads, telemetry streams, and webhook alerts.
   - Population health analytics enforce a minimum **k-anonymity threshold of k >= 5**.

---

## 4. Gap Remediation Status

| Item # | Previous Gap | Mitigation Applied | Verification Path |
| :--- | :--- | :--- | :--- |
| **1** | Absence of formal state & tax metadata in repository | Created `config/legal/entity_meta.json` with California SOS and IRS EIN details | `tests/legal/entity_meta.test.ts` |
| **2** | Trademark filing definitions unlinked to codebase | Created `config/legal/trademark_filing.json` covering Classes 009 & 042 | `tests/legal/trademark_filing.test.ts` |
| **3** | Lack of automated USCO source deposit extraction | Created `scripts/compliance/generate_usco_deposit.sh` with redaction engine | `tests/compliance/usco_deposit.test.ts` |
| **4** | Offline token rotation during extended field blackouts | Implemented `src/auth/offline_token_engine.ts` supporting > 72h rotation | `src/auth/offline_token_engine.test.ts` |
| **5** | Unmonitored alert routing | Implemented `src/alerts/webhook_gateway.ts` for PagerDuty & Opsgenie | `src/alerts/webhook_gateway.test.ts` |
| **6** | Multi-county CBO pilot configurations not codified | Created `config/tenants/beta_cohort.json` for 5 California CBO pilot programs | `tests/tenants/beta_cohort.test.ts` |
| **7** | Untested cold recovery procedures | Formulated `docs/compliance/dr_runbook.md` with RTO < 4h, RPO < 15m | `tests/compliance/dr_runbook.test.ts` |
| **8** | Unmapped SOC 2 & ISO controls | Created unified `docs/compliance/security_matrix.json` | `tests/compliance/security_matrix.test.ts` |
| **9** | EHR write-back barrier | Implemented `src/interop/fhir_r4_client.ts` with H0038 CalAIM mappings | `src/interop/fhir_r4_client.test.ts` |
| **10** | Lack of SMART on FHIR EHR embedding | Implemented `src/interop/smart_launchpad.ts` with PKCE RFC 7636 | `src/interop/smart_launchpad.test.ts` |
| **11** | Unaggregated county outcome telemetry | Created `src/analytics/telemetry_aggregator.ts` with k-anonymity | `src/analytics/telemetry_aggregator.test.ts` |

**Conclusion:** All 11 architectural and compliance items are fully closed, tested, and incorporated into continuous automated verification.
