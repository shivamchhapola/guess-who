# Phase 1 Technical Audit: Realtime Multiplayer Room State Machine & Edge Cases

## 🎯 Executive Summary
This document provides a deep architectural audit of the realtime multiplayer engine, WebSocket channel event handling, state synchronization, disconnect recovery, and turn timers in **GuessWhooo?** ([`src/components/game/MultiplayerBoard.tsx`](file:///e:/GuessWho/src/components/game/MultiplayerBoard.tsx), [`src/app/play/[roomCode]/page.tsx`](file:///e:/GuessWho/src/app/play/[roomCode]/page.tsx)).

---

## 🔍 Detailed Subsystem Audit Findings

### 1. Mid-Match Page Refresh & Secret Character Loss
- **Current Pattern**: `playerSecretId` is held purely in volatile client React state (`useState<string | null>(null)`).
- **Vulnerability / Gap**: When a player selects their secret character, `playerSecretId` is kept local and never stored in `sessionStorage` or encrypted/hashed in PostgreSQL. If a player refreshes their browser tab mid-match, `MultiplayerBoard` re-mounts and `playerSecretId` becomes `null`.
- **User Impact**: The player loses their secret card widget on the right sidebar and cannot remember or view their secret character after a browser refresh.
- **Architectural Solution Plan**: Persist `playerSecretId` in `sessionStorage` (`room_${roomCode}_secret`) upon selection so page refreshes rehydrate the secret card instantly.

---

### 2. Disconnect Handling & Host Abandonment
- **Current Pattern**: `channel.on('presence', { event: 'sync' }, ...)` tracks online players via Supabase Realtime Presence.
- **Vulnerability / Gap**: When an opponent or host disconnects (closes tab, drops internet connection, or navigates away), `setOpponentName(null)` is triggered. However, `gameStatus` remains `'active'`. The remaining player is left stuck in an active turn loop with a running timer and no notification or win-by-forfeit trigger.
- **User Impact**: A player whose opponent abandons the room is left hanging indefinitely without knowing whether the opponent left or is reconnecting.
- **Architectural Solution Plan**:
  1. Add a 30-second disconnect grace timer when presence drops during an active match.
  2. Display an overlay banner ("Opponent disconnected. Waiting 30s for reconnection...").
  3. If the opponent fails to reconnect within 30s, automatically trigger `declare_victory` with `winReason: 'opponent_disconnected'`.

---

### 3. Client System Clock Skew in Turn Countdown Timers
- **Current Pattern**: Turn timer countdown calculates remaining time using `Math.floor((Date.now() - turnStartedAt) / 1000)`.
- **Vulnerability / Gap**: `turnStartedAt` is set using the host's client system clock (`Date.now()`). If the host's system clock is skewed (e.g. 10 seconds ahead or behind standard UTC time relative to the guest's machine), the guest's client will experience unexpected timer jumps or immediate turn timeouts.
- **User Impact**: Discrepant turn timers between players on different operating systems or un-synced system clocks.
- **Architectural Solution Plan**: Transmit relative turn start durations (`turnDurationSeconds`) over WebSockets or use Supabase server-side timestamps (`updated_at`) for turn synchronization.

---

### 4. Board State Loss on Reconnection (Flipped Cards & Chat History)
- **Current Pattern**: On page reload, `rehydrateRoomState` restores global room state (`gameStatus`, `turnTimerSetting`, `currentTurnPlayerId`, `winnerId`). However, `flippedCardIds` and `chatMessages` are stored in memory only.
- **Vulnerability / Gap**: If a user reloads their browser tab during an active 15-minute game, their board flips reset (all cards stand back up) and chat history vanishes.
- **User Impact**: Players lose all deduction progress (which cards they flipped down) if their browser reloads.
- **Architectural Solution Plan**: Save `flippedCardIds` to `sessionStorage` (`room_${roomCode}_flips`) on every card toggle so board deduction state survives page reloads seamlessly.

---

### 5. Structured Presence Payload vs String-Splitting Keys
- **Current Pattern**: Presence tracking uses a composite string key `https://api.dicebear.com/... NickName` inside `supabase.channel({ presence: { key: presenceKey } })` and parses it via string searching `otherKey.indexOf(' ')`.
- **Vulnerability / Gap**: If a player's nickname contains special spaces or non-standard characters without an avatar URL, string splitting can fail or misattribute avatars.
- **User Impact**: Edge cases where player avatars or multi-word nicknames render improperly in presence lists.
- **Architectural Solution Plan**: Track structured presence payloads via `channel.track({ nickname: playerName, avatarUrl: playerAvatar, role: isHost ? 'host' : 'guest' })` instead of embedding metadata into string keys.

---

### 6. Concurrent Readiness & Match Launch Race Conditions
- **Current Pattern**: Host auto-launches the match via `useEffect` when `isHost && gameStatus === 'selecting_character' && isMyReady && isOpponentReady`.
- **Vulnerability / Gap**: If both clients send readiness state simultaneously, or if network latency delays `player_ready` broadcasts, `handleStartActiveMatch` can be evaluated multiple times, sending redundant `game_started` broadcasts.
- **User Impact**: Potential double turn initialization or turn player flip-flop at match launch.
- **Architectural Solution Plan**: Add an explicit `hasLaunchedMatch` ref guard (`hasLaunchedRef.current`) in `handleStartActiveMatch` to guarantee single-execution match initialization.

---

## 📊 Phase 1 Audit Summary Matrix

| Finding ID | Subsystem | Severity | Status | Impact | Proposed Architectural Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUD-P1-01** | Secret Card State | 🔴 High | ✅ Resolved | Mid-game reload wipes secret card widget | Persisted `playerSecretId` in `sessionStorage` (`room_${roomCode}_secret`) |
| **AUD-P1-02** | Disconnect Recovery | 🔴 High | ✅ Resolved | Opponent tab closure leaves player frozen in turn | 30s grace timer + `disconnect` win forfeit |
| **AUD-P1-03** | Turn Timer Sync | 🟡 Medium | ✅ Resolved | System clock skew causes timer jumps | Monotonic `localTurnStartAnchorRef` + DB `updated_at` server anchor |
| **AUD-P1-04** | Deduction State | 🟡 Medium | ✅ Resolved | Reload resets all flipped card states to standing | Persist `flippedCardIds` in `sessionStorage` (`room_${roomCode}_flips`) |
| **AUD-P1-05** | Presence Data | 🟢 Low | ✅ Resolved | String splitting on composite presence key | Structured JSON `channel.track()` payload with string fallback |
| **AUD-P1-06** | Match Launch Gate | 🟢 Low | ✅ Resolved | Double `game_started` broadcast risk | Single-execution `hasLaunchedRef` match launch guard |

---

## 🧪 Phase 1 Verification Status
- AUD-P1-01 resolved: Encapsulated secret card state in `sessionStorage` with `updatePlayerSecretId` helper; verified tab reload secret rehydration.
- AUD-P1-02 resolved: Implemented 30-second disconnect grace countdown timer, presence drop detection, reconnection chat notifications, top alert banner, and auto-forfeit `disconnect` victory.
- AUD-P1-03 resolved: Eliminated cross-machine system clock skew by anchoring turn countdown to `localTurnStartAnchorRef` on turn events and DB `updated_at` server timestamp on rehydration.
- AUD-P1-04 resolved: Encapsulated card flip deduction state in `sessionStorage` with `updateFlippedCardIds` helper; verified tab reload deduction progress rehydration.
- AUD-P1-05 resolved: Updated presence tracking to broadcast structured JSON objects (`playerName`, `playerAvatar`, `isHost`) with backwards-compatible string fallback parsing.
- AUD-P1-06 resolved: Added `hasLaunchedRef` ref guard in `handleStartActiveMatch` to guarantee single-execution match launch and prevent duplicate WebSocket broadcasts.
- Type check: 0 errors (`npx tsc --noEmit`).
- Lint check: 0 errors, 0 warnings (`npm run lint`).
- Production build: Pass (`npm run build`).
