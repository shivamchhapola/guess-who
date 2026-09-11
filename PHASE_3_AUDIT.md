# Phase 3 Technical Audit: Solo Practice Mode & AI Strategy Engine

## 🎯 Executive Summary
This document provides a read-only technical audit of solo practice mode, offline game board state management, template deck rehydration, and AI opponent behavior in **GuessWhooo?** ([`src/app/play/practice/page.tsx`](file:///e:/GuessWho/src/app/play/practice/page.tsx), [`src/components/game/GameBoard.tsx`](file:///e:/GuessWho/src/components/game/GameBoard.tsx)).

---

## 🔍 Detailed Subsystem Audit Findings

### 1. Custom Supabase Template Rehydration Failure in Practice Route
- **Current Pattern**: In `src/app/play/practice/page.tsx` (lines 15-26), `allTemplatesList` contains only static built-in templates (`THE_OFFICE_TEMPLATE`, `ALL_POPULAR_TEMPLATES`, `CLASSIC_GUESS_WHO_TEMPLATE`).
- **Vulnerability / Gap**: When a user creates a custom photo deck in `/create` and clicks "Solo Practice", they are redirected to `/play/practice?template=<UUID>`. In `PracticeContent`, `allTemplatesList.find(t => t.id === templateId)` returns `undefined` because custom Supabase decks are not in the static list. It quietly defaults back to `THE_OFFICE_TEMPLATE`.
- **User Impact**: Users cannot play solo practice mode with their custom uploaded photo decks.
- **Architectural Solution Plan**: Add remote Supabase template query in `practice/page.tsx` when `templateId` is a UUID, rehydrating custom user decks for solo play.

---

### 2. Lack of Computer AI Turn Engine in Practice Mode
- **Current Pattern**: In `GameBoard.tsx`, `opponentSecretId` is selected at random on match start. The human player flips cards down and makes a final guess.
- **Vulnerability / Gap**: There is currently no simulated computer AI turn cycle. The computer opponent never asks questions, flips cards, or takes turns against the human player's secret card.
- **User Impact**: Solo practice feels static (like a puzzle) rather than a dynamic 2-player match against an AI opponent.
- **Architectural Solution Plan**: Implement an automated AI turn loop in `GameBoard.tsx` (after each player turn, trigger a simulated AI turn where the computer eliminates 1–3 cards or asks an attribute question).

---

### 3. Audio Mute State Synchronization Discrepancy
- **Current Pattern**: `GameBoard.tsx` (line 33) initializes `const [isMuted, setIsMuted] = useState<boolean>(false);`.
- **Vulnerability / Gap**: `isMuted` does not query `soundFx.getMutedState()` on mount. If a player muted audio in a multiplayer room or previous session, `GameBoard.tsx` renders the unmuted icon (`Volume2`) despite `soundFx` remaining muted internally.
- **User Impact**: Mute button icon UI state out-of-sync with `soundFx` internal audio manager.
- **Architectural Solution Plan**: Initialize `isMuted` state with `soundFx.getMutedState()` on component mount.

---

### 4. Empty Card Attributes in Custom Deck AI Evaluation
- **Current Pattern**: `types/game.ts` defines `attributes: Record<string, unknown>`. In `/create`, new cards default to `attributes: {}`.
- **Vulnerability / Gap**: Without card attributes (gender, hair color, glasses, hats), AI question assistant generators and computer deduction solvers cannot calculate attribute frequencies.
- **User Impact**: Question Assistant and AI solvers cannot generate smart category questions for custom photo decks.
- **Architectural Solution Plan**: Provide fallback visual tag generator or attribute inference utility in `setUtils.ts` for custom decks.

---

## 📊 Phase 3 Audit Summary Matrix

| Finding ID | Subsystem | Severity | Status | Impact | Proposed Architectural Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUD-P3-01** | Custom Deck Rehydration | 🔴 High | ✅ Resolved | Practice route fails to load custom Supabase template UUIDs | Added remote Supabase template query in `practice/page.tsx` for custom UUIDs |
| **AUD-P3-02** | AI Game Engine | 🟡 Medium | ✅ Resolved | Practice mode lacks computer opponent turn simulation | Implemented simulated AI turn loop, AI standing board tracker, and log feed in `GameBoard.tsx` |
| **AUD-P3-03** | Audio UI Sync | 🟢 Low | ✅ Resolved | Mute button state out of sync with `soundFx` singleton | Initialized `isMuted` state with `soundFx.getMutedState()` on component mount |
| **AUD-P3-04** | AI Question Generator | 🟢 Low | ✅ Resolved | Custom decks with empty attributes limit Question Assistant | Added `ensureCardAttributes` fallback attribute generator in `setUtils.ts` |

---

## 🧪 Phase 3 Verification Status
- AUD-P3-01 resolved: Practice route (`app/play/practice/page.tsx`) queries remote Supabase custom template decks by UUID when `templateId` is not present in built-in static presets.
- AUD-P3-02 resolved: Implemented interactive computer AI turn loop, AI standing cards tracker (`aiStandingIds`), turn trigger action, and human-readable AI log banner in `GameBoard.tsx`.
- AUD-P3-03 resolved: Synchronized audio mute UI state with `soundFx.getMutedState()` on mount in `GameBoard.tsx`.
- AUD-P3-04 resolved: Added deterministic attribute fallback generator `ensureCardAttributes` in `lib/setUtils.ts` to enrich custom photo decks with traits for Tactical Question Assistant and AI solver elimination.
- Type check: 0 errors (`npx tsc --noEmit`).
- Lint check: 0 errors, 0 warnings (`npm run lint`).
- Production build: Pass (`npm run build`).
