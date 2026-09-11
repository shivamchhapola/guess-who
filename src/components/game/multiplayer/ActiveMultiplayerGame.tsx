'use client';

import React from 'react';
import Image from 'next/image';
import {
  ArrowLeft, Clock, Flag, MessageSquare, RotateCcw, Send, Sparkles,
} from 'lucide-react';
import { CardSetTemplate, CharacterCard, QuestionLogItem, WinReason } from '@/types/game';
import { CardFlip } from '../CardFlip';
import { GuessModal } from '../GuessModal';
import { VictoryModal } from '../VictoryModal';

interface ActiveMultiplayerGameProps {
  roomCode: string;
  isFinished: boolean;
  gameRound: number;
  turnTimerSetting: number;
  secondsRemaining: number;
  isMyTurn: boolean;
  opponentName: string | null;
  playerName: string;
  currentTemplate: CardSetTemplate;
  playerSecretCard: CharacterCard | null;
  opponentSecretCard: CharacterCard | null;
  playerSecretId: string | null;
  flippedCardIds: string[];
  standingCardsCount: number;
  chatMessages: QuestionLogItem[];
  chatInput: string;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
  showMobileSecretModal: boolean;
  showSurrenderModal: boolean;
  isGuessModalOpen: boolean;
  selectedGuessCard: CharacterCard | null;
  winnerId: string | null;
  winReason: WinReason | null;
  onRequestLeave: () => void;
  onEndTurn: (reason?: 'timeout') => void;
  onRequestSurrender: () => void;
  onToggleMobileSecret: () => void;
  onResetFlips: () => void;
  onToggleFlip: (cardId: string) => void;
  onOpenGuess: (card: CharacterCard) => void;
  onCloseGuess: () => void;
  onConfirmGuess: (card: CharacterCard) => void;
  onChatInputChange: (value: string) => void;
  onSendChat: (event: React.FormEvent) => void;
  onCloseSurrender: () => void;
  onSurrender: () => void;
  onPlayAgain: () => void;
}

export const ActiveMultiplayerGame: React.FC<ActiveMultiplayerGameProps> = ({
  roomCode, isFinished, gameRound, turnTimerSetting, secondsRemaining,
  isMyTurn, opponentName, playerName, currentTemplate, playerSecretCard,
  opponentSecretCard, playerSecretId, flippedCardIds, standingCardsCount,
  chatMessages, chatInput, chatBottomRef, showMobileSecretModal,
  showSurrenderModal, isGuessModalOpen, selectedGuessCard, winnerId, winReason,
  onRequestLeave, onEndTurn, onRequestSurrender, onToggleMobileSecret,
  onResetFlips, onToggleFlip, onOpenGuess, onCloseGuess, onConfirmGuess,
  onChatInputChange, onSendChat, onCloseSurrender, onSurrender, onPlayAgain,
}) => (
  <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4">
    <div className="game-panel px-4 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-white/10 shadow-lg">
      <div className="flex items-center gap-3 min-w-0">
        <button type="button" onClick={onRequestLeave} className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10 transition-colors" title="Leave Match">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-widest text-amber-400 font-mono">#{roomCode}</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Round #{gameRound}</span>
          </div>
        </div>
      </div>

      {playerSecretCard && (
        <button type="button" onClick={onToggleMobileSecret} className="lg:hidden px-3 py-1.5 rounded-xl text-amber-300 bg-amber-500/10 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5" title="View your secret character">
          <Sparkles className="w-3.5 h-3.5" />
          <span>My Secret</span>
        </button>
      )}

      {turnTimerSetting > 0 && (
        <div className={`px-4 py-1.5 rounded-full text-xs font-mono font-extrabold flex items-center gap-1.5 border transition-all ${secondsRemaining <= 10 ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{secondsRemaining}s</span>
        </div>
      )}
    </div>

    <div className="flex flex-col gap-4">
      <div className="game-panel p-4 sm:p-5 rounded-3xl border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">Your Board</span>
            <h2 className="text-xl font-black text-white">{currentTemplate.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${isFinished ? 'bg-slate-800 text-slate-400 border-white/10' : isMyTurn ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'}`}>
              {isFinished ? 'Match finished' : isMyTurn ? 'Your turn' : `${opponentName || 'Opponent'}'s turn`}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">{standingCardsCount} standing</span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
          {currentTemplate.cards.map((card) => (
            <CardFlip
              key={card.id}
              card={card}
              isFlippingDown={flippedCardIds.includes(card.id)}
              isSecret={card.id === playerSecretId}
              isGuessable={isMyTurn && !isFinished}
              onToggleFlip={onToggleFlip}
              onMakeGuess={onOpenGuess}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/10">
          <button type="button" onClick={onResetFlips} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/5 border border-white/10 flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" /> Reset flips
          </button>
          {!isFinished && isMyTurn && (
            <button type="button" onClick={() => onEndTurn()} className="game-btn-primary px-4 py-2 rounded-xl text-xs font-bold">End Turn</button>
          )}
          {!isFinished && (
            <button type="button" onClick={onRequestSurrender} className="px-3 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
              <Flag className="w-3.5 h-3.5" /> Surrender
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 game-panel p-4 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-amber-400" /><h3 className="text-sm font-bold text-white">Questions & Chat</h3></div>
            <span className="text-[10px] font-bold text-slate-500">{chatMessages.length} messages</span>
          </div>
          <div className="h-56 sm:h-64 overflow-y-auto rounded-2xl bg-slate-950/70 border border-white/10 p-3 space-y-2">
            {chatMessages.length === 0 ? <p className="text-xs text-slate-500 text-center py-10">Ask a question to start the conversation.</p> : chatMessages.map((item) => (
              <div key={item.id} className={`rounded-xl px-3 py-2 ${item.sender === 'system' ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-white/5 border border-white/5'}`}>
                <div className="flex items-center justify-between gap-2 mb-0.5"><span className="text-[10px] font-bold text-slate-400">{item.sender === 'system' ? 'SYSTEM' : item.senderName || playerName}</span><span className="text-[9px] text-slate-600">{item.timestamp}</span></div>
                <p className="text-xs text-slate-200 break-words">{item.question}</p>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
          {!isFinished && <form onSubmit={onSendChat} className="flex gap-2 mt-3"><input value={chatInput} onChange={(e) => onChatInputChange(e.target.value)} placeholder="Ask a question..." className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50" /><button type="submit" className="px-3 py-2.5 rounded-xl game-btn-primary" aria-label="Send message"><Send className="w-4 h-4" /></button></form>}
        </div>

        <div className="lg:col-span-4 game-panel p-4 rounded-3xl border border-amber-500/20">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">Your Secret Character</span>
          {playerSecretCard ? <div className="relative aspect-[3/4] max-h-80 rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30"><Image src={playerSecretCard.imageUrl} alt={playerSecretCard.name} fill className="object-cover object-top" unoptimized /><div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950 to-transparent"><span className="text-sm font-black text-white">{playerSecretCard.name}</span></div></div> : <div className="h-48 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-xs text-slate-500">Secret character not selected</div>}
        </div>
      </div>
    </div>

    {showMobileSecretModal && playerSecretCard && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onToggleMobileSecret}><div className="game-panel p-4 rounded-3xl max-w-sm w-full border border-amber-500/30" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between mb-3"><h3 className="text-lg font-black text-white">Your Secret</h3><button type="button" onClick={onToggleMobileSecret} className="text-slate-400">Close</button></div><div className="relative aspect-[3/4] rounded-2xl overflow-hidden"><Image src={playerSecretCard.imageUrl} alt={playerSecretCard.name} fill className="object-cover object-top" unoptimized /></div></div></div>}

    {isGuessModalOpen && selectedGuessCard && <GuessModal isOpen={isGuessModalOpen} card={selectedGuessCard} onConfirm={() => onConfirmGuess(selectedGuessCard)} onCancel={onCloseGuess} />}

    {showSurrenderModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"><div className="game-panel p-6 rounded-3xl max-w-md w-full border border-rose-500/40 flex flex-col gap-4 text-center"><Flag className="w-10 h-10 text-rose-400 mx-auto" /><h3 className="text-xl font-extrabold text-white">Surrender Match?</h3><p className="text-slate-300 text-xs">Are you sure you want to forfeit this round to {opponentName || 'Opponent'}?</p><div className="flex items-center gap-3 pt-2"><button type="button" onClick={onCloseSurrender} className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-300 bg-white/5">Cancel</button><button type="button" onClick={onSurrender} className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-rose-600">Surrender</button></div></div></div>}

    <VictoryModal isOpen={isFinished} isWon={winnerId === playerName} winReason={winReason} winnerName={winnerId} guessedCard={selectedGuessCard} secretCard={playerSecretCard} opponentSecretCard={opponentSecretCard} onPlayAgain={onPlayAgain} />
  </div>
);
