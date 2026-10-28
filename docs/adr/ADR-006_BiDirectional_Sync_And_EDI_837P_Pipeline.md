# ADR-006: Bi-Directional Sync Engine & ANSI X12 EDI 837P Claims Pipeline

## Status
**Accepted & Enforced** (Date: 2026-10-28)

## Context
Certified Peer Support Specialists navigate inconsistent field connectivity across homeless encampments, mobile crisis units, and community centers. Furthermore, county Medi-Cal payers require electronic submission of batch professional claims under standard ANSI ASC X12N 837P (005010X222A1) format for HCPCS H0038 encounters. Data must persist offline in Dexie.js and synchronize bi-directionally with Supabase PostgreSQL without race conditions or PII exposure.

## Decision
1. **Bi-Directional Sync Architecture (`syncService.ts`):**
   - **Local-First Precedence:** All client records and progress notes are committed to Dexie.js (IndexedDB) prior to cloud network dispatch.
   - **Queue-Based Exponential Backoff:** Failed synchronization attempts retry with exponential backoff ($\min(30000, 1000 \cdot 2^{\text{attempt}})$ ms).
   - **Deterministic Conflict Resolution:** Last-write-wins based on verifiable client-side UTC ISO-8601 timestamps.
   - **Event-Driven Lifecycle:** Monitors window `online` and `offline` events to automatically flush mutation queues.
2. **ANSI X12 EDI 837P Claims Generator (`edi837pService.ts`):**
   - Synthesizes EDI 837P batches containing mandatory interchange (ISA/IEA), functional group (GS/GE), and transaction set (ST/SE) headers.
   - Maps billing CBOs into Loop 2000A (NM1\*85) and Medicaid subscribers into Loop 2000B (NM1\*IL).
   - Generates Loop 2400 SV1 professional service lines specifying HCPCS H0038, Place of Service 15, and CMS 8-minute computed billing units.
   - Standard ANSI delimiters: element separator `*` and segment terminator `~`.
3. **Multi-Tenant CBO RBAC Isolation:**
   - Multi-tenant tables enforce `cbo_id UUID NOT NULL`.
   - Security Definer helper functions `get_auth_cbo_id()` and `get_auth_role()` isolate data access across `peer_specialist`, `peer_supervisor`, `cbo_admin`, and `super_admin`.

## Consequences
- **Positive:** Zero data loss during offline community outreach; automated generation of EDI 837P batch files eliminates manual billing transpositions; strict multi-tenant RLS guarantees compliance with 45 CFR § 164.312(b).
