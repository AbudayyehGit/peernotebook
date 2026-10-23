# Production Infrastructure Runbook & Domain Setup

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Host Architecture:** Vercel Edge Network + Supabase PostgreSQL Cluster

---

## 1. Domain Configuration for peernotebook.com
Peer Notebook is hosted directly on the Vercel Edge Network with root-level DNS binding:

| Record Type | Host / Name | Target / Value | TTL | Note |
|---|---|---|---|---|
| **A Record** | `@` (apex) | `76.76.21.21` | Auto (3600) | Points peernotebook.com to Vercel global edge proxy |
| **CNAME** | `www` | `cname.vercel-dns.com` | Auto (3600) | Canonical redirect to apex |
| **CAA** | `@` | `0 issue "letsencrypt.org"` | 3600 | Restricts SSL authority to Let's Encrypt |

SSL certificates are provisioned automatically via Let's Encrypt with automated 60-day renewals.

---

## 2. Vercel Project Build Specification (`vercel.json`)
```json
{
  "installCommand": "npm install --legacy-peer-deps",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
* **Build Command:** `tsc && vite build` (configured in `package.json`).
* **Output Directory:** `dist`.
* **SPA Routing:** All route paths (including `/docs` and deep links) resolve to `/index.html` for client-side routing.

---

## 3. Supabase Relational Cluster Topology
* **Database Engine:** PostgreSQL 15.6 on AWS us-west-1 (Northern California) for low-latency west coast access.
* **Connection Pooling:** PgBouncer transaction-mode pooling (port 6543) enabled for high concurrent connection bursts.
* **Point-in-Time Recovery (PITR):** Continuous WAL archiving with 7-day retention window.
