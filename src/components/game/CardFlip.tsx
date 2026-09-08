'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CharacterCard } from '@/types/game';
import { soundFx } from '@/lib/audio';
import { Eye, EyeOff, Target, Sparkles, RotateCcw } from 'lucide-react';
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
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectable && onSelectSecret) {
      soundFx.playSelect();
      onSelectSecret(card.id);
      return;
    }
  };

  return (
    <div className="relative group w-full aspect-[3/4.2] perspective-1000 select-none">
      {/* Secret Card Indicator Badge */}
      {isSecret && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow-xl flex items-center gap-1 ring-2 ring-slate-950 whitespace-nowrap">
          <Eye className="w-3 h-3 shrink-0" />
          <span>YOUR SECRET</span>
        </div>
      )}

      <motion.div
        className="w-full h-full relative transform-style-3d"
        initial={false}
        animate={{ rotateY: isFlippingDown ? 180 : 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
        onClick={handleCardClick}
      >
        {/* FRONT OF CARD (Standing Up / Revealed) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl glass-card border flex flex-col justify-between p-2 backface-hidden transition-all duration-200 ${isSecret
            ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-500/10 shadow-lg shadow-amber-500/20'
            : 'border-slate-700/60 hover:border-cyan-400/70 hover:shadow-xl hover:shadow-cyan-500/15'
            }`}
        >
          {/* Card Portrait Photo */}
          <div className="relative w-full aspect-[4/3.8] rounded-xl bg-slate-950 overflow-hidden border border-white/10 flex items-center justify-center">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              sizes="(max-width: 768px) 33vw, 15vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </div>

          {/* Character Name */}
          <div className="w-full text-center py-0.5 px-0.5">
            <h3 className="font-extrabold text-slate-100 text-md truncate tracking-tight whitespace-nowrap">
              {card.name}
            </h3>
          </div>

          {/* Action Buttons Bar */}
          <div className="w-full flex items-center justify-between gap-1 pt-1 border-t border-white/10">
            {isSelectable ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playSelect();
                  if (onSelectSecret) onSelectSecret(card.id);
                }}
                className="w-full py-1 px-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-[12px] rounded-lg flex items-center justify-center gap-1 shadow-md transition-all hover:scale-[1.02] whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 shrink-0 fill-current" />
                <span>Select</span>
              </button>
            ) : (
              <>
                {/* Eliminate / Flip Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playCardFlip(true);
                    onToggleFlip(card.id);
                  }}
                  className="flex-1 py-1 px-1 bg-slate-900/90 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 font-bold text-[12px] rounded-lg flex items-center justify-center gap-1 transition-colors whitespace-nowrap overflow-hidden cursor-pointer"
                  title="Eliminate / Flip Down Card"
                >
                  <EyeOff className="w-3 h-3 shrink-0 text-slate-400 group-hover:text-amber-400" />
                  <span>Eliminate</span>
                </button>

                {/* Guess Button */}
                {isGuessable && onMakeGuess && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playSelect();
                      onMakeGuess(card);
                    }}
                    className="py-1 px-1.5 bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 border border-pink-500/30 hover:border-pink-400 font-extrabold text-[12px] rounded-lg flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    title="Make final guess on this character!"
                  >
                    <Target className="w-3 h-3 shrink-0 text-pink-400" />
                    <span>Guess</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* BACK OF CARD (Flipped Down / Eliminated) */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl border border-slate-800 flex flex-col items-center justify-between p-2.5 rotate-y-180 backface-hidden bg-slate-950/95"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(239, 68, 68, 0.12) 0%, transparent 80%)',
          }}
        >
          <div className="w-full flex justify-center pt-1">
            <span className="text-[9px] font-black text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              ELIMINATED
            </span>
          </div>

          <div className="text-center px-1">
            <span className="text-[12px] font-bold text-slate-400 line-through truncate block max-w-[110px] mx-auto whitespace-nowrap">
              {card.name}
            </span>
          </div>

          {/* Unflip / Undo Elimination Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playCardFlip(false);
              onToggleFlip(card.id);
            }}
            className="w-full py-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
            title="Unflip / Restore Card"
          >
            <RotateCcw className="w-3 h-3 shrink-0 text-cyan-400" />
            <span>Unflip</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
