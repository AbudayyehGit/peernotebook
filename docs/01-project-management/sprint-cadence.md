# Sprint Cadence & Agile Engineering Rituals

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Engineering Methodology:** Trauma-Informed Agile (14-Day Sprints)

---

## 1. Bi-Weekly Sprint Structure
Peer Notebook engineering operates on strict 14-day sprint cycles starting on alternate Wednesdays:

| Day | Ritual | Duration | Objective |
|---|---|---|---|
| Day 1 (Wed) | Sprint Planning & Story Estimation | 60 min | Review backlog, assign Fibonacci story points, commit to sprint scope |
| Day 2-12 (Daily) | Async Standup Check-in | 10 min | Three questions: What was merged? What is in flight? Any blockers? |
| Day 13 (Mon) | Feature Freeze & Regression Audit | 90 min | Run `npm run build`, mobile touch target audits, offline sync stress tests |
| Day 14 (Tue) | Sprint Review, Demo & Retrospective | 45 min | Showcase live work to clinical leads, conduct blameless sprint retro |

---

## 2. Estimation Scale (Modified Fibonacci)
* **1 Point:** Trivial copy adjustment, static asset swap, or single CSS token update.
* **2 Points:** Minor isolated UI component enhancement (e.g. adding a badge, updating a button state).
* **3 Points:** Self-contained UI component with local Dexie state integration or form field validation.
* **5 Points:** Complex full-stack feature (e.g., Supabase RLS policy, background sync retry worker).
* **8 Points:** Architectural overhaul (e.g., dual-persistence synchronization engine, PDF generator rework).
* **13 Points:** Decompose into smaller stories.

---

## 3. Definition of Done (DoD)
A user story or feature branch cannot be merged into `master` until:
1. `tsc --noEmit` and `vite build` complete with zero errors and zero warnings.
2. All interactive touch targets measure >= 44px (field tablet accessibility standard).
3. Local-first Dexie.js offline persistence verified by simulating `navigator.onLine = false`.
4. No clinical terminology violations (must maintain trauma-informed, non-clinical language).
5. Code passes TypeScript strict mode checks with zero `any` type escapes.
