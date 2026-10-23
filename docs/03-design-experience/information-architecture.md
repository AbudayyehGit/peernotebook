# Information Architecture & Note Logging Stack

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com

---

## 1. Single-Screen Continuous Note Logging Stack
To eliminate cognitive load and navigation friction on mobile field tablets, Peer Notebook rejects paginated, multi-step wizards in favor of a **single continuous vertical stack**:

```
+-----------------------------------------------------------+
| Top Navigation Header: Brand, View Toggle, Sync Indicator |
+-----------------------------------------------------------+
| Client Selection & Encounter Metadata                      |
| - Client Picker / Rapid Search                            |
| - Encounter Date & Start/End Time                          |
| - Service Setting (Place of Service 15: Field / Office)   |
+-----------------------------------------------------------+
| 3-Way Time Tracking Card                                  |
| - Direct Face-to-Face Minutes                             |
| - Travel Minutes                                          |
| - Documentation Minutes                                   |
| -> Computed: Total Billable H0038 Units (CMS 8-Min Rule)  |
+-----------------------------------------------------------+
| Section 1: Recovery Plan Goal Addressed                   |
| - Linked Client Goal (Min 10 characters)                  |
+-----------------------------------------------------------+
| Section 2: Peer Support Intervention Provided             |
| - Interactive CalMHSA Competency Pills (Multi-Select)     |
| - Narrative Details of Non-Clinical Support               |
+-----------------------------------------------------------+
| Section 3: Peer Engagement & Client Response              |
| - Client affect and agency description                    |
| - Mandatory verbatim client quote field                   |
+-----------------------------------------------------------+
| Section 4: Next Steps & Continuity Plan                   |
| - Scheduled date of next contact & mutual action items    |
+-----------------------------------------------------------+
| Lock & Export Action Bar                                  |
| - [ Save Draft to Local IndexedDB ]                       |
| - [ Validate & Finalize Note (Locks & Computes SHA-256) ] |
| - [ Export Audit-Ready PDF with Supervisor Signature Line]|
+-----------------------------------------------------------+
```

---

## 2. Progressive Disclosure Rules
1. **Pill Selectors Expand Detailed Prompts:** Selecting an intervention pill (e.g. *Role Modeling & Lived Experience*) automatically suggests standard non-clinical phrasing.
2. **Real-Time Validation Badges:** Incomplete sections display a gentle amber indicator; as valid content is entered, the indicator transforms to a green checkmark.
3. **Draft vs Final Lock States:** Draft notes remain editable locally. Finalized notes are cryptographically locked against subsequent alteration to meet HIPAA 45 CFR § 164.312 integrity standards.
