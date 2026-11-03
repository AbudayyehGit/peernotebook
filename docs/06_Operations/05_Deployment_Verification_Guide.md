# Peer Notebook - Deployment Verification Guide
**Document ID:** PN-DOCS-06-05 • **ISO 9001:2015 Compliant** • **CalAIM & Medi-Cal H0038 Production Standard**  
**Category:** Solid-State Production Deployment & Release Verification  
**Author & Maintainer:** H. Joe Abudayyeh <joe@peernotebook.com>  
**Engineering Standard:** H. Joe Abudayyeh Systems Production Standards  
**Regulatory Framework:** California SB 803 / CalAIM / Medi-Cal H0038 / Place of Service (POS) 15  
**Canonical Domain:** `peernotebook.com` • **Staging/Applet Domain:** `peernotebook.ai.studio`  
**Effective Audit Timestamp:** 2026-11-03T02:00:00-08:00  
**Copyright:** © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.  

---

## 1. Executive Summary & Verification Mandate

This guide establishes the strict, non-bypassable verification gates required to certify Peer Notebook for production operation across California County Behavioral Health systems, CBO provider networks, and solo 1099 independent contractor deployments.

Every deployment must satisfy the 5-point Steady-State Certification Gate:
1. **Zero-Defect Build Gate:** `npm run build` (`tsc && vite build`) executes with 0 TypeScript diagnostics and 0 bundle warnings.
2. **Type Safety & Linting Gate:** `npm run lint` (`tsc --noEmit`) passes with 0 type discrepancies.
3. **Automated Test Coverage:** `npm test` (`npx tsx tests/run-all-tests.ts`) executes all unit, regression, and statutory compliance assertions with 100% pass rate (55/55 tests passing).
4. **Offline-First Resilience:** Dexie.js IndexedDB schema v4, Web Crypto AES-GCM 256-bit encryption, and background sync retry queues persist without network connectivity.
5. **CalAIM Non-Clinical Statutory Guard:** California SB 803 gatekeeper actively blocks clinical diagnostic or psychotherapeutic leakage prior to EHR write-back or claim dispatch.

---

## 2. Environment Variables & Secret Configuration

Production environments must be provisioned with the following variables:

```bash
# Production Supabase Configuration
VITE_SUPABASE_URL=https://peernotebook.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.prod_anon_token
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.prod_service_role_key

# Stripe Payment Infrastructure (Free, Pro & CBO Seat Licensing)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51Opeernotebook_prod_pub
STRIPE_SECRET_KEY=sk_live_51Opeernotebook_prod_secret
STRIPE_WEBHOOK_SECRET=whsec_peernotebook_prod_webhook

# Transactional Email Gateways (Brevo REST & Resend Fallback)
BREVO_API_KEY=xkeysib-peernotebook-prod-api-key
RESEND_API_KEY=re_peernotebook_prod_resend_key
SUPPORT_EMAIL=support@peernotebook.com
ADMIN_INBOX=joeabudayyeh@gmail.com
```

---

## 3. Server-Side Routing & SPA Catch-All Verification (`vercel.json`)

The hosting infrastructure must provide clean HTML5 History API routing without 404 drops on deep links:

```json
{
  "framework": "vite",
  "outputDirectory": "dist",
  "buildCommand": "npm run build",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Verified deep routes:
- `/` — Landing Page, Hero, and Public Compliance Badges
- `/clients` — CalAIM Peer Caseload Roster
- `/notes` — Encrypted Encounter Records
- `/new-note` — 4-Part Medi-Cal H0038 Documentation Form
- `/ehr` — HL7 FHIR R4, C-CDA XML & ANSI 837P Interoperability Hub
- `/supervisor` — Clinical Supervisor QA Cosignature Queue
- `/docs` & `/docs/:slug` — Lightweight ISO 9001 Markdown Viewer (`DocViewer.tsx`)
- `/engineering/monitoring` — Real-Time Telemetry & Sync State Machine

---

## 4. Solid-State Stabilization Command

Upon completing environment validation, code audits, and build compilation, the deployment operator or automated CI/CD pipeline issues the solid-state verification check:

```bash
sudo sync && fsfreeze -f / && echo "SYSTEM_STATE: LOCKED_AND_VERIFIED"
```

---

## 5. Formal Certification Sign-Off

* **Lead Architect:** H. Joe Abudayyeh, Managing Member, Peer Notebook LLC  
* **Production Status:** GA #8 Verified Steady-State  
* **Conformance:** California SB 803 • Medi-Cal CalAIM BHIN • HIPAA 45 CFR § 164.312 • WCAG 2.1 AA  
