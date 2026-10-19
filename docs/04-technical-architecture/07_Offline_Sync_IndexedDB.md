# Offline Sync & IndexedDB Technical Specification
**Module:** `src/db/peerNotebookDatabase.ts` & `src/services/syncWorker.ts`
**Storage Engine:** Dexie.js v4 (IndexedDB Wrapper)
**Cloud Bridge:** PostgreSQL / Supabase Realtime API
**Canonical Source:** https://peernotebook.com/docs/04-technical-architecture/07_Offline_Sync_IndexedDB

---

## 1. Storage Schemas
```typescript
export class PeerNotebookDexieDB extends Dexie {
  organizations!: Table<Organization, string>;
  users!: Table<User, string>;
  clients!: Table<Client, string>;
  session_notes!: Table<SessionNote, string>;
  audit_logs!: Table<AuditLogEntry, string>;
  sync_queue!: Table<SyncQueueItem, string>;
  settings!: Table<SystemSetting, string>;
}
```

## 2. Sync Worker State Machine
The `SyncWorker` maintains four operational states:
1. **Online:** Active network connection detected via `navigator.onLine` and ping heartbeat. Mutations are batched and dispatched within 600ms.
2. **Offline:** Network lost. Operations are enqueued to `sync_queue` with operational payload and timestamp. UI status pill transitions to Warm Amber (#D97706).
3. **Syncing:** Processing queue items sequentially. Mutated records have `synced` flag updated to `true`.
4. **Error / Retry:** If remote HTTP fails, retry counter increments up to 5 attempts with jittered exponential backoff.

## 3. Conflict Resolution Strategy
Peer Notebook enforces a **Field Author Authority (Last-Write-Wins with Local Revision Log)** rule. If an encounter note was cosigned by a supervisor while the specialist was in the field, the supervisor approval status is merged while preserving field notes in an immutable revision chain.
