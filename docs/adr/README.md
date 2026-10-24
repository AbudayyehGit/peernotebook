# Peer Notebook Architecture Decision Records (ADRs)

This directory maintains the version-controlled Architecture Decision Records (ADRs) governing **Peer Notebook** (`peernotebook.com`). Every record captures the architectural context, compliance rationale, and consequences of design choices in alignment with California CalAIM, Medi-Cal (H0038 / POS 15), CalMHSA, and HIPAA standards.

## Index of Approved Architecture Decision Records

| ADR ID | Title | Status | Date | Primary Standard |
| :--- | :--- | :--- | :--- | :--- |
| [ADR-001](./ADR-001_Zero_AI_Runtime_Deterministic_Engine.md) | Zero-AI Runtime Deterministic Engine | Accepted | 2026-10-24 | HIPAA § 164, Zero PHI Leakage |
| [ADR-002](./ADR-002_Dual_Layer_Persistence_Dexie_To_Supabase.md) | Dual-Layer Persistence (Dexie.js to Supabase) | Accepted | 2026-10-24 | Offline-First PWA Resilience |
| [ADR-003](./ADR-003_SHA256_Tamper_Evident_Audit_Trails.md) | SHA-256 Tamper-Evident Audit Trails | Accepted | 2026-10-24 | HIPAA § 164.312(b), Cryptographic Integrity |
| [ADR-004](./ADR-004_WCAG_2_1_AA_Trauma_Informed_Design_Tokens.md) | WCAG 2.1/2.2 AA Trauma-Informed Tokens | Accepted | 2026-10-24 | Section 508, Low-Arousal UX |
| [ADR-005](./ADR-005_Medi_Cal_H0038_15_Minute_Billing_Calculations.md) | Medi-Cal H0038 15-Minute Billing Engine | Accepted | 2026-10-24 | DHCS CalAIM, CMS 8-Minute Rule |

---

*For inquiries or review regarding these architectural decisions, contact the engineering and compliance team at [support@peernotebook.com](mailto:support@peernotebook.com).*
