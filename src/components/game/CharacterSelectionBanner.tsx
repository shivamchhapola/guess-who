'use client';

import React from 'react';
import { CharacterCard } from '@/types/game';
import { CardFlip } from './CardFlip';
import { Eye } from 'lucide-react';

interface CharacterSelectionBannerProps {
  cards: CharacterCard[];
  isMyReady: boolean;
  isOpponentReady: boolean;
  playerSecretId: string | null;
  onSelectSecretCard: (cardId: string) => void;
}

export const CharacterSelectionBanner: React.FC<CharacterSelectionBannerProps> = ({
  cards,
  isMyReady,
  isOpponentReady,
  playerSecretId,
  onSelectSecretCard,
}) => {
  return (
    <div className="w-full game-panel p-5 sm:p-8 rounded-3xl mb-6 text-center flex flex-col items-center shadow-2xl"
      style={{ border: '1px solid rgba(245,158,11,0.3)' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-amber-500/10 border border-amber-500/30 text-amber-400">
        <Eye className="w-6 h-6" />
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
        Choose Your Secret Character
      </h3>

      <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-4">
        Click any card to select your mystery character for this match!
      </p>

      {/* Ready Status Pills */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          isMyReady
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        }`}>
          You: {isMyReady ? 'Secret Chosen ✓' : 'Selecting...'}
        </span>

        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          isOpponentReady
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          Opponent: {isOpponentReady ? 'Secret Chosen ✓' : 'Selecting...'}
        </span>
      </div>

      {/* Selection Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 w-full">
        {cards.map((card) => (
          <CardFlip
            key={card.id}
            card={card}
            isFlippingDown={false}
            isSecret={card.id === playerSecretId}
            isSelectable={true}
            onToggleFlip={() => {}}
            onSelectSecret={onSelectSecretCard}
          />
        ))}
      </div>
    </div>
  );
};
