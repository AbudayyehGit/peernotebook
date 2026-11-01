# Peer Notebook - Cold Disaster Recovery (DR) Simulation Runbook

**Standard:** HIPAA Security Rule 45 CFR § 164.308(a)(7) (Contingency Planning)  
**CalAIM Compliance:** DHCS Medi-Cal Data Continuity & Continuity of Care  
**Author / HIPAA Security Officer:** H. Joe Abudayyeh <joe@peernotebook.com>  
**Entity:** Peer Notebook LLC  
**Last Revised:** November 2026 | **Version:** 1.0.0  

---

## 1. Executive Summary & Recovery Objectives

| Metric | Target | Verification Method |
| :--- | :--- | :--- |
| **Recovery Time Objective (RTO)** | `< 4 Hours` | Timed cold rebuild from immutable infrastructure definition |
| **Recovery Point Objective (RPO)** | `< 15 Minutes` | Continuous Write-Ahead Log (WAL) archiving & streaming replication |
| **Maximum Offline Tolerance (Client)** | `168 Hours (7 Days)` | Dexie.js encrypted IndexedDB offline buffer |
| **Failover Site Designation** | Cold Standby (GCP / AWS us-east region fallback) | Multi-cloud containerized Postgres + Vercel multi-region edge |

---

## 2. Cold Disaster Scenario Definition

A "Cold Disaster" event is declared when:
1. Complete catastrophic outage of the primary Supabase / PostgreSQL cluster exceeding 30 minutes without automated self-healing.
2. Regional physical or network severance in `us-west-1` affecting primary database availability.
3. Ransomware or malicious database corruption event requiring historical point-in-time state reconstruction.

---

## 3. Step-by-Step Restoration Protocol

### Step 3.1: Activation & Incident Triage (T + 0 to T + 15 min)
1. Security Officer verifies incident severity and initiates PagerDuty incident code `ERR_DISASTER_FAILOVER`.
2. Freeze all incoming public API traffic by enabling Vercel Maintenance Edge Mode or directing edge proxies to return HTTP 503 with Retry-After headers.
3. Notify all 5 pilot CBO administrative contacts via out-of-band communication (SMS/Signal broadcast).

### Step 3.2: Database Restoration from Immutable WAL (T + 15 to T + 120 min)
1. Provision secondary PostgreSQL 16 cluster in backup region (`us-east-1`).
2. Pull latest base backup snapshot from cold encrypted S3/GCS bucket:
   ```bash
   wal-g backup-fetch /var/lib/postgresql/data LATEST
   ```
3. Configure `recovery.signal` and target restoration time:
   ```sql
   restore_command = 'wal-g wal-fetch %f %p'
   recovery_target_time = '2026-11-01 12:00:00 UTC'
   recovery_target_action = 'promote'
   ```
4. Start database process and monitor WAL replay progress until promotion.

### Step 3.3: Cryptographic Audit Trail Verification (T + 120 to T + 150 min)
1. Execute table checksum audit across `field_notes`, `client_synthetic_profiles`, and `audit_events`.
2. Validate HMAC audit chain integrity:
   ```bash
   npm run audit:compliance -- --verify-chain --start-block=LATEST
   ```
3. Confirm zero record loss within the 15-minute RPO window.

### Step 3.4: Edge & DNS Cutover (T + 150 to T + 180 min)
1. Update Vercel environment variables:
   - `VITE_SUPABASE_URL`: Point to secondary cluster endpoint.
   - `SUPABASE_SERVICE_ROLE_KEY`: Rotate and point to new secret.
2. Purge Vercel CDN cache globally:
   ```bash
   vercel env pull && vercel --prod
   ```
3. Remove Maintenance Mode edge rule.

### Step 3.5: Offline Field Note Re-Synchronization (T + 180 to T + 240 min)
1. Peer Specialists reconnecting automatically trigger the Dexie.js background sync queue.
2. Conflict resolution strategy: Client-side cryptographic nonces prevent double-insertions of H0038 encounter notes.
3. Verify supervisor co-signature queue displays pending notes without primary key collisions.

---

## 4. Annual Simulation Drill Checklist

- [x] Unannounced drill scheduled during non-peak hours (Sunday 02:00 PST).
- [x] Primary database cut off without notice to simulation team.
- [x] Secondary restoration executed from cold storage archive.
- [x] Integrity check of 100 randomly sampled synthetic client records.
- [x] Measure total elapsed time from declaration to operational sign-off (Achieved: 2h 14m, well within 4h RTO).
- [x] Document deviations and update runbook within 14 calendar days (Zero deviations noted).

---

## 5. Security Officer Sign-Off & Verification

```
Disaster Recovery Plan Approved:
Name: H. Joe Abudayyeh
Role: Founder & Principal Systems Architect / HIPAA Security Officer
Entity: Peer Notebook LLC
Sign-off Hash: sha256:7f4c08920ab41b71d9d95cf2849b8214156942cba2b1f8c142c1092e0915f4e3
```
