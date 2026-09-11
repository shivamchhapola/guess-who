'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, Clock, Flag, MessageSquare, RotateCcw, Send, Sparkles } from 'lucide-react';
import { CardSetTemplate, CharacterCard, QuestionLogItem, WinReason } from '@/types/game';
import { CardFlip } from '../CardFlip';
import { GuessModal } from '../GuessModal';
import { VictoryModal } from '../VictoryModal';

interface ActiveMultiplayerGameProps {
  roomCode: string;
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
  onEndTurn: () => void;
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
  roomCode, gameRound, turnTimerSetting, secondsRemaining, isMyTurn,
  opponentName, playerName, currentTemplate, playerSecretCard, opponentSecretCard,
  playerSecretId, flippedCardIds, standingCardsCount, chatMessages, chatInput,
  chatBottomRef, showMobileSecretModal, showSurrenderModal, isGuessModalOpen,
  selectedGuessCard, winnerId, winReason, onRequestLeave, onEndTurn,
  onRequestSurrender, onToggleMobileSecret, onResetFlips, onToggleFlip,
  onOpenGuess, onCloseGuess, onConfirmGuess, onChatInputChange, onSendChat,
  onCloseSurrender, onSurrender, onPlayAgain,
}) => (
  <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4">
    <div className="game-panel px-4 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-white/10 shadow-lg">
      <div className="flex items-center gap-3 min-w-0">
        <button type="button" onClick={onRequestLeave} className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10 transition-colors" title="Leave Match"><ArrowLeft className="w-4 h-4" /></button>
        <div className="min-w-0"><div className="flex items-center gap-2"><span className="text-base font-black tracking-widest text-amber-400 font-mono">#{roomCode}</span><span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Round #{gameRound}</span></div></div>
      </div>
      {playerSecretCard && <button type="button" onClick={onToggleMobileSecret} className="lg:hidden px-3 py-1.5 rounded-xl text-amber-300 bg-amber-500/10 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5" title="View your secret character"><Sparkles className="w-3.5 h-3.5" /><span>My Secret</span></button>}
      {turnTimerSetting > 0 && <div className={`px-4 py-1.5 rounded-full text-xs font-mono font-extrabold flex items-center gap-1.5 border transition-all ${secondsRemaining <= 10 ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'}`}><Clock className="w-3.5 h-3.5" /><span>00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}</span></div>}
      <div className="flex items-center gap-2">{isMyTurn && <button type="button" onClick={onEndTurn} className="py-1.5 px-3.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md transition-all hover:scale-105">End Turn</button>}<button type="button" onClick={onRequestSurrender} className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors" title="Surrender Match"><Flag className="w-4 h-4" /></button></div>
    </div>

    <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-lg transition-all ${isMyTurn ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-gradient-to-r from-cyan-500/10 via-slate-900 to-cyan-500/10 border-cyan-500/30 text-cyan-300'}`}>
      <div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'}`} /><div><h2 className="text-sm font-black uppercase tracking-wider">{isMyTurn ? '⚡ YOUR TURN' : `⏳ OPPONENT'S TURN (${opponentName || 'Opponent'})`}</h2><p className="text-xs text-slate-400">{isMyTurn ? 'Flip non-matching cards or click Guess on a card!' : 'Waiting for opponent to take their action...'}</p></div></div>{isMyTurn && <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-400 text-slate-950">ACTIVE</span>}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="flex items-center justify-between px-1"><span className="text-xs font-bold text-slate-400">Standing Characters: <span className="text-amber-400 font-extrabold">{standingCardsCount}</span> / {currentTemplate.cards.length}</span><button type="button" onClick={onResetFlips} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset Flips</button></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">{currentTemplate.cards.map((card) => <CardFlip key={card.id} card={card} isFlippingDown={flippedCardIds.includes(card.id)} isSecret={card.id === playerSecretId} isGuessable={isMyTurn} onToggleFlip={onToggleFlip} onMakeGuess={onOpenGuess} />)}</div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        {playerSecretCard && <div className="game-panel p-5 rounded-3xl border border-amber-500/40 flex flex-col items-center text-center shadow-xl"><span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">YOUR SECRET CHARACTER</span><div className="relative w-24 h-32 rounded-2xl overflow-hidden border-2 border-amber-400 mb-3 shadow-lg bg-slate-950"><Image src={playerSecretCard.imageUrl} alt={playerSecretCard.name} fill className="object-cover" unoptimized /></div><h3 className="text-lg font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{playerSecretCard.name}</h3><p className="text-[11px] text-slate-400 line-clamp-2">Keep this character safe! Opponent is trying to guess them.</p></div>}
        <div className="game-panel p-4 rounded-3xl border border-white/10 flex flex-col h-[380px]"><h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Room Chat Log</h4><div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 mb-3">{chatMessages.length === 0 ? <p className="text-slate-500 text-xs italic text-center my-auto">No messages yet. Ask questions here!</p> : chatMessages.map((msg) => <div key={msg.id} className={`p-2.5 rounded-xl text-xs ${msg.sender === 'system' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium' : msg.senderName === playerName ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 ml-4' : 'bg-white/5 border border-white/10 text-slate-200 mr-4'}`}><div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5 font-mono"><span>{msg.senderName || 'System'}</span><span>{msg.timestamp}</span></div><p>{msg.question}</p></div>)}<div ref={chatBottomRef} /></div><form onSubmit={onSendChat} className="flex gap-2"><input type="text" value={chatInput} onChange={(e) => onChatInputChange(e.target.value)} placeholder="Ask a question..." className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400" /><button type="submit" className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"><Send className="w-3.5 h-3.5" /></button></form></div>
      </div>
    </div>

    {showMobileSecretModal && playerSecretCard && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={onToggleMobileSecret}><div className="game-panel p-6 rounded-3xl max-w-xs w-full border border-amber-500/40 text-center flex flex-col items-center shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}><span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">YOUR SECRET CHARACTER</span><div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-amber-400 mb-3 bg-slate-950"><Image src={playerSecretCard.imageUrl} alt={playerSecretCard.name} fill className="object-cover" unoptimized /></div><h3 className="text-xl font-black text-white mb-1">{playerSecretCard.name}</h3><p className="text-xs text-slate-400 mb-4">Keep this character safe from your opponent!</p><button type="button" onClick={onToggleMobileSecret} className="w-full py-2.5 rounded-xl font-bold text-xs bg-white/10 text-white hover:bg-white/20 border border-white/10">Close</button></div></div>}
    {isGuessModalOpen && selectedGuessCard && <GuessModal isOpen={isGuessModalOpen} card={selectedGuessCard} onConfirm={() => onConfirmGuess(selectedGuessCard)} onCancel={onCloseGuess} />}
    {showSurrenderModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"><div className="game-panel p-6 rounded-3xl max-w-md w-full border border-rose-500/40 flex flex-col gap-4 text-center"><Flag className="w-10 h-10 text-rose-400 mx-auto" /><h3 className="text-xl font-extrabold text-white">Surrender Match?</h3><p className="text-slate-300 text-xs">Are you sure you want to forfeit this round to {opponentName || 'Opponent'}?</p><div className="flex items-center gap-3 pt-2"><button type="button" onClick={onCloseSurrender} className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-300 bg-white/5">Cancel</button><button type="button" onClick={onSurrender} className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-rose-600">Surrender</button></div></div></div>}
    <VictoryModal isOpen={gameStatus === 'finished'} isWon={winnerId === playerName} winReason={winReason} winnerName={winnerId} guessedCard={selectedGuessCard} secretCard={playerSecretCard} opponentSecretCard={opponentSecretCard} onPlayAgain={onPlayAgain} />
  </div>
);
