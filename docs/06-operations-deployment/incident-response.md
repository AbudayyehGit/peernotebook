# Incident Response Protocols & Severity Classifications

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com

---

## 1. Severity Levels & SLA Timelines

| Severity | Definition | Response SLA | Target Resolution | Escalation Path |
|---|---|---|---|---|
| **P0 (Critical)** | Core application down or field data loss occurring; sync service failing globally. | **< 15 minutes** | < 2 hours | Principal Systems Architect, Lead Frontend Engineer, Agency Directors |
| **P1 (High)** | Single agency or region unable to synchronize notes; local saves still functional. | **< 30 minutes** | < 6 hours | Lead Frontend Engineer, Backend Supabase Admin |
| **P2 (Medium)** | Non-blocking feature failure (e.g. PDF export formatting anomaly, minor styling bug). | **< 4 hours** | Next sprint release | On-call engineer |
| **P3 (Low)** | Minor cosmetic defect, documentation typo, or non-urgent enhancement request. | **< 24 hours** | Scheduled backlog | Product Manager |

---

## 2. P0 War-Room Protocol
1. **Declare Incident:** Primary responder posts in incident war room with summary of symptoms and impacted specialists.
2. **Assign Incident Commander (IC):** IC owns status updates and coordinates technical mitigation.
3. **Isolate Failure:**
   - If Supabase cloud is unreachable: Advise specialists to continue working offline; Dexie.js captures all records locally.
   - If Vercel edge deployment issue: Roll back to previous verified deployment hash via Vercel CLI in < 60 seconds.
4. **Post-Incident Review:** Publish blameless retrospective within 48 hours detailing root cause, timeline, and corrective engineering actions.
