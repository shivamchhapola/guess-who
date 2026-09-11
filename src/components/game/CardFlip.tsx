'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CharacterCard } from '@/types/game';
import { soundFx } from '@/lib/audio';
import { X, Target, Sparkles, RotateCcw } from 'lucide-react';
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
  const cardLabel = `${card.name}${isSecret ? ' (Your Secret Character)' : ''}, ${
    isFlippingDown ? 'Eliminated card. Press to restore.' : 'Standing card. Press to eliminate.'
  }`;

  const handleCardInteraction = () => {
    if (isSelectable) {
      soundFx.playSelect();
      if (onSelectSecret) onSelectSecret(card.id);
    } else {
      soundFx.playCardFlip(!isFlippingDown);
      onToggleFlip(card.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardInteraction();
    }
  };

  return (
    <div
      id={`card-flip-${card.id}`}
      tabIndex={0}
      role="group"
      aria-label={cardLabel}
      onKeyDown={handleKeyDown}
      className="relative w-full aspect-[3/4.4] perspective-1000 select-none touch-pan-y focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-2xl"
    >
      {/* Secret Card Badge */}
      {isSecret && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-xl flex items-center gap-0.5 ring-2 ring-slate-950 whitespace-nowrap">
          <Sparkles className="w-2.5 h-2.5 shrink-0" />
          <span>SECRET</span>
        </div>
      )}

      <motion.div
        className="w-full h-full relative transform-style-3d cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlippingDown ? 180 : 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0.0, 0.2, 1] }}
        onClick={handleCardInteraction}
      >
        {/* ── FRONT OF CARD ───────────────────────────────── */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl overflow-hidden backface-hidden flex flex-col ${
            isSecret
              ? 'ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/25'
              : 'hover:border-slate-600 transition-colors'
          }`}
          style={{
            background: 'rgba(14, 22, 44, 0.95)',
            border: isSecret
              ? '1px solid rgba(245,158,11,0.6)'
              : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Card Photo */}
          <div className="relative flex-1 overflow-hidden">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 14vw"
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Card Name & Explicit Touch Buttons Footer */}
          <div
            className="px-1.5 py-1.5 text-center shrink-0 flex flex-col gap-1"
            style={{ background: 'rgba(7,9,15,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="font-extrabold text-slate-100 text-[11px] sm:text-xs truncate tracking-tight">
              {card.name}
            </p>

            {/* Selectable Choice Button */}
            {isSelectable && (
              <button
                type="button"
                id={`btn-select-${card.id}`}
                aria-label={`Select ${card.name} as secret character`}
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playSelect();
                  if (onSelectSecret) onSelectSecret(card.id);
                }}
                className="w-full min-h-[32px] py-1 rounded-lg font-black text-[10px] text-slate-950 transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}
              >
                <Sparkles className="w-3 h-3 stroke-[2.5]" />
                <span>Choose</span>
              </button>
            )}

            {/* Active Gameplay Guess Button */}
            {!isSelectable && isGuessable && onMakeGuess && (
              <button
                type="button"
                id={`btn-guess-${card.id}`}
                aria-label={`Guess ${card.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playSelect();
                  onMakeGuess(card);
                }}
                className="w-full min-h-[32px] py-1 rounded-lg font-black text-[10px] text-pink-200 transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1 cursor-pointer"
                style={{
                  background: 'rgba(236,72,153,0.3)',
                  border: '1px solid rgba(236,72,153,0.5)',
                }}
                title="Make a final guess on this character"
              >
                <Target className="w-3 h-3 shrink-0 stroke-[2.5]" />
                <span>Guess</span>
              </button>
            )}
          </div>
        </div>

        {/* ── BACK OF CARD (Crossed Out / Eliminated) ─────────────────── */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl border flex flex-col items-center justify-between p-2 rotate-y-180 backface-hidden cursor-pointer"
          style={{
            background: 'rgba(10,12,22,0.97)',
            borderColor: 'rgba(239,68,68,0.35)',
            backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(239,68,68,0.18) 0%, transparent 75%)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playCardFlip(false);
            onToggleFlip(card.id);
          }}
        >
          <div className="flex items-center gap-1 text-[9px] font-black text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1.5">
            <X className="w-2.5 h-2.5 stroke-[3]" />
            <span>ELIMINATED</span>
          </div>

          <span className="text-[11px] font-bold text-slate-500 line-through truncate max-w-full px-1 text-center">
            {card.name}
          </span>

          <button
            type="button"
            id={`btn-restore-${card.id}`}
            aria-label={`Restore ${card.name}`}
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playCardFlip(false);
              onToggleFlip(card.id);
            }}
            className="w-full min-h-[32px] py-1.5 rounded-xl font-black text-[10px] text-cyan-300 transition-all hover:scale-[1.03] flex items-center justify-center gap-1 shadow-md cursor-pointer"
            style={{
              background: 'rgba(6,182,212,0.12)',
              border: '1px solid rgba(6,182,212,0.3)',
            }}
            title="Restore character card"
          >
            <RotateCcw className="w-3 h-3 shrink-0" />
            <span>Restore</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
