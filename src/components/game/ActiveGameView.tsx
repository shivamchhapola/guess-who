'use client';

import React from 'react';
import { CardSetTemplate, CharacterCard, QuestionLogItem } from '@/types/game';
import { CardFlip } from './CardFlip';
import { GameHeaderBar } from './GameHeaderBar';
import { GameChatLog } from './GameChatLog';
import { RotateCcw } from 'lucide-react';

interface ActiveGameViewProps {
  roomCode: string;
  currentTemplate: CardSetTemplate;
  playerSecretCard: CharacterCard | null;
  currentTurnPlayerId: string | null;
  presenceKey: string;
  secondsRemaining: number;
  isMuted: boolean;
  flippedCardIds: string[];
  chatMessages: QuestionLogItem[];
  gameStatus: 'active' | 'finished';
  onToggleMute: () => void;
  onOpenSurrenderModal: () => void;
  onOpenLeaveModal: () => void;
  onResetFlips: () => void;
  onToggleFlip: (cardId: string) => void;
  onMakeGuess: (card: CharacterCard) => void;
  onSendChatMessage: (messageText: string) => void;
}

export const ActiveGameView: React.FC<ActiveGameViewProps> = ({
  roomCode,
  currentTemplate,
  playerSecretCard,
  currentTurnPlayerId,
  presenceKey,
  secondsRemaining,
  isMuted,
  flippedCardIds,
  chatMessages,
  gameStatus,
  onToggleMute,
  onOpenSurrenderModal,
  onOpenLeaveModal,
  onResetFlips,
  onToggleFlip,
  onMakeGuess,
  onSendChatMessage,
}) => {
  const standingCardsCount = currentTemplate.cards.length - flippedCardIds.length;
  const isMyTurn = currentTurnPlayerId === presenceKey;

  return (
    <>
      {/* Header Bar */}
      <GameHeaderBar
        roomCode={roomCode}
        currentTemplate={currentTemplate}
        playerSecretCard={playerSecretCard}
        currentTurnPlayerId={currentTurnPlayerId}
        presenceKey={presenceKey}
        secondsRemaining={secondsRemaining}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onOpenSurrenderModal={onOpenSurrenderModal}
        onOpenLeaveModal={onOpenLeaveModal}
      />

      {/* Cards Grid & Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full flex-1">
        {/* Left: 24-Card Elimination Grid */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Standing Counter */}
          <div className="px-4 py-2 rounded-xl mb-3 bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400">
              {standingCardsCount} / {currentTemplate.cards.length} Cards Standing
            </span>
            <button
              type="button"
              onClick={onResetFlips}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Board</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3 w-full">
            {currentTemplate.cards.map((card) => (
              <CardFlip
                key={card.id}
                card={card}
                isFlippingDown={flippedCardIds.includes(card.id)}
                isSecret={card.id === playerSecretCard?.id}
                isGuessable={gameStatus === 'active' && isMyTurn}
                onToggleFlip={onToggleFlip}
                onMakeGuess={onMakeGuess}
              />
            ))}
          </div>
        </div>

        {/* Right: Match Chat & Question Log */}
        <div className="lg:col-span-1">
          <GameChatLog
            chatMessages={chatMessages}
            presenceKey={presenceKey}
            onSendChatMessage={onSendChatMessage}
            disabled={gameStatus === 'finished'}
          />
        </div>
      </div>
    </>
  );
};
