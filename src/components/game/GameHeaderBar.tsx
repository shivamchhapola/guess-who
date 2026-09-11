'use client';

import React from 'react';
import { CardSetTemplate, CharacterCard } from '@/types/game';
import { ArrowLeft, Clock, Flag, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';

interface GameHeaderBarProps {
  roomCode: string;
  currentTemplate: CardSetTemplate;
  playerSecretCard: CharacterCard | null;
  currentTurnPlayerId: string | null;
  presenceKey: string;
  secondsRemaining: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSurrenderModal: () => void;
  onOpenLeaveModal: () => void;
}

export const GameHeaderBar: React.FC<GameHeaderBarProps> = ({
  roomCode,
  currentTemplate,
  playerSecretCard,
  currentTurnPlayerId,
  presenceKey,
  secondsRemaining,
  isMuted,
  onToggleMute,
  onOpenSurrenderModal,
  onOpenLeaveModal,
}) => {
  const isMyTurn = currentTurnPlayerId === presenceKey;

  return (
    <div className="game-panel px-4 py-3 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-3 shadow-xl"
      style={{ border: '1px solid rgba(255,255,255,0.09)' }}>

      {/* Left: Back & Room info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenLeaveModal}
          className="p-2 rounded-xl text-slate-300 hover:text-white transition-colors shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          title="Leave Room"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-white text-sm sm:text-base tracking-tight truncate">{currentTemplate.title}</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {roomCode}
            </span>
          </div>
          <p className="text-slate-500 text-[11px] font-semibold">{currentTemplate.cards.length} cards</p>
        </div>
      </div>

      {/* Center: Turn & Countdown */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            isMyTurn
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-800/80 text-amber-400 border border-amber-500/30'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isMyTurn ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
          <span>{isMyTurn ? 'Your Turn' : "Opponent's Turn"}</span>
          <span className="font-mono text-white bg-slate-900/80 px-1.5 py-0.5 rounded text-[11px]">
            {secondsRemaining}s
          </span>
        </div>
      </div>

      {/* Right: Secret Card & Actions */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {/* Secret Card Widget */}
        {playerSecretCard && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">My secret</span>
            <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0" style={{ border: '1px solid rgba(245,158,11,0.6)' }}>
              <Image src={playerSecretCard.imageUrl} alt={playerSecretCard.name} fill className="object-cover" unoptimized />
            </div>
            <span className="text-xs font-bold text-white max-w-[80px] truncate">{playerSecretCard.name}</span>
          </div>
        )}

        {/* Surrender Button */}
        <button
          type="button"
          onClick={onOpenSurrenderModal}
          className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
          title="Surrender Match"
        >
          <Flag className="w-4 h-4" />
        </button>

        {/* Mute Button */}
        <button
          type="button"
          onClick={onToggleMute}
          className="p-2 rounded-xl transition-colors text-slate-400 hover:text-white"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </div>
  );
};
