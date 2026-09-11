export interface CharacterCard {
  id: string;
  name: string;
  imageUrl: string;
  attributes: {
    gender?: 'male' | 'female' | 'other';
    hairColor?: 'brown' | 'black' | 'blonde' | 'red' | 'white' | 'bald';
    hairLength?: 'short' | 'long' | 'none';
    eyeColor?: 'brown' | 'blue' | 'green';
    glasses?: boolean;
    hat?: boolean;
    facialHair?: boolean;
    earrings?: boolean;
    skinTone?: string;
    [key: string]: string | boolean | undefined;
  };
}

export interface CardSetTemplate {
  id: string;
  title: string;
  description: string;
  creatorId?: string;
  creatorName: string;
  isPublic: boolean;
  cards: CharacterCard[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionLogItem {
  id: string;
  timestamp: string;
  sender: 'player' | 'opponent' | 'system';
  senderName?: string;
  senderId?: string;
  question: string;
  answer?: 'yes' | 'no';
}

export type GameStatus = 'setup' | 'selecting_character' | 'active' | 'finished';

export type WinReason =
  | 'correct_guess'
  | 'wrong_guess'
  | 'opponent_wrong_guess'
  | 'surrender'
  | 'disconnect'
  | 'timeout';

/**
 * Stable identity for a player within a room.
 * Display names are presentation data and must not be used as identifiers.
 */
export interface RoomPlayerIdentity {
  playerId: string;
  roomCode: string;
  name: string;
  avatarUrl: string;
  isHost: boolean;
}

/** Public player state safe to share with every room participant. */
export interface PublicPlayerState {
  id: string;
  name: string;
  avatarUrl: string;
  isHost: boolean;
  isReady: boolean;
}

/** Private state that must only be exposed to the owning player. */
export interface PrivatePlayerState {
  playerId: string;
  secretCardId: string | null;
  eliminatedCardIds: string[];
}

/** Canonical authoritative room/match state. */
export interface RoomState {
  roomId: string;
  code: string;
  hostPlayerId: string;
  guestPlayerId: string | null;
  templateId: string;
  turnTimerSeconds: number;
  status: GameStatus;
  gameRound: number;
  currentTurnPlayerId: string | null;
  turnStartedAt: number | null;
  winnerPlayerId: string | null;
  winReason: WinReason | null;
  revision: number;
  players: Record<string, PublicPlayerState>;
}

/** Commands represent requests to change authoritative room state. */
export type GameCommand =
  | {
      type: 'start_round';
      playerId: string;
    }
  | {
      type: 'select_secret';
      playerId: string;
      cardId: string;
    }
  | {
      type: 'end_turn';
      playerId: string;
    }
  | {
      type: 'make_guess';
      playerId: string;
      cardId: string;
    }
  | {
      type: 'surrender';
      playerId: string;
    }
  | {
      type: 'change_template';
      playerId: string;
      templateId: string;
    }
  | {
      type: 'start_rematch';
      playerId: string;
    };

/** Events/results emitted after authoritative state changes. */
export type RoomEvent =
  | {
      type: 'room_updated';
      state: RoomState;
    }
  | {
      type: 'round_started';
      round: number;
    }
  | {
      type: 'turn_started';
      playerId: string;
      startedAt: number;
    }
  | {
      type: 'match_finished';
      winnerPlayerId: string;
      winReason: WinReason;
    }
  | {
      type: 'rematch_started';
      round: number;
    }
  | {
      type: 'player_joined';
      player: PublicPlayerState;
    }
  | {
      type: 'player_left';
      playerId: string;
    };

/**
 * @deprecated Use PublicPlayerState and PrivatePlayerState instead.
 * Kept temporarily so existing consumers can migrate incrementally.
 */
export interface SharedPlayer {
  id: string;
  name: string;
  avatarUrl: string;
  isHost: boolean;
  isReady: boolean;
}

/**
 * @deprecated Use RoomState instead. Kept temporarily for compatibility while
 * multiplayer consumers migrate to the canonical state contract.
 */
export interface SharedRoomState {
  status: GameStatus;
  hostId: string;
  guestId: string | null;
  selectedSetId: string;
  turnTimerSetting: number;
  currentTurnPlayerId: string | null;
  turnStartedAt: number | null;
  winnerId: string | null;
  winReason: WinReason | null;
  gameRound: number;
  players: Record<string, SharedPlayer>;
}

export interface LocalGameState {
  template: CardSetTemplate;
  secretCardId: string | null;
  opponentSecretCardId: string | null;
  flippedCardIds: string[];
  isSecretSelected: boolean;
  turn: 'player' | 'opponent';
  status: 'selecting_secret' | 'in_progress' | 'won' | 'lost';
  guessHistory: QuestionLogItem[];
  startTime: number;
}

/** Database Row Types matching Supabase PostgreSQL schema.sql */
export interface ProfileRow {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface TemplateRow {
  id: string;
  creator_id: string | null;
  creator_name: string;
  title: string;
  description: string | null;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CardRow {
  id: string;
  template_id: string;
  name: string;
  image_url: string;
  attributes: Record<string, string | boolean | undefined>;
}

export interface GameRoomRow {
  code: string;
  host_id: string;
  template_id: string | null;
  password_hash: string | null;
  is_public: boolean;
  turn_timer_seconds: number | null;
  status: GameStatus;
  state: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
