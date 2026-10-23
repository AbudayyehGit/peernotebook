# Pre-Flight QA Checklists & Field Regression Matrix

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Audit Standard:** CalAIM Ready & HIPAA Compliant

---

## 1. Field Usability & Touch Verification (375px Mobile & 768px Tablet)
- [ ] Top Header Navigation elements (Logo, Sync Badge, Org Select) do not overlap or wrap destructively on 375px mobile screen.
- [ ] Direct, Travel, and Doc time numerical inputs allow fast one-touch number entry without keyboard obstruction.
- [ ] Multi-select intervention pills have generous hitboxes (>= 44px min-h) allowing quick thumb selection in field trucks.
- [ ] Quoted text detection turns green only when valid quotation marks (`"..."`) are typed.
- [ ] PDF export generates single clean 8.5"x11" portrait page with legible typography and crisp SHA-256 hash.

---

## 2. Offline Resilience Matrix
- [ ] Turn off Wi-Fi / cellular data (Simulate Offline).
- [ ] Create new client: Verify record is saved instantly to IndexedDB `clients` table.
- [ ] Log complete 4-part note: Verify note is saved with status `draft`.
- [ ] Tap "Finalize & Lock Note": Status transitions to `locked`, SHA-256 fingerprint generated.
- [ ] Observe Sync Status Pill: Displays Warm Amber `#D97706` indicating "1 unsynced item queued".
- [ ] Reconnect Wi-Fi: Background sync triggers within 600ms; status pill transitions to Forest Green `#16A34A` ("All changes saved").
- [ ] Refresh browser: All notes and client records remain completely intact.

---

## 3. Security & Multi-Tenant Isolation Checklist
- [ ] Attempt to load notes from secondary organization: Blocked by Supabase RLS.
- [ ] Verify `audit_trail_logs` captures creation, lock, and export actions.
- [ ] Inspect localStorage / IndexedDB: No plaintext passwords or unencrypted master secrets present.
