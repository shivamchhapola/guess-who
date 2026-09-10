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

export type GameStatus = 'setup' | 'selecting_character' | 'active' | 'finished';
export type WinReason = 'correct_guess' | 'wrong_guess' | 'opponent_wrong_guess' | 'surrender' | 'disconnect' | 'timeout';

export interface SharedPlayer {
  id: string;
  name: string;
  avatarUrl: string;
  isHost: boolean;
  isReady: boolean;
  secretCardId: string | null;
}

export interface SharedRoomState {
  status: GameStatus;
  hostId: string;
  guestId: string | null;
  selectedSetId: string;
  turnTimerSetting: number; // 0, 30, 60, 90, 120
  currentTurnPlayerId: string | null;
  turnStartedAt: number | null;
  winnerId: string | null;
  winReason: WinReason | null;
  gameRound: number;
  players: Record<string, SharedPlayer>;
}

