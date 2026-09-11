# Domain 1 Audit & Decision Log: Gameplay Engine & Realtime State Machine

**Topic Branch:** `audit/domain-1-gameplay-engine`  
**Target Domain:** Gameplay Engine, Realtime Sync, Accessibility, & Audio Cues  
**Status:** In Progress  

---

## 📋 Domain Scope Files
1. [`src/components/game/CardFlip.tsx`](file:///e:/GuessWho/src/components/game/CardFlip.tsx)
2. [`src/components/game/MultiplayerBoard.tsx`](file:///e:/GuessWho/src/components/game/MultiplayerBoard.tsx)
3. [`src/components/game/GameBoard.tsx`](file:///e:/GuessWho/src/components/game/GameBoard.tsx)
4. [`src/components/game/QuestionAssistant.tsx`](file:///e:/GuessWho/src/components/game/QuestionAssistant.tsx)
5. [`src/components/game/GuessModal.tsx`](file:///e:/GuessWho/src/components/game/GuessModal.tsx)
6. [`src/components/game/VictoryModal.tsx`](file:///e:/GuessWho/src/components/game/VictoryModal.tsx)
7. [`src/app/play/[roomCode]/page.tsx`](file:///e:/GuessWho/src/app/play/%5BroomCode%5D/page.tsx)
8. [`src/app/play/practice/page.tsx`](file:///e:/GuessWho/src/app/play/practice/page.tsx)

---

## 🔍 Audit Findings & Architectural Enhancements

### 1. Nested Interactive Element Accessibility Violation in `CardFlip.tsx`
- **Issue**: The outer wrapper `div` in [`CardFlip.tsx:L56`](file:///e:/GuessWho/src/components/game/CardFlip.tsx#L56) is defined with `role="button"` and `tabIndex={0}`. Inside the card footer, nested `<button>` elements (`btn-select`, `btn-guess`, `btn-restore`) are rendered.
- **Violation**: HTML5 accessibility specs prohibit nesting clickable `<button>` elements inside a parent `role="button"`. This causes screen reader double-announcements and focus management issues when navigating via keyboard (Tab / Space).
- **Fix**: Update outer wrapper to `role="group"` with an explicit `aria-label`, keeping inner buttons clean and keyboard accessible.

### 2. Audio Cue Consistency & User Gesture Unlock
- **Issue**: Sound triggers in [`GameBoard.tsx`](file:///e:/GuessWho/src/components/game/GameBoard.tsx) and [`MultiplayerBoard.tsx`](file:///e:/GuessWho/src/components/game/MultiplayerBoard.tsx) invoke `soundFx` on state updates without explicit AudioContext resume checks on initial user touch/click.
- **Fix**: Ensure `soundFx` lazily resumes Web Audio `AudioContext` on first card tap/click.

### 3. Dual Readiness Gate & Atomic First Turn Synchronization
- **Issue**: In [`MultiplayerBoard.tsx`](file:///e:/GuessWho/src/components/game/MultiplayerBoard.tsx), when both players choose their secret character simultaneously, host auto-start listener triggers `handleStartActiveMatch()`.
- **Harden**: Ensure random first turn assignment (`Math.random() < 0.5`) broadcasts `game_started` with exact timestamp `turnStartedAt` and synchronously updates PostgreSQL room state.

---

## 📝 Decisions Log

| Decision ID | Target File | Problem | Implemented Solution |
| :--- | :--- | :--- | :--- |
| **DEC-D1-01** | `CardFlip.tsx` | Nested `<button>` inside parent `role="button"` | Changed parent `role="button"` to `role="group"`, added explicit button focus rings |
| **DEC-D1-02** | `MultiplayerBoard.tsx` | Dual readiness match start state sync | Atomic broadcast payload containing starting player & timestamp persisted to DB |
| **DEC-D1-03** | `GameBoard.tsx` | Practice mode card flip sound cue | Added lazy Web Audio unlock guard on initial card flip |

---

## 🧪 Verification Checkpoints
- [ ] `npx tsc --noEmit` returns 0 type errors
- [ ] `npm run lint` returns 0 errors and 0 warnings
- [ ] `npm run build` succeeds cleanly
