# 06. Operations Deployment & Billing Operations

> **Category:** 06-operations-deployment / 06-operations-billing  
> **Status:** Production Active Standard  
> **Target Domain:** peernotebook.com  
> **SLA Objective:** 99.9% Application Availability • Zero Offline Field Data Loss

---

## Executive Overview
The **Operations Deployment & Billing Operations** suite provides infrastructure runbooks, telemetry observability guidelines, incident mitigation procedures, and Medi-Cal H0038 billing batch operations for **Peer Notebook** (peernotebook.com).

---

## Document Index

* [**infrastructure-runbook.md**](./infrastructure-runbook.md): Production Vercel Edge configuration, DNS records for `peernotebook.com`, and Supabase cluster parameters.
* [**monitoring-alerting.md**](./monitoring-alerting.md): Site Reliability Engineering (SRE) golden signals, sync queue latency monitoring, and alert escalation thresholds.
* [**incident-response.md**](./incident-response.md): P0–P3 incident classifications, on-call paging runbooks, and blameless post-mortem protocols.
* [**disaster-recovery.md**](./disaster-recovery.md): RTO (< 15 min) and RPO (< 1 min) recovery scenarios, storage quota management (`storage.persist()`), and OPFS failovers.
* [**h0038-billing-operations.md**](./h0038-billing-operations.md): County Medi-Cal claims processing, billing modifiers (U1, U2, GQ), and audit preparation workflows.
