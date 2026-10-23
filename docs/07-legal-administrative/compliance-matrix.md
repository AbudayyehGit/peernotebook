# Multi-Framework Compliance Crosswalk Matrix

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Standards:** SOC 2 Type II / ISO 27001 / HIPAA / CalAIM / CalMHSA

---

## 1. Compliance Mapping Table

| Framework Requirement | Regulatory Standard | Peer Notebook Architectural Implementation | Status |
|---|---|---|---|
| **Data Protection at Rest** | HIPAA 45 CFR § 164.312(a)(2)(iv) / ISO 27001 A.10.1 | PostgreSQL AES-256 cloud encryption; WebCrypto client-side AES-GCM local storage encryption. | **VERIFIED** |
| **Transmission Security** | HIPAA § 164.312(e)(1) / SOC 2 CC6.6 | Enforced TLS 1.3 encryption across all network communication; HSTS preload headers active. | **VERIFIED** |
| **Tamper-Evident Audit Trails** | HIPAA § 164.312(b) / California CMIA | Immutable `audit_trail_logs` recording user UUID, action, timestamp, and SHA-256 cryptographic fingerprint. | **VERIFIED** |
| **Non-Clinical Core Competencies** | California SB 803 / CalMHSA | 17 CalMHSA Core Competencies integrated into interactive multi-select intervention pills with linguistic guardrails. | **VERIFIED** |
| **15-Minute Billing Increments** | DHCS CalAIM Payment Reform / CMS 8-Min Rule | Automatic conversion of direct encounter minutes to exact Medi-Cal billing units (8–22 min = 1 unit). | **VERIFIED** |
| **72-Hour Supervisory Cosign** | County Mental Health Standards | Automated PDF export with supervisor cosign line and timestamp verification stamp. | **VERIFIED** |
| **Zero Single Point of Failure** | ISO 22301 / Business Continuity | Local-first Dexie.js (IndexedDB) engine provides complete offline operation with zero data loss. | **VERIFIED** |
| **Touch Target Ergonomics** | WCAG 2.2 AA (Criterion 2.5.5 / 2.5.8) | All interactive controls, inputs, and chips measure >= 44px by 44px min touch target dimensions. | **VERIFIED** |
