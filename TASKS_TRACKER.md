# GuessWhooo? - Authoritative Gameplay Engine & Architecture Roadmap

This tracker documents the 14-task architectural redesign, gameplay state management pass, turn engine, mobile UX overhaul, timer state, and win/loss scenario resolution.

---

## 🌿 Git Branching Strategy & Sub-Branches

Base Branch for Integration: `main`

| Task ID | Task Description | Target Branch Name | Status |
| :--- | :--- | :--- | :--- |
| **TASK 1** | Audit game/session state architecture | `feature/01-state-architecture-audit` | ✅ Completed |
| **TASK 2** | Fix shared room/game state | `feature/02-authoritative-room-state` | ✅ Completed |
| **TASK 3** | Fix set consistency (Host Authoritative Deck) | `feature/03-host-deck-consistency` | ✅ Completed |
| **TASK 4** | Fix secret-character readiness gate | `feature/04-readiness-start-gate` | ✅ Completed |
| **TASK 5** | Fix game start & random first turn | `feature/05-game-start-random-turn` | ✅ Completed |
| **TASK 6** | Fix turn/action state machine | `feature/06-turn-action-state-machine` | ✅ Completed |
| **TASK 7** | Fix desktop gameplay interaction | `feature/07-desktop-gameplay-ux` | ⏳ Pending Task 6 |
| **TASK 8** | Redesign MOBILE gameplay interactions | `feature/08-mobile-touch-interactions` | ⏳ Pending |
| **TASK 9** | Implement turn messaging & visual state | `feature/09-turn-messaging-visual-state` | ⏳ Pending |
| **TASK 10** | Implement turn timer setting & timer state | `feature/10-configurable-turn-timers` | ⏳ Pending |
| **TASK 11** | Fix all win/lose/result scenarios | `feature/11-win-loss-scenarios-fix` | ⏳ Pending |
| **TASK 12** | Fix replay/new-round architecture | `feature/12-replay-lobby-architecture` | ⏳ Pending |
| **TASK 13** | Add game-state graphics and animations | `feature/13-game-state-graphics` | ⏳ Pending |
| **TASK 14** | Final responsive & accessibility pass | `feature/14-responsive-accessibility-pass` | ⏳ Pending |

---

## 📋 Task Breakdown Details

### TASK 1: Audit game/session state architecture
- [x] Inspect existing implementation (`MultiplayerBoard.tsx`, `[roomCode]/page.tsx`, `host/page.tsx`, Supabase schema).
- [x] Document all sources of truth, state synchronization mechanisms, security gaps, and root causes of set/turn/replay bugs.

### TASK 2: Fix shared room/game state
- [x] Defined authoritative shared state model (`SharedRoomState`, `SharedPlayer`, `GameStatus`, `WinReason`) in `src/types/game.ts`.
- [x] Updated host room creation payload (`src/app/host/page.tsx`) to inject structured `sharedState`.
- [x] Integrated `sharedRoomState` hook & `shared_state_sync` broadcast listener in `MultiplayerBoard.tsx`.

### TASK 3: Fix set consistency
- [x] Fixed DB update column query bug (`.eq('code', roomCode)`) for template changes.
- [x] Host-selected set updates DB `game_rooms` and broadcasts `template_changed` + `shared_state_sync`.
- [x] Guests automatically load and lock to host's authoritative `selectedSetId`.
- [x] Replaced static `template` references in `MultiplayerBoard.tsx` with dynamic `currentTemplate` state.

### TASK 4: Fix secret-character readiness
- [x] Both players choose secret character before active game begins.
- [x] Rendered dual readiness status badges (`You: Ready` vs `Opponent: Ready / Selecting...`).
- [x] Fixed secret card security exposure by broadcasting `player_ready` without raw cardId.
- [x] Built waiting overlay screen that holds active game board until opponent selection is ready.

### TASK 5: Fix game start & random first turn
- [x] Implemented host random starting player assignment (`Math.random()`) when both players become ready.
- [x] Synchronized `currentTurnPlayerId` in shared state & broadcasted `turn_assigned` event.
- [x] Rendered prominent turn status badges ("⚡ YOUR TURN" vs "⏳ OPPONENT'S TURN") on active gameplay HUD.

### TASK 6: Fix turn/action state machine
- [x] Implemented `handleEndTurn` action that passes `currentTurnPlayerId` to opponent & resets turn timestamp.
- [x] Added `turn_changed` broadcast handler with system log messages.
- [x] Enforced active turn checks on final guess declarations and turn actions in application state.
- [x] Rendered interactive **"End Turn"** button on active player HUD status bar.

### TASK 7: Fix desktop gameplay interaction
- [ ] Safe card elimination toggle, explicit guess action trigger, turn indication, and persistent own secret character display.

### TASK 8: Redesign MOBILE gameplay interactions
- [ ] Remove hover dependencies. Card tap directly flips/eliminates card. Dedicated "Guess" button trigger.

### TASK 9: Implement turn messaging & visual state
- [ ] Prominent turn indicators ("YOUR TURN" / "OPPONENT'S TURN"), turn badges, directional cues, and state-driven game log messages.

### TASK 10: Implement turn timer setting & timer state
- [ ] Room lobby setting for turn timer (Off, 30s, 60s, 90s, 120s). Sync `turnTimerSetting` and `turnStartedAt` in shared state.

### TASK 11: Fix all win/lose/result scenarios
- [ ] Handle all end-game outcomes (Correct Guess, Wrong Final Guess, Opponent Wrong Guess, Surrender, Disconnection, Timeout) with explicit win/loss reasons.

### TASK 12: Fix replay/new-round architecture
- [ ] Replay returns to room setup/lobby. Host can adjust set/timer settings before starting round `gameRound + 1`.

### TASK 13: Add game-state graphics and animations
- [ ] Add visual state feedback, turn badges, sound FX, and micro-animations for state changes without cluttering UX.

### TASK 14: Final responsive & accessibility pass
- [ ] Audit touch targets, keyboard navigation, contrast, ARIA labels, and viewports across desktop, tablet, and mobile.
