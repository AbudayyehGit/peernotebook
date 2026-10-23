# Compliance Engine & Client-Side PDF Export Specification

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Engine:** jsPDF Client-Side Generation with SHA-256 Tamper-Evident Stamping  
**Canonical Source:** https://peernotebook.com/docs/04-technical-architecture/05_Compliance_Engine_PDF_Export

---

## 1. Compliance Engine Validation Rules
Prior to transitioning any note from `'draft'` to `'locked'`, the internal `ComplianceEngine` verifies:
1. **Goal Verification:** `goal_addressed` must be non-empty and >= 10 characters.
2. **Interventions Verification:** At least one CalMHSA competency must be selected.
3. **Quotation Verification:** `client_response` must contain quoted text (`"..."` or `“...”`) to ensure authentic client voice.
4. **Time Alignment:** `direct_minutes` must be >= 8 for billable status, and units must accurately reflect CMS 8-minute rounding.

---

## 2. Cryptographic Tamper-Evident Hashing
When locked, the note payload is canonicalized into a standardized string:
```typescript
const canonicalString = [
  note.id,
  note.client_id,
  note.encounter_date,
  note.direct_minutes,
  note.travel_minutes,
  note.documentation_minutes,
  note.goal_addressed.trim(),
  note.interventions_provided.sort().join('|'),
  note.client_response.trim(),
  note.next_steps.trim()
].join('::');

const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalString));
const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
```

---

## 3. PDF Layout & Supervisory Signature Architecture
The exported PDF adheres to California county audit presentation standards:
* **Header:** Agency Name, Client ID/Identifier, Encounter Date, Place of Service (POS 15).
* **Billing Summary Table:** Direct Minutes, Travel Minutes, Documentation Minutes, Total Billable H0038 Units.
* **4-Part Clinical Body:** Cleanly delineated sections with trauma-informed headings.
* **Footer:** SHA-256 Verification Fingerprint, Specialist Signature line, Supervisor Review & Cosign line with 72-hour compliance notice.
