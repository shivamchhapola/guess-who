'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CharacterCard } from '@/types/game';
import { soundFx } from '@/lib/audio';
import { HelpCircle, Eye, EyeOff, Target } from 'lucide-react';
import Image from 'next/image';

interface CardFlipProps {
  card: CharacterCard;
  isFlippingDown: boolean;
  isSecret?: boolean;
  isSelectable?: boolean;
  isGuessable?: boolean;
  onToggleFlip: (cardId: string) => void;
  onSelectSecret?: (cardId: string) => void;
  onMakeGuess?: (card: CharacterCard) => void;
}

export const CardFlip: React.FC<CardFlipProps> = ({
  card,
  isFlippingDown,
  isSecret = false,
  isSelectable = false,
  isGuessable = false,
  onToggleFlip,
  onSelectSecret,
  onMakeGuess,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectable && onSelectSecret) {
      soundFx.playSelect();
      onSelectSecret(card.id);
      return;
    }
    soundFx.playCardFlip(!isFlippingDown);
    onToggleFlip(card.id);
  };

  return (
    <div className="relative group w-full aspect-[3/4] perspective-1000 select-none">
      {/* Secret Card Badge indicator */}
      {isSecret && (
        <div className="absolute -top-2.5 -left-2.5 z-20 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>YOUR SECRET</span>
        </div>
      )}

      <motion.div
        className="w-full h-full relative transform-style-3d cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlippingDown ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0.0, 0.2, 1] }}
        onClick={handleClick}
      >
        {/* FRONT OF CARD (Standing Up / Revealed) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl glass-card border flex flex-col items-center justify-between p-3 backface-hidden transition-all ${
            isSecret
              ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/20'
              : 'border-slate-700/60 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/10'
          }`}
        >
          {/* Card Image Container */}
          <div className="relative w-full aspect-square rounded-xl bg-slate-950/60 overflow-hidden border border-white/5 flex items-center justify-center">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              sizes="(max-width: 768px) 25vw, 12vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </div>

          {/* Character Name */}
          <div className="w-full text-center">
            <h3 className="font-bold text-slate-100 text-sm sm:text-base truncate tracking-tight">
              {card.name}
            </h3>
          </div>

          {/* Action Bar (Guess Button / Flip toggle) */}
          <div className="w-full flex items-center justify-between gap-1 pt-1 border-t border-white/5 text-[11px] font-medium text-slate-400">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playCardFlip(true);
                onToggleFlip(card.id);
              }}
              className="flex items-center gap-1 hover:text-cyan-400 transition-colors p-1"
              title="Flip Down Card"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline">Eliminate</span>
            </button>

            {isGuessable && onMakeGuess && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playSelect();
                  onMakeGuess(card);
                }}
                className="flex items-center gap-1 text-pink-400 hover:text-pink-300 font-semibold p-1 hover:bg-pink-500/10 rounded transition-colors"
                title="Guess this is the secret card!"
              >
                <Target className="w-3.5 h-3.5 text-pink-400" />
                <span>Guess</span>
              </button>
            )}
          </div>
        </div>

        {/* BACK OF CARD (Flipped Down / Eliminated) */}
        <div className="absolute inset-0 w-full h-full rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center p-3 rotate-y-180 backface-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40">
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-600 mb-2">
            <HelpCircle className="w-5 h-5 text-slate-500" />
          </div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest text-center">
            ELIMINATED
          </span>
          <span className="text-xs font-bold text-slate-400 line-through mt-1 truncate max-w-full">
            {card.name}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
