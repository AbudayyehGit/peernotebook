# Testing Strategy & Automated Quality Gates

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Quality Architecture:** Test Pyramid (70% Unit, 20% Integration, 10% E2E)

---

## 1. Test Pyramid Distribution

### Unit Tests (70%)
* **Domain Logic:** CMS 8-Minute billing unit calculator, 4-part note validation rules, CalAIM time allocation calculations.
* **Storage Serializers:** JSON backup serializer, sanitizers, and SHA-256 hash formatting.
* **Harness:** Vitest with fake timers and mocked crypto primitives.

### Integration Tests (20%)
* **Dual-Persistence Sync:** Testing Dexie.js transactional writes followed by background queue dispatch to mocked Supabase REST endpoints.
* **State Machines:** Transitions between `'online'`, `'offline'`, `'syncing'`, and `'error'` states in `SyncWorker`.
* **Conflict Resolution:** Simulating concurrent edits and validating Field Author Authority merge logic.

### End-to-End (E2E) Tests (10%)
* **Field User Journeys:** Playwright tests executing complete workflow: create client -> log 4-part note in offline mode -> reconnect -> verify sync -> export PDF.
* **Touch Target Verification:** Automated bounding-box measurements ensuring all clickable elements meet >= 44px by 44px on simulated 375px mobile viewports.

---

## 2. CI Quality Gates
Every Pull Request must pass three automated gates:
1. `npm run lint`: Zero ESLint warnings or errors.
2. `tsc --noEmit`: 100% strict TypeScript type checking pass.
3. `npm run build`: Production Vite bundle compilation pass under 12 seconds.
