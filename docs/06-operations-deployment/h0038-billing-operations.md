# Medi-Cal H0038 Billing Operations & Claims Processing

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Billing Framework:** Medi-Cal Behavioral Health CalAIM / HCPCS H0038

---

## 1. Procedure Code H0038 & Common Modifiers
In California Medi-Cal billing, HCPCS **H0038** (Self-Help / Peer Support Services) is paired with specific modifiers depending on the nature of the encounter:

| Procedure Code | Modifier | Description | Typical Application |
|---|---|---|---|
| **H0038** | — | Standard Peer Support Encounter (15 min unit) | 1-on-1 community field visit |
| **H0038** | **HQ** | Peer Group Encounter | Facilitation of peer recovery or wellness group |
| **H0038** | **GQ** | Telehealth Peer Service | Synchronous audio/video telehealth encounter |
| **H0038** | **U1 / U2** | County-Specific Specialized Level of Care | County Mental Health or Drug Medi-Cal DMC-ODS program |

---

## 2. Weekly Billing Batching Workflow
For community behavioral health agencies, Peer Notebook streamlines the weekly billing cycle:
1. **Specialist Logging (Monday–Friday):** Specialists log encounters in real time on mobile field tablets; notes lock with SHA-256 signatures.
2. **Supervisory Cosign (Within 72 Hours):** Clinical supervisors review notes in the agency queue and cosign.
3. **Claims Extract Generation (Monday 9:00 AM):** Billing coordinators generate a weekly claims batch CSV or 837P EDI manifest containing client IDs, date, direct minutes, units, and Place of Service.
4. **County Clearinghouse Submission:** Claims are uploaded to the county portal (e.g. LACDMH IBHIS, SFDPH Avatar) with zero manual unit calculation errors.
