# ADR-004: WCAG 2.1/2.2 AA Trauma-Informed Design Tokens

## Status
**Accepted & Enforced** (Date: 2026-10-24)

## Context
Peer support encounters involve individuals experiencing acute trauma, neurodivergence, sensory sensitivities, and chronic stress. Traditional clinical user interfaces with harsh contrasts, pure black backgrounds, neon alert states, and dense table layouts trigger cognitive fatigue and distress. Additionally, mobile outreach requires strict adherence to physical accessibility (touch targets, outdoor glare visibility).

## Decision
We enforce **Trauma-Informed Light-Mode Tokens & WCAG 2.1/2.2 AA Standards**:
1. **Background Surface:** Low-arousal Soft Slate off-white (`#F8FAFC`). Pure black or harsh dark modes are excluded to avoid visual shock in unpredictable lighting.
2. **Card Surfaces:** Pure White (`#FFFFFF`) with subtle borders (`border-slate-200/90`) and soft shadows (`shadow-sm`).
3. **Typography & Contrast:** Deep Navy (`#1E3A8A`) for headers and primary typography, maintaining a contrast ratio $\ge 7.1:1$ (exceeding WCAG AAA). Muted Teal (`#0F766E`) for primary interactive triggers (contrast $\ge 4.6:1$).
4. **State Indicators:** Forest Green (`#16A34A`) for verified sync/success; Warm Amber (`#D97706`) for caution.
5. **Touch Ergonomics:** All clickable elements (buttons, inputs, pills, navigation items) maintain a minimum touch bounding box of 44px–48px.
6. **Responsive Markdown Wrappers:** All documentation containers use `w-full overflow-x-auto` to eliminate horizontal scrolling across small viewports (<640px).

## Consequences
- **Positive:** Low cognitive strain; optimal readability in bright daylight and under fluorescent clinic lighting; full compliance with accessibility standards (Section 508 & ADA Title III).
