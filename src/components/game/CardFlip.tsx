'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CharacterCard } from '@/types/game';
import { soundFx } from '@/lib/audio';
import { EyeOff, Target, Sparkles, RotateCcw } from 'lucide-react';
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
  return (
    <div className="relative group w-full aspect-[3/4.2] perspective-1000 select-none">
      {/* Secret Card Badge */}
      {isSecret && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-xl flex items-center gap-0.5 ring-2 ring-slate-950 whitespace-nowrap">
          <Sparkles className="w-2.5 h-2.5 shrink-0" />
          <span>SECRET</span>
        </div>
      )}

      <motion.div
        className="w-full h-full relative transform-style-3d"
        initial={false}
        animate={{ rotateY: isFlippingDown ? 180 : 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
      >
        {/* ── FRONT OF CARD ───────────────────────────────── */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl overflow-hidden backface-hidden flex flex-col ${
            isSecret
              ? 'ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/25'
              : ''
          }`}
          style={{
            background: 'rgba(14, 22, 44, 0.95)',
            border: isSecret
              ? '1px solid rgba(245,158,11,0.6)'
              : '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Card Photo (takes all available vertical space) */}
          <div className="relative flex-1 overflow-hidden">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 14vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />

            {/* Hover overlay with action buttons */}
            {!isSelectable && (
              <div
                className="absolute inset-0 flex items-end justify-center pb-2 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'linear-gradient(to top, rgba(7,9,15,0.85) 0%, transparent 55%)' }}
              >
                {/* Eliminate button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playCardFlip(true);
                    onToggleFlip(card.id);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[11px] text-amber-300 transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'rgba(245,158,11,0.2)',
                    border: '1px solid rgba(245,158,11,0.35)',
                    backdropFilter: 'blur(4px)',
                  }}
                  title="Eliminate this card"
                >
                  <EyeOff className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">Elim</span>
                </button>

                {/* Guess button */}
                {isGuessable && onMakeGuess && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playSelect();
                      onMakeGuess(card);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[11px] text-pink-300 transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(236,72,153,0.2)',
                      border: '1px solid rgba(236,72,153,0.35)',
                      backdropFilter: 'blur(4px)',
                    }}
                    title="Guess this is opponent's character!"
                  >
                    <Target className="w-3 h-3 shrink-0" />
                    <span className="hidden sm:inline">Guess</span>
                  </button>
                )}
              </div>
            )}

            {/* Selectable overlay */}
            {isSelectable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playSelect();
                  if (onSelectSecret) onSelectSecret(card.id);
                }}
                className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'rgba(245,158,11,0.3)', backdropFilter: 'blur(2px)' }}
              >
                <Sparkles className="w-6 h-6 text-amber-300 mb-1" />
                <span className="text-xs font-black text-white">Select</span>
              </button>
            )}
          </div>

          {/* Card Name Bar */}
          <div
            className="px-2 py-1.5 text-center shrink-0"
            style={{ background: 'rgba(7,9,15,0.85)' }}
          >
            <p className="font-extrabold text-slate-100 text-[11px] sm:text-xs truncate tracking-tight">
              {card.name}
            </p>
            {isSelectable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playSelect();
                  if (onSelectSecret) onSelectSecret(card.id);
                }}
                className="mt-1 w-full py-0.5 rounded-md font-black text-[10px] text-slate-950 transition-all hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}
              >
                Choose
              </button>
            )}
          </div>
        </div>

        {/* ── BACK OF CARD (Eliminated) ─────────────────── */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl border border-slate-800/80 flex flex-col items-center justify-between p-2.5 rotate-y-180 backface-hidden"
          style={{
            background: 'rgba(10,12,22,0.97)',
            backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(239,68,68,0.1) 0%, transparent 75%)',
          }}
        >
          <span className="text-[9px] font-black text-rose-400 bg-rose-500/12 border border-rose-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
            ELIMINATED
          </span>

          <span className="text-[11px] font-bold text-slate-600 line-through truncate max-w-full px-1 text-center">
            {card.name}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playCardFlip(false);
              onToggleFlip(card.id);
            }}
            className="w-full py-1 rounded-lg font-bold text-[10px] text-cyan-400 transition-all hover:scale-[1.03] flex items-center justify-center gap-1"
            style={{
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.25)',
            }}
            title="Restore card"
          >
            <RotateCcw className="w-3 h-3 shrink-0" />
            <span>Restore</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
