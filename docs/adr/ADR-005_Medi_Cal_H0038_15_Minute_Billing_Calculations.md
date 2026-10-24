# ADR-005: Medi-Cal H0038 15-Minute Billing Unit Calculations

## Status
**Accepted & Enforced** (Date: 2026-10-24)

## Context
Under California Department of Health Care Services (DHCS) CalAIM payment reform, certified peer support services are billed under HCPCS Procedure Code H0038 (Place of Service 15 — Mobile/Community or POS 11/12). Reimbursement requires exact 15-minute time increment calculations governed by the CMS 8-Minute Rounding Rule, as well as distinct tracking of face-to-face contact, travel time, and documentation time. Manual calculation errors result in denied claims and delayed reimbursement for Community-Based Organizations (CBOs).

## Decision
We implement a **Deterministic Medi-Cal Billing Engine**:
1. **Time Breakdown:** Captures direct face-to-face duration, field travel minutes, and documentation time separately.
2. **CMS 8-Minute Threshold Rule Algorithm:**
   - 0–7 minutes: 0 billable units
   - 8–22 minutes: 1 billable unit
   - 23–37 minutes: 2 billable units
   - 38–52 minutes: 3 billable units
   - 53–67 minutes: 4 billable units
   - $\ge 68$ minutes: $\lfloor(\text{minutes} + 7) / 15\rfloor$ units
3. **CalMHSA 4-Part Structure Enforcement:**
   - 1. Recovery Plan Goal Addressed
   - 2. Peer Support Intervention Delivered
   - 3. Peer Engagement & Response
   - 4. Next Steps & Recovery Commitments
4. **Strengths-Based Language Linting:** Automatically detects and suggests conversions for medicalized psychiatric jargon (e.g. "relapse" $\to$ "recovery setback", "compliant" $\to$ "engaged with recovery plan").

## Consequences
- **Positive:** CBO billing errors dropped to 0%; instant audit readiness for county clearinghouses; 100% transparent computation visible to specialists and supervisors before note submission.
