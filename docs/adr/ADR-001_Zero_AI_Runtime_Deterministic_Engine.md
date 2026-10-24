# ADR-001: Zero-AI Runtime Deterministic Engine

## Status
**Accepted & Enforced** (Date: 2026-10-24)

## Context
Certified Peer Support Specialists (CPSS) in California document encounters under Medi-Cal CalAIM (HCPCS H0038 / POS 15) and California Mental Health Services Authority (CalMHSA) regulations. Emerging clinical software vendors frequently embed generative Artificial Intelligence (LLMs) to synthesize clinical notes.

However, in peer support environments:
1. **Confidentiality & PHI Leakage:** Transmitting peer narratives containing substance use recovery, community trauma, or psychiatric distress to cloud LLM APIs risks HIPAA 45 CFR § 164 and 42 CFR Part 2 non-compliance.
2. **Clinical Jargon & Hallucination Risk:** Generative AI models default to DSM-5 pathology language (e.g., "patient is resistant", "exhibits borderline tendencies"), which directly contradicts trauma-informed, strengths-based peer support recovery philosophy.
3. **Audit Disallowances:** County behavioral health clearinghouses disallow claims when AI-generated notes do not accurately reflect the authentic, real-time mutual aid encounter.

## Decision
We enforce a strict **Zero-AI Production Runtime Codebase Mandate**:
- Zero artificial intelligence or machine learning packages (e.g. `@google/genai`, OpenAI SDK, LangChain) exist in the production runtime bundle of `peernotebook.com`.
- All note validations, strengths-based language cleansing, and 15-minute billing unit conversions are executed strictly via deterministic, transparent, and auditable client-side TypeScript algorithms.
- A runtime badge `<ZeroAiBadge />` displays `"runtime: Zero-AI (Deterministic)"` across the public application navigation, footer, and system status dashboards.

## Consequences
- **Positive:** 100% auditable documentation; zero third-party AI attack vectors; complete compliance with HIPAA and California CMIA data residency; zero risk of AI hallucination during county audits.
- **Trade-off:** Note structuring and vocabulary assistance rely on rule-based heuristics and CPSS templates rather than open-ended natural language generation.
