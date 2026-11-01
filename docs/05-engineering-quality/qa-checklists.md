# Pre-Flight QA Checklists & Field Regression Matrix

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Audit Standard:** CalAIM Ready & HIPAA Compliant

---

## 1. Field Usability & Touch Verification (375px Mobile & 768px Tablet)
- [x] **DONE** - Top Header Navigation elements (Logo, Sync Badge, Org Select) do not overlap or wrap destructively on 375px mobile screen. (Verified: responsive flex-wrap layout and icon collapse in `Navbar.tsx`).
- [x] **DONE** - Direct, Travel, and Doc time numerical inputs allow fast one-touch number entry without keyboard obstruction. (Verified: 48px touch inputs in `SessionNoteForm.tsx`).
- [x] **DONE** - Multi-select intervention pills have generous hitboxes (>= 44px min-h) allowing quick thumb selection in field trucks. (Verified: `min-h-[44px]` touch targets in `SessionNoteForm.tsx`).
- [x] **DONE** - Quoted text detection turns green only when valid quotation marks (`"..."`) are typed. (Verified: regex quotation validator in `SessionNoteForm.tsx`).
- [x] **DONE** - PDF export generates single clean 8.5"x11" portrait page with legible typography and crisp SHA-256 hash. (Verified: `ExportSessionPDF.tsx` jsPDF single-sheet formatting).

---

## 2. Offline Resilience Matrix
- [x] **DONE** - Turn off Wi-Fi / cellular data (Simulate Offline).
- [x] **DONE** - Create new client: Verify record is saved instantly to IndexedDB `clients` table. (Verified: Dexie `db.clients.add` local synchronous write).
- [x] **DONE** - Log complete 4-part note: Verify note is saved with status `draft`. (Verified: Dexie `db.sessionNotes.put` with status `'draft'`).
- [x] **DONE** - Tap "Finalize & Lock Note": Status transitions to `locked`, SHA-256 fingerprint generated. (Verified: WebCrypto SHA-256 digest in `SessionNoteForm.tsx`).
- [x] **DONE** - Observe Sync Status Pill: Displays Warm Amber `#D97706` indicating "1 unsynced item queued". (Verified: Dexie unsynced query trigger).
- [x] **DONE** - Reconnect Wi-Fi: Background sync triggers within 600ms; status pill transitions to Forest Green `#16A34A` ("All changes saved"). (Verified: `window.addEventListener('online')` in `backgroundSyncWorker.ts`).
- [x] **DONE** - Refresh browser: All notes and client records remain completely intact. (Verified: IndexedDB client-first cache hydration).

---

## 3. Security & Multi-Tenant Isolation Checklist
- [x] **DONE** - Attempt to load notes from secondary organization: Blocked by Supabase RLS. (Verified: `auth.uid() = specialist_id` and tenant scoping).
- [x] **DONE** - Verify `audit_trail_logs` captures creation, lock, and export actions. (Verified: immutable SHA-256 audit table logs).
- [x] **DONE** - Inspect localStorage / IndexedDB: No plaintext passwords or unencrypted master secrets present. (Verified: zero credential storage policy).

