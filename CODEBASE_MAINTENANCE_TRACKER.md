# Master Codebase Maintenance & Architecture Tracker

This document provides a comprehensive software engineering architecture map and technical maintenance audit tracker for **GuessWhooo?**. It maps out all 29 repository modules by functional subsystem, dependency relationships (analyzed via `madge` and TypeScript AST), data flows, and identified structural audit targets.

---

## 🗺️ Codebase Architecture & Subsystem Map

### 1. Data Model & Database Layer (`types/`, `supabase/`, `lib/supabase/`)
| Module File | Primary Function & Responsibility | External / Internal Dependencies | Key Features & Constraints |
| :--- | :--- | :--- | :--- |
| [`types/game.ts`](file:///e:/GuessWho/src/types/game.ts) | Domain interfaces & DB row schemas | TypeScript core | Models `CharacterCard`, `CardSetTemplate`, `GameRoomRow`, `TemplateRow`, `CardRow`, `ProfileRow` |
| [`supabase/schema.sql`](file:///e:/GuessWho/supabase/schema.sql) | PostgreSQL DDL & RLS Security | Supabase PostgreSQL | `templates`, `cards`, `game_rooms` tables; RLS policies with subqueries; FK indexes |
| [`lib/supabase/client.ts`](file:///e:/GuessWho/src/lib/supabase/client.ts) | Browser Supabase Client Singleton | `@supabase/ssr`, `createBrowserClient` | Env var validation check with fallback placeholder warnings |
| [`lib/supabase/server.ts`](file:///e:/GuessWho/src/lib/supabase/server.ts) | SSR Supabase Server Client | `@supabase/ssr`, `createServerClient` | Cookie handling for Next.js App Router server components |

---

### 2. Template Deck Creator & Storage Pipeline (`app/create/`, `app/templates/`, `data/`, `lib/setUtils.ts`)
| Module File | Primary Function & Responsibility | External / Internal Dependencies | Key Features & Constraints |
| :--- | :--- | :--- | :--- |
| [`data/defaultTemplate.ts`](file:///e:/GuessWho/src/data/defaultTemplate.ts) | Classic 24-Character Deck Preset | `types/game.ts` | Generates SVG seed avatar URLs for original Guess Who deck |
| [`data/popularTemplates.ts`](file:///e:/GuessWho/src/data/popularTemplates.ts) | Featured TV/Movie/Marvel Decks | `types/game.ts` | Includes The Office, Hollywood Stars, Marvel Avengers static decks |
| [`lib/setUtils.ts`](file:///e:/GuessWho/src/lib/setUtils.ts) | Deck Metadata & Search Helper | `types/game.ts` | Null-safe search matching, tag display formatting, custom set checks |
| [`app/create/page.tsx`](file:///e:/GuessWho/src/app/create/page.tsx) | Custom Deck Studio & Publisher | `jszip`, `lucide-react`, `lib/supabase/client` | `Promise.all` bulk image reader, macOS hidden file filtering for ZIP archives, DB save |
| [`app/templates/page.tsx`](file:///e:/GuessWho/src/app/templates/page.tsx) | Game Deck Library & Browser | `components/NavHeader`, `components/SetPreviewModal` | Combines built-in decks with remote Supabase community decks; deduplicates by ID |
| [`components/SetPreviewModal.tsx`](file:///e:/GuessWho/src/components/SetPreviewModal.tsx) | Card Deck Inspector Modal | `types/game.ts`, `lucide-react` | Modal grid preview of all cards in a selected template deck |

---

### 3. Matchmaking, Host Controls & Lobby Layer (`app/`, `app/host/`, `app/lobbies/`, `components/`)
| Module File | Primary Function & Responsibility | External / Internal Dependencies | Key Features & Constraints |
| :--- | :--- | :--- | :--- |
| [`app/page.tsx`](file:///e:/GuessWho/src/app/page.tsx) | Landing Page Entry Point | `components/NavHeader`, `components/SetPreviewModal` | Entry paths (Host, Join via Code with regex sanitization, Browse Public Lobbies) |
| [`app/host/page.tsx`](file:///e:/GuessWho/src/app/host/page.tsx) | Room Creation & Settings | `components/PlayerProfileSetup`, `lib/audio` | Passcode protection, public lobby toggle, turn timer selection, code collision retries |
| [`app/lobbies/page.tsx`](file:///e:/GuessWho/src/app/lobbies/page.tsx) | Public Lobby Matchmaker | `components/NavHeader`, `lib/supabase/client` | Real-time Supabase Postgres channel (`public_lobbies_realtime`), host name parser |
| [`components/NavHeader.tsx`](file:///e:/GuessWho/src/components/NavHeader.tsx) | Global Sticky Header Bar | `next/link`, `lucide-react` | Navigation links, active indicator, responsive mobile menu drawer |
| [`components/PlayerProfileSetup.tsx`](file:///e:/GuessWho/src/components/PlayerProfileSetup.tsx) | Avatar & Nickname Studio | `lib/randomIdentity`, `lib/audio` | DiceBear avatar style/seed selector, `localStorage` profile persistence |

---

### 4. Real-time Gameplay Engine (`app/play/`, `components/game/`)
| Module File | Primary Function & Responsibility | External / Internal Dependencies | Key Features & Constraints |
| :--- | :--- | :--- | :--- |
| [`app/play/[roomCode]/page.tsx`](file:///e:/GuessWho/src/app/play/[roomCode]/page.tsx) | Route Wrapper for Multiplayer | `components/game/MultiplayerBoard` | Extracts route params & search parameters for room initial deck |
| [`app/play/practice/page.tsx`](file:///e:/GuessWho/src/app/play/practice/page.tsx) | Route Wrapper for Solo Practice | `components/game/GameBoard` | Launches offline vs AI mode with selected deck |
| [`components/game/MultiplayerBoard.tsx`](file:///e:/GuessWho/src/components/game/MultiplayerBoard.tsx) | Realtime Multiplayer Engine | `lib/supabase/client`, `lib/audio` | Realtime WebSockets, state rehydration, turn timer countdown, chat log broadcast |
| [`components/game/GameBoard.tsx`](file:///e:/GuessWho/src/components/game/GameBoard.tsx) | Practice Game Engine | `components/game/CardFlip`, `lib/audio` | Single-player game state against automated random elimination AI |
| [`components/game/CardFlip.tsx`](file:///e:/GuessWho/src/components/game/CardFlip.tsx) | 3D Card Flip Component | `framer-motion`, `lucide-react` | 3D card flip animation, accessible `role="group"` container |
| [`components/game/QuestionAssistant.tsx`](file:///e:/GuessWho/src/components/game/QuestionAssistant.tsx) | Question Helper Generator | `types/game.ts`, `lucide-react` | Categorized question suggestions for fast chat entry |
| [`components/game/GuessModal.tsx`](file:///e:/GuessWho/src/components/game/GuessModal.tsx) | Final Guess Confirmation | `types/game.ts`, `lucide-react` | Modal dialog confirming final character guess |
| [`components/game/VictoryModal.tsx`](file:///e:/GuessWho/src/components/game/VictoryModal.tsx) | Match Winner Fanfare | `types/game.ts`, `lucide-react` | Match summary, winner fanfare, rematch trigger button |
| [`components/game/RoomPasswordGate.tsx`](file:///e:/GuessWho/src/components/game/RoomPasswordGate.tsx) | Room Passcode Entry Gate | `lucide-react` | Modular passcode entry gate for protected rooms |
| [`components/game/JoinIdentityGate.tsx`](file:///e:/GuessWho/src/components/game/JoinIdentityGate.tsx) | Guest Identity Setup Gate | `components/PlayerProfileSetup` | Modular guest player setup gate for direct link joins |

---

### 5. Audio, Performance & Utility Infrastructure (`lib/`, `app/`)
| Module File | Primary Function & Responsibility | External / Internal Dependencies | Key Features & Constraints |
| :--- | :--- | :--- | :--- |
| [`lib/audio.ts`](file:///e:/GuessWho/src/lib/audio.ts) | Web Audio API Sound Synthesizer | Web Audio API | Card flip, select chime, victory fanfare synthesizers, `localStorage` mute persistence |
| [`lib/randomIdentity.ts`](file:///e:/GuessWho/src/lib/randomIdentity.ts) | Random Nickname & Avatar | DiceBear API presets | Pre-configured avatar styles (avataaars, bottts, lorelei, etc.) and seed variations |
| [`app/globals.css`](file:///e:/GuessWho/src/app/globals.css) | Global Styles & Design Tokens | Tailwind CSS | CSS variables, 3D flip utilities, touch manipulation, responsive layout styles |

---

## 🔍 Module Dependency Tree (Verified via `madge`)

```
src/
├── app/
│   ├── auth/login/page.tsx
│   ├── create/page.tsx (JSZip, Supabase)
│   ├── globals.css
│   ├── host/page.tsx (PlayerProfileSetup, audio)
│   ├── layout.tsx (globals.css)
│   ├── lobbies/page.tsx (NavHeader, Supabase Realtime)
│   ├── page.tsx (NavHeader, SetPreviewModal)
│   ├── play/[roomCode]/page.tsx (MultiplayerBoard)
│   ├── play/practice/page.tsx (GameBoard)
│   └── templates/page.tsx (NavHeader, SetPreviewModal, setUtils)
├── components/
│   ├── NavHeader.tsx
│   ├── PlayerProfileSetup.tsx (randomIdentity, audio)
│   ├── SetPreviewModal.tsx
│   └── game/
│       ├── CardFlip.tsx (framer-motion)
│       ├── GameBoard.tsx (CardFlip, GuessModal, VictoryModal)
│       ├── GuessModal.tsx
│       ├── JoinIdentityGate.tsx (PlayerProfileSetup)
│       ├── MultiplayerBoard.tsx (CardFlip, GuessModal, JoinIdentityGate, RoomPasswordGate, VictoryModal, SetPreviewModal)
│       ├── QuestionAssistant.tsx
│       ├── RoomPasswordGate.tsx
│       └── VictoryModal.tsx
├── data/
│   ├── defaultTemplate.ts
│   └── popularTemplates.ts
├── lib/
│   ├── audio.ts (Web Audio API)
│   ├── randomIdentity.ts
│   ├── setUtils.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
└── types/
    └── game.ts
```

---

## 📋 Comprehensive Deep Audit Plan (Functionality by Functionality)

We will systematically audit each architectural area for edge cases, error handling, state sync gaps, and potential improvements:

- [ ] **Phase 1: Realtime Multiplayer Room State Machine & Edge Cases**
  - Host disconnect recovery & room state transfer logic.
  - Concurrent guess race conditions (when both players guess simultaneously).
  - WebSockets reconnection state sync verification on flaky network connections.
- [ ] **Phase 2: Data Persistence, Supabase Storage & Large Payload Safety**
  - Optimization of base64 image data URLs in `templates` and `cards` tables.
  - Rate limiting & file size validation in bulk uploader / ZIP extraction.
  - Hardening RLS policies for updated Postgres schemas.
- [ ] **Phase 3: Solo Practice Mode & AI Strategy Engine**
  - [`GameBoard.tsx`](file:///e:/GuessWho/src/components/game/GameBoard.tsx) state machine & practice mode opponent logic.
  - Card elimination tracking & win condition evaluation offline.
- [ ] **Phase 4: Component Modularization & Architecture Refactoring**
  - Further decomposition of large UI screens into focused, reusable component primitives.
  - Prop interface cleanup & strict TypeScript model enforcement.
- [ ] **Phase 5: Mobile UX, Performance Metrics & Web Audio Safety**
  - Full mobile browser touch audit (iOS Safari, Android Chrome).
  - Memory leak checks for Web Audio API AudioContext & Supabase Realtime channels.

---

## 🧪 Master Verification Record

| Phase / Focus Area | Type Check (`npx tsc`) | Lint Check (`npm run lint`) | Build Check (`npm run build`) | Dependency Audit (`madge`) | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **System Architecture Mapping** | 0 Errors | 0 Errors, 0 Warnings | Build Pass (1.1s) | No Circular Dependencies | ✅ Complete |
