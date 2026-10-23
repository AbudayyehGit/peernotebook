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
