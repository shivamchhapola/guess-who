# Phase 4 Audit: Component Modularization & Architecture Refactoring

**Target Area**: UI Architecture, Component Decomposition, Prop Interface Design & State Hook Abstraction  
**Audit Date**: September 11, 2026  
**Status**: ⚠️ High Complexity Monoliths Identified (Refactoring Roadmap Defined)

---

## Executive Summary

Phase 4 audits the component structure, modular boundaries, state hooks, and UI architecture across the entire **GuessWhooo?** application codebase. While the application executes cleanly with 0 TypeScript errors and 0 build errors, several critical view layers suffer from **monolithic code organization**, high visual coupling, duplicate UI code blocks, and heavy inline state logic.

The primary target is [`src/components/game/MultiplayerBoard.tsx`](file:///e:/GuessWho/src/components/game/MultiplayerBoard.tsx) (1,496 lines, 70KB), which currently manages WebSockets presence, DB persistence, timer countdowns, deck template selection, pre-game lobby rendering, secret character selection, chat log stream, and end-of-game victory flows in a single file.

---

## 1. Monolithic Component Decomposition Plan

### 1.1 `MultiplayerBoard.tsx` (1,496 lines → 5 Focused Sub-components + 1 Hook)

#### Current Architectural Issues
- **1,496 lines** in a single React component file.
- Combines game state management, WebSocket channels, DOM rendering, modal gates, chat UI, turn timer logic, and deck selector in one monolithic component.
- High risk of unintended re-renders across chat updates, timer ticks, and opponent presence changes.

#### Decomposition Target Architecture

```
src/components/game/multiplayer/
├── MultiplayerBoard.tsx          # Main layout orchestrator (< 250 lines)
├── hooks/
│   └── useMultiplayerRoom.ts     # Realtime state sync, presence, DB persistence hook
└── components/
    ├── PreGameLobbyView.tsx      # Lobby waiting room, template picker trigger, host controls
    ├── CharacterSelectionBanner.tsx # Pick secret character step before game start
    ├── GameHeaderBar.tsx          # Turn status, countdown timer, leave/surrender buttons
    ├── GameChatLog.tsx           # Chat stream, question assistant drawer, input form
    └── DeckChangeModal.tsx       # Host modal for swapping active card template set
```

#### Proposed Interfaces & Modular Extraction

1. **`useMultiplayerRoom(roomCode: string, template: CardSetTemplate, requiredPassword?: string | null)`**:
   - Encapsulates Supabase Realtime channel subscription (`room_${roomCode}`).
   - Manages state rehydration, presence tracking, `syncRoomStateToDb`, turn timer countdown, and game status transitions (`setup` | `selecting_character` | `active` | `finished`).
   - Returns `{ roomState, presenceState, actions: { readyUp, setSecret, submitQuestion, surrender, restartMatch } }`.

2. **`PreGameLobbyView.tsx`**:
   - Renders host/guest player lobby cards, avatar badges, ready check indicators, room code copy banner, and turn timer selection.
   - Props: `isHost: boolean`, `roomCode: string`, `template: CardSetTemplate`, `connectedPlayers: Player[]`, `onReady: () => void`, `onChangeTemplate: () => void`.

3. **`GameChatLog.tsx`**:
   - Manages chat history UI, fast question helper chips, scroll anchor ref, and send message handler.
   - Isolated re-renders: Chat message typing will no longer force re-renders of 24 character card flip states.

---

### 1.2 `src/app/create/page.tsx` (538 lines → 4 Sub-components)

#### Current Architectural Issues
- 538 lines combining form state, bulk file upload, JSZip archive parsing, tag handling, card set editing, and Supabase DB saves.
- Large inline functions for `handleBulkImageSelect` and `handleZipFileSelect`.

#### Decomposition Target Architecture

```
src/components/create/
├── BulkImageUploader.tsx       # Drag-and-drop & bulk file input handler
├── ZipUnpackerWorker.tsx       # JSZip archive parser & macOS filter logic
├── TagSelectorBar.tsx          # Tag pills & custom tag input handler
└── CardGridEditor.tsx          # Grid of individual character card inputs & preview
```

---

### 1.3 `src/app/templates/page.tsx` (330 lines → 2 Sub-components)

#### Current Architectural Issues
- Search bar, tag filter pills, template deck grid, and card counts are rendered in a single file.
- Template deck cards repeat SVG placeholder fallback logic and badge styling.

#### Refactoring Target
- Extract **`TemplateCard.tsx`**: Reusable template card display item showing total cards, tag pills, author badge, preview modal trigger, and direct play button.
- Extract **`TagFilterBar.tsx`**: Controlled tag pill selector bar for filtering templates by category.

---

### 1.4 `src/app/host/page.tsx` (280 lines → 1 Sub-component)

#### Current Architectural Issues
- Form controls for turn duration (30s, 60s, 90s, unlimited), room passcode toggle, public lobby switch, and player profile setup are combined in one page file.

#### Refactoring Target
- Extract **`HostSettingsForm.tsx`**: Reusable room settings form component with validated inputs for duration, privacy, and passcode.

---

## 2. Prop Interface Cleanup & Type Safety Audit

| Target Component | Current Issue | Recommended Enhancement |
| :--- | :--- | :--- |
| [`MultiplayerBoardProps`](file:///e:/GuessWho/src/components/game/MultiplayerBoard.tsx#L25-L29) | `template` prop can be stale if host changes set mid-lobby | Pass `initialTemplate: CardSetTemplate` and manage dynamic template updates strictly via DB state sync |
| [`CardFlip.tsx`](file:///e:/GuessWho/src/components/game/CardFlip.tsx) | Mixed card state props (`isFlipped`, `isEliminated`, `isSecret`) | Group card visual flags into a clean `CardState` object interface |
| [`QuestionAssistant.tsx`](file:///e:/GuessWho/src/components/game/QuestionAssistant.tsx) | Pass-through handler `onSelectQuestion: (q: string) => void` | Add strongly-typed `QuestionCategory` filters to assistant options |

---

## 3. CSS Utility Consolidation & Style Refactoring

- **3D Card Flip CSS**: Inline style utilities in [`src/app/globals.css`](file:///e:/GuessWho/src/app/globals.css) (`.perspective-1000`, `.transform-style-3d`, `.backface-hidden`) are defined correctly. Ensure Framer Motion in [`CardFlip.tsx`](file:///e:/GuessWho/src/components/game/CardFlip.tsx) uses hardware-accelerated CSS variables (`will-change: transform`).
- **Glassmorphic Cards**: Glassmorphic UI backgrounds (`bg-slate-900/80 backdrop-blur-md border border-slate-700/50`) repeat 45+ times across the codebase. Refactor into standard CSS utility class `.glass-panel` in `globals.css`.

---

## Phase 4 Audit Checklist

- [x] Identified 4 monolithic view files (`MultiplayerBoard.tsx`, `app/create/page.tsx`, `app/templates/page.tsx`, `app/host/page.tsx`).
- [x] Designed custom hook extraction blueprint (`useMultiplayerRoom`).
- [x] Mapped component boundaries for isolated chat log, lobby view, deck editor, and card grid components.
- [x] Outlined CSS utility class consolidation (`.glass-panel`).
- [x] Verified zero TypeScript compilation errors (`npx tsc --noEmit`).
