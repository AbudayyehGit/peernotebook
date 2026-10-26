# Stripe Subscription, Free Trial & Self-Serve Billing Architecture

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Applicability:** Founding Member Tier, 1099 Solo Pro, CBO Agency Teams, Stripe Checkout & Customer Portal  
**Regulatory Standards:** PCI-DSS Level 1 via Stripe, CalAIM Multi-Tenant RLS, HIPAA BAA Protection  

---

## 1. Executive Summary & Revenue Architecture

Peer Notebook operates on a predictable, non-predatory SaaS subscription model designed specifically for Certified Peer Support Specialists (CPSS-CA), independent 1099 recovery navigators, and California Community-Based Organizations (CBOs). 

To ensure zero cognitive friction and eliminate barriers to clinical adoption, Peer Notebook provides an instant **14-Day Full-Access Free Trial** with no credit card required upfront. Users experience 100% offline note-taking, automated CalAIM H0038 billing unit conversion, tamper-evident SHA-256 PDF note exports, and encrypted local storage before committing to a paid plan.

---

## 2. Subscription Tiers & Unit Economics

| Plan Tier | Target Audience | Monthly Price | Annual Price (Save 17%) | Core Features |
|---|---|---|---|---|
| **Founding Specialist** | Solo CPSS-CA, Peer Mentors | **$19 / mo** | **$190 / yr** ($15.83/mo) | 14-Day Free Trial, 100% Offline Dexie.js, 4-Part CalAIM DAP Notes, 15-Min Unit Math, SHA-256 PDF Export, AES-GCM Encrypted Backup |
| **Solo 1099 Pro** | Independent Contractors, Dual-Agency Coaches | **$39 / mo** | **$390 / yr** ($32.50/mo) | All Founding features + 1099 Contractor Tax Ledger, IRS Mileage Reimbursement ($0.67/mi), Contract Hourly Rate Math, Multi-Agency Routing |
| **Agency / CBO Team** | Non-Profits, County Health Departments | **$149 / mo** | **$1,490 / yr** ($124.16/mo) | All Pro features + Unlimited Peer Specialists, Supervisor Note Cosigning Queue, Agency RBAC Admin, County 837P EDI Preparation |

---

## 3. Stripe Integration Lifecycle & Webhooks

Peer Notebook leverages Stripe Checkout and Stripe Customer Portal via secure HTTPS serverless proxy routes (`/api/stripe-checkout`, `/api/stripe-portal`, `/api/stripe-webhook`) and Supabase Edge Functions (`supabase/functions/stripe-webhook`).

### Handled Webhook Events
1. **`checkout.session.completed`**: Resolves customer metadata (`tier`, `interval`, `customerEmail`), assigns `stripe_customer_id` and `stripe_subscription_id`, sets `subscription_status = 'active'`, and records audit log.
2. **`customer.subscription.updated`**: Syncs subscription status (`active`, `past_due`, `canceled`, `trialing`), renewal period end timestamps, and cancellation intent.
3. **`customer.subscription.deleted`**: Marks `subscription_status = 'canceled'` upon expiration while preserving local offline client notes in Dexie.js so no clinical data is ever lost.
4. **`invoice.payment_succeeded`**: Reconciles recurring invoice payments, updates active subscription dates, and logs to `billing_invoices`.

---

## 4. Self-Serve Customer Portal & Feature Gating

Users can access the **Stripe Customer Portal** with 1 click from the Peer Notebook Settings Panel or the Billing Modal to:
- Update credit card or payment methods.
- Switch between Monthly and Annual billing intervals.
- Upgrade or downgrade subscription tiers.
- Download historical PDF invoices and receipts for business expense deductions.
- Pause or cancel auto-renewal with guaranteed zero data lockout.

### Feature Gating Rules
- **Local Note Logging & Reading:** Always accessible offline regardless of subscription status.
- **Real-Time Cloud Sync:** Requires active 14-day free trial or active subscription.
- **Encrypted Backup Export:** Requires active trial or active subscription.
- **1099 Mileage & Billing Math:** Active on Solo 1099 Pro and Agency tiers.
- **Supervisor Note Approval Queue:** Active on Agency / CBO Team tier.
