# Open-Source Licensing & Third-Party Dependency Attribution

**Document ID:** PN-LEGAL-2026-OSS-008  
**Category:** 07-legal-administrative  
**Entity:** Peer Notebook LLC (California Limited Liability Company)  
**Target Domain:** [peernotebook.com](https://peernotebook.com)  
**Standard:** SPDX Compliance & Institutional Acquisition Audit Readiness

---

## 1. Dual-Licensing Architecture & Commercial Reservation

Peer Notebook operates under a clean, institutional-grade dual-licensing structure:

1. **Proprietary Commercial Codebase (Peer Notebook LLC):**  
   The proprietary core of Peer Notebook—including the CalAIM H0038 billing calculation algorithms, the 4-part clinical note validation engine, the trauma-informed design tokens, the Supabase Row-Level Security configurations, and the Master Documentation Binder—is the exclusive intellectual property of **Peer Notebook LLC** (Copyright © 2026 Peer Notebook LLC. All rights reserved).  
   Commercial usage, sublicensing, white-labeling, or enterprise deployment requires a valid license agreement with Peer Notebook LLC.

2. **Open Standards & Interoperability Specification (Apache License 2.0):**  
   The open-standard specifications for client-side peer support offline note interchange and JSON schema definitions are released under the terms of the Apache License, Version 2.0.

---

## 2. Core Third-Party Dependency Attribution Matrix

Peer Notebook is built upon high-integrity, permissive open-source libraries. In accordance with their respective licenses (MIT, Apache 2.0, ISC, BSD), Peer Notebook LLC hereby provides formal attribution and copyright acknowledgment:

| Library / Package | Version Tier | License Type | Copyright / Author | Functional Role in Platform |
|---|---|---|---|---|
| **React** | `^19.0.1` | MIT | © Meta Platforms, Inc. & React Contributors | Declarative Component Architecture |
| **React DOM** | `^19.0.1` | MIT | © Meta Platforms, Inc. & React Contributors | Client DOM Reconciliation & Rendering |
| **Vite** | `^8.3.0` | MIT | © 2019-present Evan You & Vite Contributors | Production Build System & HMR Tooling |
| **Dexie.js** | `^4.4.6` | Apache 2.0 | © 2014-2026 David Fahlander | Client-Side IndexedDB Offline Persistence Engine |
| **Tailwind CSS** | `^4.3.3` | MIT | © Tailwind Labs, Inc. | Trauma-Informed Utility Design Token System |
| **Lucide React** | `^0.546.0` | ISC | © 2022 Lucide Contributors | Accessible SVG Healthcare & Navigation Icons |
| **Supabase JS** | Standard | MIT | © Supabase, Inc. | PostgreSQL Client & Realtime WebSocket Connector |
| **Motion** | `^12.23.24` | MIT | © Framer B.V. & Motion Contributors | Low-Arousal Smooth View Transitions |
| **jsPDF** | Standard | MIT | © 2010-2026 James Hall & Parvez | Client-Side Cryptographic PDF Export Compiler |
| **TypeScript** | `^7.0.2` | Apache 2.0 | © Microsoft Corporation | Static Type Safety & Strict Model Contracts |
| **Express** | `^4.21.2` | MIT | © StrongLoop, Inc. & Express Contributors | Backend API Middleware & SSR Scaffolding |

---

## 3. Full License Texts of Primary Upstream Permissive Dependencies

### 3.1 The MIT License (MIT)
*Applies to React, Vite, Tailwind CSS, Lucide React, Supabase JS, jsPDF, Motion, Express:*

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 3.2 The Apache License, Version 2.0
*Applies to Dexie.js, TypeScript, and open specifications:*

```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

## 4. Acquisition & Institutional Audit Verification Checklist

- [x] **Zero GPL / AGPL Contamination:** Audit confirms no Copyleft (GPL, AGPL, LGPL, SSPL) dependencies exist in the production runtime bundle.
- [x] **Clean IP Chain of Title:** 100% of custom authoring assigned from founder to Peer Notebook LLC via `06_IP_Assignment_Agreement.md`.
- [x] **No Vulnerable Transitive Dependencies:** Continuous automated dependency scanning verified via `npm audit`.
- [x] **Permissive Commercial Re-Distribution:** All open-source packages permit commercial SaaS deployment, private deployment, and corporate acquisition without mandatory code disclosure.
