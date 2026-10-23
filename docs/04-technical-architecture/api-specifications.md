# Backend API Specifications & Sync Contracts

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Protocols:** REST / Supabase PostgREST / JSON over HTTPS TLS 1.3

---

## 1. Authentication & Tenant Context
All requests to the backend relational cluster must pass a valid JWT in the `Authorization` header:
```http
Authorization: Bearer <supabase_jwt_token>
```
The decoded JWT claims contain:
* `sub`: User UUID
* `email`: User email
* `role`: User application role (`specialist`, `supervisor`, `admin`)
* `org_id`: Multi-tenant organization UUID

---

## 2. Core Endpoints & Payload Contracts

### `POST /rest/v1/session_notes`
Enqueues or creates a new encounter record.
* **Headers:** `Prefer: return=representation`, `x-idempotency-key: <uuid>`
* **Request Body:**
```json
{
  "org_id": "8a32a67e-5272-4d0a-9d6e-9844e138a011",
  "client_id": "c71b12de-3d44-48ee-a031-1582e5b77c12",
  "encounter_date": "2026-10-22",
  "place_of_service": "15",
  "direct_minutes": 45,
  "travel_minutes": 20,
  "documentation_minutes": 10,
  "billable_units": 3,
  "goal_addressed": "Navigating permanent supportive housing voucher options.",
  "interventions_provided": ["Role Modeling & Lived Experience", "Resource Navigation"],
  "client_response": "Client engaged enthusiastically. Stated: 'I feel ready to take this step.'",
  "next_steps": "Meet at housing office next Tuesday at 10 AM.",
  "status": "locked",
  "sha256_hash": "a4f89d34e6..."
}
```

### `POST /rest/v1/audit_trail_logs`
Appends an immutable compliance log entry. Writes are append-only; update and delete operations are rejected by database trigger.

---

## 3. Error Code Taxonomy
* `401 Unauthorized`: Missing or expired JWT token.
* `403 Forbidden`: RLS policy denied access to foreign organization records.
* `409 Conflict`: Conflict resolution triggered (resolved via Last-Write-Wins with audit preservation).
* `422 Unprocessable Entity`: Validation failure (e.g. direct minutes < 8 for billable note).
