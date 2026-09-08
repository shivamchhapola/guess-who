# Workspace AI Guidelines & Standards

These guidelines govern code generation, design patterns, and quality requirements for AI assistants working in this repository.

---

## Code Quality & Style Rules

1. **TypeScript Strictness**:
   - Always define explicit types or interfaces for props, function return types, and state models.
   - Avoid `any`. Use generics or `unknown` where dynamic typing is necessary.

2. **Component Architecture**:
   - Next.js App Router: Mark interactive components with `'use client'` explicitly at top of file.
   - Keep components modular and focused on a single responsibility (e.g. `CardGrid`, `CardFlip`, `RoomHeader`, `TurnIndicator`).

3. **Design System & Aesthetics**:
   - Enforce premium, dynamic design aesthetics (dark modes, vibrant accent gradients, glassmorphism, subtle micro-animations).
   - Use Framer Motion for card flip state transitions and modal entries.
   - Always include audio cues (via Web Audio API or lightweight HTML5 audio triggers) for interactive gameplay elements.

4. **Testing & Verification**:
   - Never complete a task without running `npm run build` or type checks.
