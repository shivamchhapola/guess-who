'use client';

import React from 'react';
import Image from 'next/image';
import { CardSetTemplate } from '@/types/game';

interface CharacterSelectionProps {
  gameRound: number;
  isMyReady: boolean;
  isOpponentReady: boolean;
  opponentName: string | null;
  playerSecretId: string | null;
  currentTemplate: CardSetTemplate;
  onSelectSecretCard: (cardId: string) => void;
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  gameRound,
  isMyReady,
  isOpponentReady,
  opponentName,
  playerSecretId,
  currentTemplate,
  onSelectSecretCard,
}) => (
  <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
    <div className="game-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">STEP 1: SECRET SELECTION (ROUND #{gameRound})</span>
        <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Select Your Secret Character</h1>
        <p className="text-xs text-slate-400 mt-1">Choose the character card your opponent will try to guess!</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${isMyReady ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}`}>
          <span className={`w-2 h-2 rounded-full ${isMyReady ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} /><span>You: {isMyReady ? 'Ready' : 'Selecting...'}</span>
        </div>
        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${isOpponentReady ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-white/10'}`}>
          <span className={`w-2 h-2 rounded-full ${isOpponentReady ? 'bg-emerald-400' : 'bg-slate-500'}`} /><span>{opponentName || 'Opponent'}: {isOpponentReady ? 'Ready' : 'Selecting...'}</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {currentTemplate.cards.map((card) => {
        const isSelected = playerSecretId === card.id;
        return (
          <div key={card.id} onClick={() => onSelectSecretCard(card.id)} className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all border-2 flex flex-col justify-end p-3 ${isSelected ? 'border-amber-400 ring-4 ring-amber-500/30 scale-[1.03] shadow-xl' : 'border-white/10 hover:border-amber-400/60 hover:scale-[1.01]'}`}>
            <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="relative z-10 text-center">
              <span className="font-extrabold text-white text-xs block truncate mb-1">{card.name}</span>
              {isSelected ? <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">SECRET CHOICE</span> : <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold text-[10px] uppercase">SELECT</span>}
            </div>
          </div>
        );
      })}
    </div>

    {isMyReady && !isOpponentReady && <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-2"><div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /><span>Secret chosen! Waiting for opponent to select their secret character...</span></div>}
  </div>
);
