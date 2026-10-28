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

---

## 3. Standardized CalAIM H0038 Encounter Templates
To streamline peer specialist documentation and guarantee compliance during county billing audits, Peer Notebook includes 8 certified encounter presets accessible directly from the session form drawer:

1. **Housing Stabilization & Navigation:** 45m face-to-face, 15m travel, 10m doc (70m = 5 units). Focus: Housing search, voucher checklist, landlord communication coaching.
2. **Harm Reduction & Overdose Prevention:** 30m face-to-face, 10m travel, 5m doc (45m = 3 units). Focus: Fentanyl test strips, naloxone distribution, non-judgmental risk discussion.
3. **Community Recovery & Mutual Aid Linkage:** 45m face-to-face, 15m travel, 10m doc (70m = 5 units). Focus: Mutual aid meeting introduction, shared lived experience modeling.
4. **Wellness Recovery Action Plan (WRAP):** 60m face-to-face, 0m travel, 10m doc (70m = 5 units). Focus: Crisis triggers, daily wellness maintenance list, peer support contact tree.
5. **Justice Re-Entry & Probation Navigation:** 45m face-to-face, 20m travel, 10m doc (75m = 5 units). Focus: Re-entry check-in, probation appointment accompaniment, barrier problem-solving.
6. **Enhanced Care Management (ECM) Multi-Disciplinary:** 35m face-to-face, 15m travel, 10m doc (60m = 4 units). Focus: Primary care appointment prep, pharmacy navigation, care team debrief.
7. **Vocational Readiness & Benefit Planning:** 45m face-to-face, 10m travel, 10m doc (65m = 5 units). Focus: Resume drafting, interview preparation, Medi-Cal Working Disabled program.
8. **Somatic Grounding & Emotional Regulation:** 30m face-to-face, 0m travel, 5m doc (35m = 3 units). Focus: Box breathing (4-4-4-4), 5-4-3-2-1 sensory grounding, nervous system pacing.

### Time Calculation Rule (DHCS Standard)
$$\text{Billing Units} = \lceil (\text{Face-to-Face Minutes} + \text{Field Travel Minutes} + \text{Documentation Minutes}) / 15 \rceil$$
Under DHCS CalAIM regulations, travel and documentation minutes are fully billable under H0038 when directly tied to an active peer encounter.
