# SRE Observability Telemetry & Alerting Standards

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**SRE Principles:** Google SRE Golden Signals (Latency, Traffic, Errors, Saturation)

---

## 1. Golden Signals & SLI/SLO Targets

| Signal | Metric / SLI | Target SLO | Warning Alert Threshold | Critical Alert (Paging) |
|---|---|---|---|---|
| **Latency** | IndexedDB Local Save Time | 99% < 25ms | P95 > 50ms | P95 > 150ms |
|  | Remote Supabase Sync Batch | 95% < 800ms | P95 > 1500ms | P95 > 3000ms |
| **Traffic** | Daily Active Field Specialists | Baseline tracking | Sudden 50% drop | Zero traffic during business hours |
| **Errors** | HTTP 5xx Server Error Rate | < 0.1% | > 0.5% for 5 min | > 2.0% for 2 min |
|  | Unsynced Queue Overflow (> 50 items) | 0% of active sessions | > 5 specialists affected | > 20 specialists affected |
| **Saturation** | Client Storage Quota Usage | < 60% of device allowance | > 75% quota used | > 90% quota used |

---

## 2. Privacy-Safe Telemetry Principles
In accordance with HIPAA and trauma-informed design:
* **Zero PHI in Logs:** No client names, quotes, or notes are transmitted in telemetry or error monitoring.
* **Aggregated Health Metrics Only:** Telemetry tracks only anonymous operational metrics (e.g. sync queue depth, save duration, network reconnect events).
