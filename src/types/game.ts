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

export interface SharedPlayer {
  id: string;
  nickname: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean; // Has selected secret character for current round
  connected: boolean;
}

export type GameStatus = 'setup' | 'selecting_character' | 'active' | 'finished';

export type WinReason =
  | 'correct_guess'
  | 'wrong_guess'
  | 'opponent_wrong_guess'
  | 'surrender'
  | 'disconnect'
  | 'timeout';

export interface SharedRoomState {
  roomId: string;
  hostPlayerId: string;
  players: Record<string, SharedPlayer>;
  selectedSetId: string;
  gameStatus: GameStatus;
  currentTurnPlayerId: string | null;
  turnTimerSetting: number; // 0 (Off), 30, 60, 90, 120
  turnStartedAt: number | null; // Epoch timestamp (ms)
  winnerPlayerId: string | null;
  winReason: WinReason | null;
  gameRound: number;
}

export interface PrivatePlayerState {
  secretCharacterId: string | null;
  flippedCardIds: string[];
}

export interface LocalGameState {
  template: CardSetTemplate;
  secretCardId: string | null;
  opponentSecretCardId: string | null;
  flippedCardIds: string[]; // Set of card IDs flipped down by player
  isSecretSelected: boolean;
  turn: 'player' | 'opponent';
  status: 'selecting_secret' | 'in_progress' | 'won' | 'lost';
  guessHistory: QuestionLogItem[];
  startTime: number;
}

