# System Architecture & 7-Step Note Lifecycle

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Pattern:** Offline-First Edge PWA with Dual-Layer Persistence

---

## 1. Component Topology
```
[ Field Tablet / Mobile Browser (Chromium / WebKit) ]
                     │
    ┌────────────────┴────────────────┐
    ▼                                 ▼
[ Service Worker Cache ]     [ React SPA / Tailwind ]
  (Shell, Manifest, PWA)       (Form Engine, 48px UI)
                                      │
                                      ▼
                        [ Dexie.js (IndexedDB Engine) ]
                        - clients, session_notes, sync_queue
                        - Instant commit < 15ms
                                      │
                                      ▼
                           [ Sync Worker Process ]
                        - Exponential Backoff Listener
                        - Online/Offline State Detector
                                      │ (TLS 1.3 / HTTPS)
    ┌─────────────────────────────────┴──────────────────────────────┐
    ▼                                                                ▼
[ Vercel Edge Global CDN ]                             [ Supabase Managed PostgreSQL 15 ]
  (peernotebook.com Custom Domain)                       - Multi-Tenant Row-Level Security
  (Zero-Downtime SPA Fallback)                           - Cryptographic Audit Trail
                                                         - JSONB Field Replication
```

---

## 2. The 7-Step Note Persistence Lifecycle
Every session encounter created in Peer Notebook traverses seven deterministic phases:

1. **Step 1 - Client Input & Local Reactive State:** User selects active client and inputs 4-part note details. React state triggers real-time CalAIM validation indicators.
2. **Step 2 - Zero-Latency Dexie.js Commit:** Every debounced keystroke (400ms) writes locally to IndexedDB table `session_notes` with `status: 'draft'` and `synced: false`.
3. **Step 3 - Finalization & Cryptographic Lock:** User taps "Finalize & Lock Note". Client computes SHA-256 hash across canonicalized note payload (`client_id`, `date`, `minutes`, `sections`). Status transitions to `'locked'`.
4. **Step 4 - Audit Trail Log Generation:** An immutable entry is appended to `audit_logs` capturing specialist ID, action timestamp, and hash fingerprint.
5. **Step 5 - Sync Queue Ingestion:** The locked note and audit entry are queued into `sync_queue` with idempotency UUID keys.
6. **Step 6 - Background Synchronization:** If `navigator.onLine` is true, `SyncWorker` flushes the payload to Supabase PostgreSQL over TLS 1.3. Supabase verifies tenant RLS policies and commits.
7. **Step 7 - Client-Side PDF Generation & Cosign:** Specialist or supervisor generates a cryptographically stamped PDF with visual signature lines for filing into county health records.

---

## 3. Zero-Persistence Clean-Desk Session Lifecycle
Under HIPAA 45 CFR § 164.312(a)(2)(iii) and California CMIA standards, Peer Notebook enforces a zero-persistence clean-desk architecture for public or shared field devices:
* **Zero Authenticated State on Boot:** `currentUser` initializes strictly as `null`. Application startup flushes any latent auth tokens via `supabase.auth.signOut()` and local storage keys (`peernotebook_active_user_id`, `peernotebook_auth_token`).
* **Auto-Logout on Window/Tab Close:** Direct browser lifecycle listeners (`beforeunload` and `pagehide`) execute immediate session destruction, guaranteeing zero credential residue when field personnel close their browser or tablet screen.

---

## 4. Circumnavigable Flex Wizard & CalAIM H0038 Engine
* **Dual Documentation Modes:** Specialists can toggle dynamically between continuous single-page view and the 5-step Flex Wizard stepper.
* **Unblocked Circumnavigation:** Unlike legacy clinical EHR wizards that lock sequential tabs behind incomplete field validations, the Flex Wizard provides unblocked jumping across all 5 steps (Careplan Linkage, Time Accounting, Interventions, Client Response, Safety & Signature).
* **CalAIM H0038 Template Library:** Integrated slide-out drawer providing 8 certified non-clinical templates with pre-calculated 15-minute billing units under DHCS rules.
