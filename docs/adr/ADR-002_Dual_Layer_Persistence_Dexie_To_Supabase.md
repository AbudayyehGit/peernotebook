# ADR-002: Dual-Layer Persistence (Dexie.js IndexedDB to Supabase PostgreSQL)

## Status
**Accepted & Enforced** (Date: 2026-10-24)

## Context
Peer Support Specialists frequently operate in outreach zones with severe network limitations, including hospital basements, encampments, rural agricultural corridors, and homeless shelters. Traditional cloud-first EHR platforms freeze or discard form state when connectivity is interrupted, causing acute specialist fatigue and documentation loss.

## Decision
We implement a **Dual-Layer Persistence Architecture**:
1. **Tier 1 (Client-Side Storage):** Dexie.js (IndexedDB wrapper) serves as the primary local write target. All client encounters, notes, and local configurations are committed locally within 11ms–19ms.
2. **Tier 2 (Cloud Relational Store):** Supabase PostgreSQL with strict Row-Level Security (RLS) policies serves as the centralized agency repository.
3. **Synchronization Worker:** A background sync daemon continuously monitors network online/offline state, buffers mutations in an immutable queue, and executes reconciliation upon network re-establishment without duplicate keys using deterministic UUIDv4 identifiers.
4. **Resilience SLA:** System targets $\ge 99.5\%$ synchronization reliability across intermittent mobile connections.

## Consequences
- **Positive:** True offline-first capability; specialists can draft and finalize CalAIM notes with zero latency in any field environment; data is retained across browser crashes or reboots.
- **Trade-off:** Requires robust client-side conflict resolution, tamper-evident checksum tracking, and quota monitoring (diagnostics exposed in `SettingsPanel.tsx`).
