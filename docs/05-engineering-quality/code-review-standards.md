# Code Review Standards & Craftsmanship Rubric

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Philosophy:** Zero-AI Hallucination • Anti-AI Slop Restraint • TypeScript Strictness

---

## 1. Pull Request Standards & Review Rubric

### Rule 1: Zero Clinical Psychopathology Jargon
Reviewers must reject any code or copy introducing psychiatric labeling into client-facing peer workflows. Strings must align with CalMHSA recovery principles (e.g. use "recovery goal" rather than "treatment plan", "peer" rather than "patient").

### Rule 2: Strict Touch Target Sizing
Any added button, icon trigger, input field, or pill must explicitly include Tailwind classes ensuring `>= 44px` height and width (e.g. `min-h-[44px]`, `px-3 py-2`).

### Rule 3: Zero TypeScript Escapes
The use of `any`, `@ts-ignore`, or loose type assertions is grounds for immediate PR rejection. All entity models must map to typed interfaces defined in `src/types/`.

### Rule 4: Offline-First Integrity
Any feature touching data storage must demonstrate that it functions flawlessly when `navigator.onLine === false`. Dexie writes must complete synchronously before any remote dispatch.

---

## 2. Review Checklist
- [ ] PR title follows Conventional Commits (`feat:`, `fix:`, `docs:`, `perf:`).
- [ ] Includes automated test coverage or deterministic verification proof.
- [ ] No regression on Tailwind color tokens (`#F8FAFC`, `#1E3A8A`, `#0F766E`).
- [ ] Signed off by at least two engineering peers before merging into `master`.
