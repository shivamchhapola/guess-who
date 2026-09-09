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
        className="w-full h-full relative transform-style-3d cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlippingDown ? 180 : 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
        onClick={() => {
          if (isSelectable) {
            soundFx.playSelect();
            if (onSelectSecret) onSelectSecret(card.id);
          } else if (!isFlippingDown) {
            soundFx.playCardFlip(true);
            onToggleFlip(card.id);
          }
        }}
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
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />

            {/* Hover overlay with action buttons */}
            {!isSelectable && (
              <div
                className="absolute inset-0 flex flex-col justify-end p-2 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'linear-gradient(to top, rgba(7,9,15,0.92) 0%, rgba(7,9,15,0.4) 60%, transparent 100%)' }}
              >
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  {/* Cross Out button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playCardFlip(true);
                      onToggleFlip(card.id);
                    }}
                    className="flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl font-black text-[10px] text-red-300 transition-all hover:scale-105 active:scale-95 shadow-md"
                    style={{
                      background: 'rgba(239,68,68,0.25)',
                      border: '1px solid rgba(239,68,68,0.45)',
                      backdropFilter: 'blur(4px)',
                    }}
                    title="Cross Out (Eliminate) this character"
                  >
                    <X className="w-3 h-3 shrink-0 stroke-[3]" />
                    <span>Cross</span>
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
                      className="flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl font-black text-[10px] text-pink-200 transition-all hover:scale-105 active:scale-95 shadow-md"
                      style={{
                        background: 'rgba(236,72,153,0.3)',
                        border: '1px solid rgba(236,72,153,0.5)',
                        backdropFilter: 'blur(4px)',
                      }}
                      title="Guess this is opponent's secret character!"
                    >
                      <Target className="w-3 h-3 shrink-0 stroke-[2.5]" />
                      <span>Guess</span>
                    </button>
                  )}
                </div>
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
                style={{ background: 'rgba(245,158,11,0.35)', backdropFilter: 'blur(2px)' }}
              >
                <Sparkles className="w-6 h-6 text-amber-300 mb-1" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Select Card</span>
              </button>
            )}
          </div>

          {/* Card Name Bar */}
          <div
            className="px-2 py-1.5 text-center shrink-0"
            style={{ background: 'rgba(7,9,15,0.95)' }}
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

        {/* ── BACK OF CARD (Crossed Out) ─────────────────── */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl border flex flex-col items-center justify-between p-2.5 rotate-y-180 backface-hidden"
          style={{
            background: 'rgba(10,12,22,0.97)',
            borderColor: 'rgba(239,68,68,0.3)',
            backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(239,68,68,0.15) 0%, transparent 75%)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playCardFlip(false);
            onToggleFlip(card.id);
          }}
        >
          <div className="flex items-center gap-1 text-[9px] font-black text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
            <X className="w-2.5 h-2.5 stroke-[3]" />
            <span>CROSSED OUT</span>
          </div>

          <span className="text-[11px] font-bold text-slate-500 line-through truncate max-w-full px-1 text-center">
            {card.name}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playCardFlip(false);
              onToggleFlip(card.id);
            }}
            className="w-full py-1.5 rounded-xl font-black text-[10px] text-cyan-300 transition-all hover:scale-[1.03] flex items-center justify-center gap-1 shadow-md"
            style={{
              background: 'rgba(6,182,212,0.12)',
              border: '1px solid rgba(6,182,212,0.3)',
            }}
            title="Restore card to standing position"
          >
            <RotateCcw className="w-3 h-3 shrink-0" />
            <span>Uncross</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
