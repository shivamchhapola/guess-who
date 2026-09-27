'use client';

import React from 'react';
import { CardSetTemplate, CharacterCard, QuestionLogItem } from '@/types/game';
import { CardFlip } from './CardFlip';
import { GameHeaderBar } from './GameHeaderBar';
import { GameChatLog } from './GameChatLog';
import { CheckCheck, RotateCcw } from 'lucide-react';

interface ActiveGameViewProps {
  roomCode: string;
  currentTemplate: CardSetTemplate;
  playerSecretCard: CharacterCard | null;
  currentTurnPlayerId: string | null;
  presenceKey: string;
  secondsRemaining: number | null;
  /** 0 = timer off. Used to label the End Turn button appropriately. */
  turnTimerSetting: number;
  isMuted: boolean;
  flippedCardIds: string[];
  chatMessages: QuestionLogItem[];
  gameStatus: 'active' | 'finished';
  onToggleMute: () => void;
  onOpenSurrenderModal: () => void;
  onOpenLeaveModal: () => void;
  onResetFlips: () => void;
  onToggleFlip: (cardId: string) => void;
  /** Called when the active player voluntarily ends their turn. */
  onEndTurn: (reason?: 'timeout') => void;
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
  turnTimerSetting,
  isMuted,
  flippedCardIds,
  chatMessages,
  gameStatus,
  onToggleMute,
  onOpenSurrenderModal,
  onOpenLeaveModal,
  onResetFlips,
  onToggleFlip,
  onEndTurn,
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
          {/* Standing Counter + Action Row */}
          <div className="px-4 py-2 rounded-xl mb-3 bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs gap-2 flex-wrap">
            <span className="font-bold text-amber-400">
              {standingCardsCount} / {currentTemplate.cards.length} Cards Standing
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {/* ✅ BUG-05 fix: End Turn button — always visible during active game */}
              {gameStatus === 'active' && (
                <button
                  type="button"
                  id="btn-end-turn"
                  onClick={() => onEndTurn()}
                  disabled={!isMyTurn}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
                    isMyTurn
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 hover:from-emerald-500/30 hover:to-teal-500/30 hover:text-emerald-200 shadow-sm shadow-emerald-500/10'
                      : 'text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                  }`}
                  title={isMyTurn ? 'End your turn and pass to opponent' : "Wait for your turn"}
                >
                  <CheckCheck className="w-3 h-3 shrink-0" />
                  <span>{isMyTurn ? 'End Turn' : 'Opponent\'s Turn'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onResetFlips}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Board</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 w-full">
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
