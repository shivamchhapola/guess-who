# Architecture Specification

This document details the system design, tech stack choices, data flow, and state synchronization strategy for the Guess Who web application.

---

## 1. Core Design Goals

1. **Zero-Server Backend**: The application runs entirely on Vercel using Next.js App Router (Server Actions, Edge Functions, Route Handlers). No long-running Node/Express/Docker backend required.
2. **Instant Playability**: Unauthenticated players can host or join games within 1 click or 6-digit code.
3. **Template Portability**: Card sets are stored as structured JSON schemas with linked image URLs, enabling easy sharing, cloning, and community templates.
4. **AI-Driven Compatibility**: Clean module boundaries, strong TypeScript interfaces, and declarative state facilitate seamless feature building by AI agents.

---

## 2. System Overview

```
                      +-----------------------------+
                      |   Next.js App Router       |
                      |   (Vercel Edge & Functions) |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
      +--------v--------+                         +--------v--------+
      |  Supabase / DB  |                         | WebRTC / Signals|
      | Auth, Templates |                         | Player P2P Sync |
      +-----------------+                         +-----------------+
```

---

## 3. Data Schema (TypeScript Specs)

```typescript
// Card Template Definition
export interface GuessWhoCard {
  id: string;
  name: string;
  imageUrl: string;
  tags?: Record<string, string | boolean>; // e.g., { hair: "glasses", female: true }
}

export interface GuessWhoTemplate {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  isPublic: boolean;
  cards: GuessWhoCard[];
  createdAt: string;
  updatedAt: string;
}

// Real-Time Game Room State
export interface PlayerState {
  id: string;
  name: string;
  isHost: boolean;
  selectedCardId?: string;
  flippedCardIds: string[]; // Cards eliminated by player
  isReady: boolean;
}

export interface GameRoom {
  code: string;
  passwordHash?: string;
  isPublic: boolean;
  templateId: string;
  status: 'waiting' | 'in_progress' | 'finished';
  currentTurnPlayerId?: string;
  winnerPlayerId?: string;
  players: Record<string, PlayerState>; // Map player ID to PlayerState
}
```

---

## 4. Real-Time Room & Multiplayer Flow

1. **Room Creation**: Host selects a card template, sets room rules (room code, optional password, public vs private), and receives a 6-character room code.
2. **Joining**: Guest enters room code or clicks shared link.
3. **Signaling**: WebRTC peer connection established between Host and Guest via serverless signaling route.
4. **Game Loop**:
   - Both players randomly or manually pick their secret character card.
   - Players alternate turns asking questions or taking guesses.
   - Flipping cards updates local state and broadcasts state delta to peer.
   - When a guess is declared, victory state is calculated and verified against secret cards.
