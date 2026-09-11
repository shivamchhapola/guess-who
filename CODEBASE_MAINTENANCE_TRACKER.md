# Master Codebase Maintenance & Technical Audit Tracker

This document tracks the 5-domain deep codebase audit, refactoring decisions, verification checkpoints, and pull request branches for the **GuessWhooo?** repository using the `codebase-maintainer` skill.

---

## 📊 Master Domain Progress Dashboard

| Domain ID | Functional Area | Target Scope | Status | PR / Topic Branch | Build Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P1 PASS** | ESLint & Build Cleanliness | Repo-wide 32 issues | ✅ Completed | `fix/eslint-build-validation` | 0 errors, 0 warnings |
| **P2 PASS** | Supabase Security & Indexes | `schema.sql`, RLS policies | ✅ Completed | `fix/supabase-security-indexes` | Live Postgres Applied |
| **P3 PASS** | State Synchronization & Reconnect | `MultiplayerBoard.tsx`, DB sync | ✅ Completed | `fix/reconnect-state-persistence` | 0 errors, build pass |
| **DOMAIN 1** | Gameplay Engine & Realtime Sync | `CardFlip.tsx`, `MultiplayerBoard.tsx`, `GameBoard.tsx` | ✅ Completed | `audit/domain-1-gameplay-engine` | 0 errors, build pass |
| **DOMAIN 2** | Data Access Layer, Types & DB | `schema.sql`, `client.ts`, `server.ts`, `game.ts` | ✅ Completed | `audit/domain-2-data-layer` | 0 errors, build pass |
| **DOMAIN 3** | Template Creator & Storage Pipeline | `create/page.tsx`, `templates/page.tsx`, `setUtils.ts` | ✅ Completed | `audit/domain-3-template-creator` | 0 errors, build pass |
| **DOMAIN 4** | Matchmaking & Navigation Flow | `host/page.tsx`, `lobbies/page.tsx`, `NavHeader.tsx` | ✅ Completed | `audit/domain-4-matchmaking` | 0 errors, build pass |
| **DOMAIN 5** | Audio, Performance & Mobile UX | `audio.ts`, `globals.css`, Touch targets, Assets | ✅ Completed | `audit/domain-5-performance-ux` | 0 errors, build pass |

---

## 📝 Domain Audit Findings & Decision Logs

### 🌿 Initial Cleanup & Hardening (Completed Passes P1 - P3)
- **P1 Fix**: Fixed 32 ESLint errors and warnings across 12 files (resolved synchronous `setState` in `useEffect`, moved variable hoisting in `handleEndTurn`, escaped unescaped JSX quotes).
- **P2 Fix**: Hardened Supabase RLS security policies (removed `FOR ALL` delete vulnerability on `game_rooms`, wrapped `auth.uid()` in subqueries, added target roles `TO authenticated` / `TO anon`) and added high-performance foreign key indexes. Applied live to Supabase PostgreSQL cluster.
- **P3 Fix**: Added `syncRoomStateToDb` and rehydration effects so mid-game room state updates persist to DB and sync on reconnect/refresh. Added optimistic code collision retries in room host creation.

---

### 🎲 Domain 1: Gameplay Engine & Realtime Sync (Completed)
- **Target Scope**: [`CardFlip.tsx`](file:///e:/GuessWho/src/components/game/CardFlip.tsx), [`MultiplayerBoard.tsx`](file:///e:/GuessWho/src/components/game/MultiplayerBoard.tsx), [`GameBoard.tsx`](file:///e:/GuessWho/src/components/game/GameBoard.tsx), [`QuestionAssistant.tsx`](file:///e:/GuessWho/src/components/game/QuestionAssistant.tsx), [`GuessModal.tsx`](file:///e:/GuessWho/src/components/game/GuessModal.tsx), [`VictoryModal.tsx`](file:///e:/GuessWho/src/components/game/VictoryModal.tsx), [`play/[roomCode]/page.tsx`](file:///e:/GuessWho/src/app/play/%5BroomCode%5D/page.tsx), [`play/practice/page.tsx`](file:///e:/GuessWho/src/app/play/practice/page.tsx).

- **Key Findings & Fixes**:
  - **DEC-D1-01**: Outer wrapper container in `CardFlip.tsx` changed from `role="button"` to `role="group"` to eliminate HTML5 interactive element nesting violations with inner buttons (`btn-select`, `btn-guess`, `btn-restore`). Removed `aria-pressed` from group container.
  - **DEC-D1-02**: Verified dual readiness gate in `MultiplayerBoard.tsx`. Confirmed starting turn selection (`Math.random()`) broadcasts `game_started` with exact timestamp `turnStartedAt` and saves payload to PostgreSQL.
  - **DEC-D1-03**: Verified Web Audio API lazy AudioContext resume handling (`this.ctx.resume()`) in `src/lib/audio.ts`.
  - **DEC-D1-04**: Decomposed monolithic `MultiplayerBoard.tsx` (1500+ lines) into focused modular components ([`RoomPasswordGate.tsx`](file:///e:/GuessWho/src/components/game/RoomPasswordGate.tsx) and [`JoinIdentityGate.tsx`](file:///e:/GuessWho/src/components/game/JoinIdentityGate.tsx)), reducing complexity and improving maintainability.

---

### 🗄️ Domain 2: Data Access Layer, Types & DB (Completed)
- **Target Scope**: [`schema.sql`](file:///e:/GuessWho/supabase/schema.sql), [`client.ts`](file:///e:/GuessWho/src/lib/supabase/client.ts), [`server.ts`](file:///e:/GuessWho/src/lib/supabase/server.ts), [`game.ts`](file:///e:/GuessWho/src/types/game.ts), [`apply_schema.cjs`](file:///e:/GuessWho/scripts/apply_schema.cjs).

- **Key Findings & Fixes**:
  - **DEC-D2-01**: Defined explicit strict database row interfaces (`GameRoomRow`, `TemplateRow`, `CardRow`, `ProfileRow`) in `src/types/game.ts` matching PostgreSQL `schema.sql` so database queries are strictly typed.
  - **DEC-D2-02**: Added developer environment variable check and warning log in `src/lib/supabase/client.ts` when falling back to placeholder Supabase credentials.

---

### 🎨 Domain 3: Template Creator & Storage Pipeline (Completed)
- **Target Scope**: [`create/page.tsx`](file:///e:/GuessWho/src/app/create/page.tsx), [`templates/page.tsx`](file:///e:/GuessWho/src/app/templates/page.tsx), [`popularTemplates.ts`](file:///e:/GuessWho/src/data/popularTemplates.ts), [`setUtils.ts`](file:///e:/GuessWho/src/lib/setUtils.ts).

- **Key Findings & Fixes**:
  - **DEC-D3-01**: Refactored `handleBulkImageSelect` in `create/page.tsx` using `Promise.all` to asynchronously convert image files into Data URLs cleanly before setting state once, preventing race conditions and redundant re-renders.
  - **DEC-D3-02**: Filtered out hidden macOS dot-files (`.DS_Store`, `._*`) and `__MACOSX` directories during ZIP archive extraction in `handleZipFileSelect`.
  - **DEC-D3-03**: Added template ID deduplication in `templates/page.tsx` when merging fetched Supabase community decks with built-in templates.
  - **DEC-D3-04**: Added optional chaining and null safety fallbacks to utility functions in `src/lib/setUtils.ts`.

---

### 🚪 Domain 4: Matchmaking, Host Controls & Navigation Flow (Completed)
- **Target Scope**: [`host/page.tsx`](file:///e:/GuessWho/src/app/host/page.tsx), [`lobbies/page.tsx`](file:///e:/GuessWho/src/app/lobbies/page.tsx), [`page.tsx`](file:///e:/GuessWho/src/app/page.tsx), [`PlayerProfileSetup.tsx`](file:///e:/GuessWho/src/components/PlayerProfileSetup.tsx).

- **Key Findings & Fixes**:
  - **DEC-D4-01**: Added real-time Supabase Postgres changes subscription (`supabase.channel('public_lobbies_realtime')`) in `lobbies/page.tsx` so public lobby lists update instantaneously as players host or close rooms.
  - **DEC-D4-02**: Created `parseHostDisplayName` helper in `lobbies/page.tsx` to extract clean player nicknames from presence keys instead of displaying raw avatar URLs.
  - **DEC-D4-03**: Added `localStorage` profile persistence in `PlayerProfileSetup.tsx` so user nickname and avatar preferences persist across sessions.
  - **DEC-D4-04**: Added input regex sanitization (`replace(/[^A-Za-z0-9]/g, '')`) for room code input on `src/app/page.tsx`.

---

### ⚡ Domain 5: Audio Engine, Performance & Mobile UX (Completed)
- **Target Scope**: [`audio.ts`](file:///e:/GuessWho/src/lib/audio.ts), [`globals.css`](file:///e:/GuessWho/src/app/globals.css), Touch targets, Asset loading, Next.js image optimization.

- **Key Findings & Fixes**:
  - **DEC-D5-01**: Added `localStorage` audio mute persistence (`guesswho_sound_muted`) in `SoundEffectsManager` (`audio.ts`) so user audio mute choices persist across navigations and reloads.
  - **DEC-D5-02**: Wrapped `AudioContext.resume()` calls in try-catch to prevent browser autoplay policy DOMExceptions.
  - **DEC-D5-03**: Added `touch-action: manipulation` and coarse pointer min-height (44px) rules in `globals.css` to remove tap delays and improve touch ergonomics on mobile browsers.

---

## 🧪 Master Verification Log

| Timestamp | Type Check (`npx tsc`) | Lint Check (`npm run lint`) | Build Check (`npm run build`) | Verification Result |
| :--- | :--- | :--- | :--- | :--- |
| **Pass 1 (ESLint)** | 0 Errors | 0 Errors, 0 Warnings | Build Success | ✅ Passed |
| **Pass 2 (Supabase)** | 0 Errors | 0 Errors, 0 Warnings | Build Success | ✅ Passed & Live DB Applied |
| **Pass 3 (Sync)** | 0 Errors | 0 Errors, 0 Warnings | Build Success | ✅ Passed |
| **Domain 1 (Gameplay)**| 0 Errors | 0 Errors, 0 Warnings | Build Success (1.1s) | ✅ Passed |
| **Domain 2 (Data Layer)**| 0 Errors | 0 Errors, 0 Warnings | Build Success (1.1s) | ✅ Passed |
| **Domain 3 (Creator)**| 0 Errors | 0 Errors, 0 Warnings | Build Success (1.3s) | ✅ Passed |
| **Domain 4 (Matchmaking)**| 0 Errors | 0 Errors, 0 Warnings | Build Success (1.1s) | ✅ Passed |
| **Domain 5 (Audio/UX)**| 0 Errors | 0 Errors, 0 Warnings | Build Success (1.4s) | ✅ Passed |
