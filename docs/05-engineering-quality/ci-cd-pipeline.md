# CI/CD Deployment Pipeline Specification

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**CI/CD Engine:** GitHub Actions + Vercel Edge Deployment

---

## 1. Pipeline Stages
```
[ Developer Git Push (master) ]
               │
               ▼
   [ GitHub Actions Runner ]
   ├── Stage 1: Dependency Install (`npm install --legacy-peer-deps`)
   ├── Stage 2: Lint & Style Verification (`npm run lint`)
   ├── Stage 3: Type Safety Verification (`tsc --noEmit`)
   ├── Stage 4: Production Build Bundle (`npm run build`)
   └── Stage 5: Security Dependency Audit (`npm audit`)
               │ (All checks GREEN)
               ▼
    [ Vercel Edge Global Deploy ]
   ├── Zero-Downtime Atomic Rollout
   ├── Custom Domain SSL Binding (`peernotebook.com`)
   └── SPA Rewrites Active (`/(.*) -> /index.html`)
```

---

## 2. Environment Variables & Secret Management
Production builds require zero secret variables in the client bundle. Only public connection variables are injected via `VITE_` prefix:
* `VITE_SUPABASE_URL`: Public HTTPS endpoint of Supabase project.
* `VITE_SUPABASE_ANON_KEY`: Public anonymous API key (secured via Row-Level Security).
All database service keys and administration secrets are strictly isolated on server-side cloud runbooks.
