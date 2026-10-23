# 04. Technical Architecture

> **Category:** 04-technical-architecture  
> **Status:** Production Active Standard  
> **Target Domain:** peernotebook.com  
> **Architecture:** Zero-AI Offline-First Progressive Web Application (PWA)  
> **Data Model:** Dual-Layer Persistence (Dexie.js IndexedDB + PostgreSQL Supabase RLS)

---

## Executive Overview
The **Technical Architecture** suite provides the deterministic engineering blueprint for **Peer Notebook** (peernotebook.com). The platform guarantees zero data loss in disconnected field environments through client-side transactional IndexedDB commits, seamlessly synchronized via an idempotent background worker to a multi-tenant PostgreSQL relational database protected by Row-Level Security (RLS).

---

## Document Index

* [**GA8_Production_Grade_Architecture_White_Paper.md**](./GA8_Production_Grade_Architecture_White_Paper.md): Approved GA #8 Enterprise Architecture White Paper detailing system classification, dual persistence, and CalAIM alignment.
* [**system-architecture.md**](./system-architecture.md): Component topology, 7-step note lifecycle, service worker caching, and edge routing.
* [**data-models.md**](./data-models.md): Complete Entity Relationship Diagram (ERD), TypeScript interfaces, Dexie tables, and Supabase SQL DDL schemas.
* [**api-specifications.md**](./api-specifications.md): REST and RPC contracts, JWT authorization headers, idempotency keys, and error code taxonomy.
* [**security-threat-model.md**](./security-threat-model.md): Comprehensive STRIDE threat analysis, WebCrypto client-side encryption, and KMS data-at-rest safeguards.
* [**07_Offline_Sync_IndexedDB.md**](./07_Offline_Sync_IndexedDB.md): Offline synchronization state machine, background worker queue, and Last-Write-Wins conflict resolution.
* [**05_Compliance_Engine_PDF_Export.md**](./05_Compliance_Engine_PDF_Export.md): Automated 4-part note validation, immutable audit trails, SHA-256 tamper-evident hashing, and client-side PDF export.
* [**08_HIPAA_BAA_Consent_Model.md**](./08_HIPAA_BAA_Consent_Model.md): HIPAA Security Rule 45 CFR § 164, CMIA Civil Code § 56, digital signature vector capture, and SHA-256 consent binding.
