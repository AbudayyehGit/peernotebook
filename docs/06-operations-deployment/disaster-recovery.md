# Disaster Recovery & Storage Quota Management

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Objectives:** RTO < 15 Minutes • RPO < 1 Minute • Zero Lost Field Notes

---

## 1. Client-Side Persistent Storage Quotas
To prevent browsers from evicting local IndexedDB databases under low device storage pressure, Peer Notebook invokes the standard Persistent Storage API:
```typescript
if (navigator.storage && navigator.storage.persist) {
  const isPersisted = await navigator.storage.persist();
  console.log(`Persistent storage granted: ${isPersisted}`);
}
```
* **Quota Probes:** Periodically monitors `navigator.storage.estimate()` to alert specialists if device storage exceeds 80% capacity.
* **Manual Data Portability:** Specialists can download complete JSON database backups directly from `SettingsPanel.tsx` at any time.

---

## 2. Cloud Database Backup & Failover
* **Continuous Point-In-Time Recovery (PITR):** PostgreSQL WAL logs allow restoration down to the exact second.
* **Daily Automated Snapshots:** Encrypted geometric backups stored in multi-region AWS S3 buckets with 30-day immutability lock.
* **Disaster Recovery Drill Cadence:** Semi-annual simulated regional failover exercises validating RTO < 15 minutes.
