# Product Strategy: 1099 Independent Recovery Coaches & Solo Practitioners

**Target Market:** Certified Peer Support Specialists (CPSS-CA), Recovery Coaches, and Solo Practitioners in California  
**Regulatory Framework:** CalAIM Behavioral Health Payment Reform, Medi-Cal H0038, Place of Service 15 (Mobile Unit / Community Outreach)  
**Document Class:** Business & Market Strategy  
**Organization:** Peer Notebook LLC (peernotebook.com)

---

## 1. Executive Summary & Market Sizing

While initial behavioral health tech solutions targeted enterprise CBOs and large clinic networks, California’s CalAIM implementation has created an unprecedented demand for agile, mobile, independent 1099 contractors. Under CalAIM Community Supports and Enhanced Care Management (ECM), Managed Care Plans (MCPs) and county behavioral health departments are actively contracting with individual Certified Peer Support Specialists (CPSS-CA) to deliver peer coaching in encampments, supportive housing facilities, and mobile harm reduction units.

### Market Dynamics
1. **The 1099 Shift:** Over 40% of newly certified California peer specialists operate as 1099 independent contractors, juggling multiple county contracts, CBO vendor agreements, or private client rosters.
2. **The Documentation Friction:** Solo specialists lack back-office administrative staff. They carry the entire burden of CalAIM compliance, 15-minute billing unit conversions, travel time logs, and IRS mileage tracking.
3. **The Solution:** Peer Notebook provides a self-contained, offline-first clinical workspace tailored specifically for solo practitioners. With zero-AI deterministic linting, automated H0038 unit calculations, and integrated 1099 tax classification ledgers, solo peers reduce administrative burden by 65%.

---

## 2. Product Positioning & Value Proposition for Solo Contractors

| Capability | Legacy Enterprise EHRs | Spreadsheets / Word | Peer Notebook Solo Tier |
|---|---|---|---|
| **Account Overhead** | Mandatory enterprise agency tenant ID | None (Manual files) | Solo 1099 Tenant (Zero agency dependency) |
| **Offline Reliability** | Requires active VPN / constant web connection | Manual local copy | 100% Offline Dexie.js with auto-sync |
| **CalAIM H0038 Math** | Complex manual charge-capture entry | Error-prone calculations | Instant 15-min CMS 8-minute rounding |
| **Field Privacy** | Full names visible on screen | Full names exposed | One-click Field Privacy Pseudonymization |
| **1099 Billing Ledger** | Not supported | Disconnected spreadsheets | Automated hourly rate & mileage log ($0.67/mi) |
| **Pricing** | $120–$250/seat/month + setup fees | Free but non-compliant | $29/month flat (or free beta cohort) |

---

## 3. Solo Tenant Architecture & Isolation Model

Solo 1099 accounts do not require an agency tenant wrapper:
- **Tenant Isolation:** Account records are partitioned with `account_type = 'solo_1099'` and `organization_id IS NULL`. Row-Level Security (RLS) dynamically scopes client records, session notes, and audit logs directly to `author_id = auth.uid()` / `assigned_specialist_id = auth.uid()`.
- **Hybrid Agency Contracting:** A solo contractor can optionally link their 1099 billing profile to a CBO partner (`contractAgencyName`) while maintaining independent data sovereignty over their private client caseload.
- **Portability & Export:** Solo specialists can generate encrypted JSON archives or printable PDF charts at any moment, satisfying independent client record retention mandates under California CMIA.

---

## 4. Go-To-Market & Monetization

1. **Self-Serve Onboarding:** 1099 specialists register without administrative approval. Direct onboarding walkthrough guides them through their first CalAIM note in under 2 minutes.
2. **Pricing Structure:**
   - **Solo Practitioner Tier:** $29/specialist/month (Unlimited notes, client roster, 1099 tax rate ledger, offline sync, encrypted export).
   - **Founding Beta Cohort:** Free lifetime tier for the first 3–5 peer specialists participating in product hardening.
   - **Enterprise CBO Tier:** $49/specialist/month with supervisor QA dashboards, multi-specialist cosignature queues, and county export pipelines.
