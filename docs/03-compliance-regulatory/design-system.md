# Trauma-Informed Clinical Design System

**Document Version:** 1.0-GA  
**Target Domain:** peernotebook.com  
**Design Philosophy:** Strictly Light Mode • Low-Arousal Clinical Ergonomics • Zero-Glare Soft Slate

---

## 1. Visual Token Architecture

### Primary Palette Tokens
* **Surface Background (`#F8FAFC` - Soft Slate):** A gentle, off-white slate background designed to prevent screen glare during long field shifts and reduce sympathetic nervous system stimulation.
* **Header & Structural Core (`#1E3A8A` - Deep Navy):** Provides high-contrast stability, authority, and legibility for primary navigation, headings, and branding elements.
* **Interactive Primary (`#0F766E` - Muted Teal):** A grounding, therapeutic teal utilized for primary action buttons, active navigation states, and focus outlines.
* **Synced / Success State (`#16A34A` - Forest Green):** Indicates successful local-to-cloud synchronization, audit verification pass states, and signed notes.
* **Pending / Offline Queued State (`#D97706` - Warm Amber):** Highlights offline-queued operations, draft notes awaiting lock, and items requiring attention without triggering alarm panic.

### Prohibited Tokens
* Pure Pitch Black (`#000000`) background dark mode is strictly disallowed to avoid clinical screen disorientation and high visual contrast fatigue in field sunlight.
* Saturated, neon warning colors (e.g. flashing crimson red alerts) are replaced with calm amber tints (`#FEF3C7` / `#D97706`) to preserve trauma-informed calm.

---

## 2. Touch Target & Responsive Geometry
Field specialists frequently use ruggedized mobile tablets or smartphones with one hand while on transit, in encampments, or at shelter facilities. 

* **Minimum Interactive Touch Targets:** Every button, input field, tab bar item, and multi-select intervention pill must measure at least **44px to 48px** in height and width.
* **Container Geometry:**
  * Container Cards: `rounded-2xl` with soft ambient drop shadows (`shadow-sm` / `drop-shadow-md`).
  * Interactive Pills / Tags: `rounded-full` with explicit padding (`px-3 py-2`) ensuring comfortable finger taps.
* **Form Layout:**
  * Inputs utilize 16px (`text-base`) font size to prevent iOS Safari automatic zooming upon focus.
  * Explicit focus rings (`ring-2 ring-[#0F766E]`) provide unmistakable keyboard and screen reader focus states.
