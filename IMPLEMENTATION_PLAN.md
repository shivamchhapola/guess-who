# Guess Who Open-Source Web Application - Implementation Plan & Roadmap

A modern, open-source, serverless clone of "Guess Who Maker" built with Next.js App Router. Anyone can play online custom Guess Who games for free without signing up or paying, while template creators log in to design, store, and share custom card sets. Hosted 100% on Vercel without a dedicated backend server.

---

## Technical Stack & Architecture Decisions

- **Framework & Hosting**: Next.js 15 App Router on Vercel (100% serverless, zero backend maintenance).
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth.
- **Storage**: Supabase Storage buckets for custom card set images.
- **Real-Time Multiplayer Engine**: Supabase Realtime Channels (Broadcast + Presence) for game room state synchronization & chat.
- **Styling & UI**: Tailwind CSS v4 + Framer Motion + Lucide Icons + Web Audio API for interactive 3D card flips and sound effects.

---

## Phased Roadmap & Implementation Status

### Phase 1: Core Foundation & AI-Ready Governance ✅
- [x] Create project repository structure and documentation.
- [x] Initialize Next.js project with TypeScript, Tailwind CSS, ESLint, and App Router.
- [x] Setup `README.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, and `BRANCHING_STRATEGY.md`.
- [x] Define `.agents/` directory for AI assistant rules & installed Supabase agent skills.

### Phase 2: Template Data Schema & Local Game Board Engine ✅
- [x] Define TypeScript schemas for `CharacterCard`, `CardSetTemplate`, `QuestionLogItem`, `LocalGameState`, and `PlayerState`.
- [x] Build standalone offline Guess Who game board component with 3D card flip animations, secret card selection, and victory detection (`src/components/game/CardFlip.tsx`, `GameBoard.tsx`).
- [x] Implement Web Audio API sound synthesizer (`src/lib/audio.ts`) for card flips, clicks, victory fanfare, and defeat buzzers.
- [x] Build Tactical Question Assistant (`QuestionAssistant.tsx`) for automated card elimination.
- [x] Implement default sample template (Classic 24 Characters) in `src/data/defaultTemplate.ts`.
- [x] Solo practice page route at `/play/practice`.

### Phase 3: Auth & Custom Template Creator Studio ✅
- [x] Integrate Supabase Client & Server SDKs (`src/lib/supabase/client.ts`, `server.ts`).
- [x] Create database SQL schema with Row Level Security (RLS) policies in `supabase/schema.sql`.
- [x] Creator Authentication Page at `/auth/login`.
- [x] Build drag-and-drop Card Set Creator Studio at `/create` (image uploads/avatars, character attributes tagging, grid setup).
- [x] Public Template Library Gallery at `/templates` with search, tags, filtering, and template launching.

### Phase 4: Serverless Online Multiplayer (Rooms & Matchmaking) ✅
- [x] Host Room Creation page at `/host` (6-character Room Code, optional password protection, public/private toggles).
- [x] Public Game Lobbies Finder at `/lobbies`.
- [x] Real-time online game room engine at `/play/[roomCode]` using Supabase Realtime WebSocket presence and broadcast channels.
- [x] In-game real-time chat drawer & question log.

---

## Verification & Quality Assurance

- **Type Checking**: `npm run type-check` (Passed with 0 errors).
- **Production Build**: `npm run build` (Compiled successfully in 1.9s).
- **Git Branching & GitHub**: Pushed to `https://github.com/shivamchhapola/guess-who` across `main`, `develop`, and `feature/*` branches.
