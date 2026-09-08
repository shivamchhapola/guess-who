'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CharacterCard } from '@/types/game';
import { Trophy, Frown, RotateCcw, Home } from 'lucide-react';
import { soundFx } from '@/lib/audio';
import Image from 'next/image';
import Link from 'next/link';

interface VictoryModalProps {
  isWon: boolean;
  isOpen: boolean;
  secretCard: CharacterCard | null;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isWon,
  isOpen,
  secretCard,
  onPlayAgain,
}) => {
  useEffect(() => {
    if (isOpen && isWon) {
      soundFx.playVictory();
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'],
      });
    } else if (isOpen && !isWon) {
      soundFx.playDefeat();
    }
  }, [isOpen, isWon]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
      <div
        className={`glass-panel w-full max-w-lg p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl border ${
          isWon
            ? 'border-cyan-500/50 shadow-cyan-500/20'
            : 'border-rose-500/50 shadow-rose-500/20'
        } animate-in fade-in zoom-in-95 duration-300`}
      >
        {/* Icon Header */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${
            isWon
              ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/30'
              : 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
          }`}
        >
          {isWon ? (
            <Trophy className="w-10 h-10 animate-bounce" />
          ) : (
            <Frown className="w-10 h-10" />
          )}
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-2">
          {isWon ? (
            <span>VICTORY! YOU GUESSED IT!</span>
          ) : (
            <span>GAME OVER</span>
          )}
        </h2>

        <p className="text-slate-400 text-sm max-w-xs mb-6">
          {isWon
            ? `Fantastic deduction! You correctly guessed the secret character.`
            : `That was not the secret character. Better luck next time!`}
        </p>

        {secretCard && (
          <div className="flex flex-col items-center mb-6 p-4 rounded-2xl glass-card border border-white/10 w-full max-w-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              The Secret Character Was
            </span>
            <div className="relative w-24 h-28 rounded-xl overflow-hidden border border-white/20 mb-2 bg-slate-900">
              <Image
                src={secretCard.imageUrl}
                alt={secretCard.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="font-bold text-slate-100 text-lg">{secretCard.name}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link
            href="/"
            className="w-full sm:flex-1 py-3 px-5 rounded-xl glass-card font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-white gradient-btn flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
