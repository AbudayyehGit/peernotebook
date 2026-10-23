# Peer Notebook Product Roadmap: Three Horizons of Delivery

**Document Version:** 1.1-GA  
**Target Domain:** peernotebook.com  
**Alignment:** CalAIM Payment Reform & County Behavioral Health Partnerships

---

## Horizon 1: Core PWA & Field Logging Engine (GA #8 Release — Current)
**Focus:** Solo Specialists & Small Community Non-Profits

* **Local-First IndexedDB Persistence:** Zero-latency client note logging via Dexie.js.
* **CalAIM H0038 Calculator:** 3-way time capture (Direct, Travel, Documentation) with automated 15-minute billing unit calculation (CMS 8-minute rule).
* **Trauma-Informed Design System:** Strict light mode Soft Slate (`#F8FAFC`), Deep Navy (`#1E3A8A`), and Muted Teal (`#0F766E`) with 48px touch targets.
* **Cryptographic PDF Note Export:** Client-side tamper-evident PDF generation with SHA-256 hash stamp for supervisor cosigning.
* **Lead Magnet & Outreach Toolkit:** Downloadable CalAIM audit checklist and peer specialist outreach templates.

---

## Horizon 2: County Health & Multi-Tenant Agency Bridge (Q3-Q4)
**Focus:** Medium-to-Large Community Behavioral Health Agencies

* **Role-Based Access Control (RBAC):** Agency Supervisor Review Queues, Specialist Cosigning, and Multi-Specialist Roster Management.
* **Batch Claims Export:** Medi-Cal 837P EDI electronic billing export formatted for California county behavioral health clearinghouses.
* **Automated County Audit Readiness:** 1-click generation of county compliance binders with CalMHSA core competency tags.
* **Enhanced Offline Token Refresh:** Resilient OAuth and JWT offline rotation for field tablets disconnected > 72 hours.

---

## Horizon 3: Enterprise EHR Interoperability (Year 2)
**Focus:** County Departments of Mental Health & Health Systems

* **HL7 FHIR R4 Integration:** Bi-directional sync with Epic, Cerner Millennium, and Netsmart myAvatar.
* **SMART-on-FHIR Peer Launchpad:** Launch Peer Notebook within hospital emergency department triage dashboards.
* **Aggregated Outcome Telemetry:** Population health trends on recovery capital, housing stability, and harm reduction engagement.
