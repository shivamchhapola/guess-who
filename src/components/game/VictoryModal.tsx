'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CharacterCard, WinReason } from '@/types/game';
import { Trophy, Frown, RotateCcw, Home, Flag, WifiOff, Clock } from 'lucide-react';
import { soundFx } from '@/lib/audio';
import Image from 'next/image';
import Link from 'next/link';

interface VictoryModalProps {
  isWon: boolean;
  isOpen: boolean;
  winReason?: WinReason | null;
  winnerName?: string | null;
  guessedCard?: CharacterCard | null;
  secretCard: CharacterCard | null;
  opponentSecretCard?: CharacterCard | null;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isWon,
  isOpen,
  winReason,
  winnerName,
  secretCard,
  opponentSecretCard,
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

  const getScenarioText = () => {
    if (isWon) {
      switch (winReason) {
        case 'correct_guess':
          return `Awesome deduction! You correctly guessed the secret character!`;
        case 'opponent_wrong_guess':
          return `Your opponent made an incorrect final guess, giving you the victory!`;
        case 'surrender':
          return `Your opponent surrendered the match!`;
        case 'timeout':
          return `Your opponent ran out of time on their turn!`;
        case 'disconnect':
          return `Your opponent disconnected from the match.`;
        default:
          return `Victory! You won the match!`;
      }
    } else {
      switch (winReason) {
        case 'correct_guess':
          return `${winnerName || 'Opponent'} correctly guessed your secret character.`;
        case 'wrong_guess':
          return `You guessed incorrectly! The guess was not their secret character.`;
        case 'surrender':
          return `You surrendered the match.`;
        case 'timeout':
          return `You ran out of time on your turn.`;
        case 'disconnect':
          return `You were disconnected from the match.`;
        default:
          return `Game over. Better luck next match!`;
      }
    }
  };

  const getHeaderBadgeIcon = () => {
    if (isWon) return <Trophy className="w-10 h-10 animate-bounce text-amber-300" />;
    if (winReason === 'surrender') return <Flag className="w-10 h-10 text-rose-400" />;
    if (winReason === 'timeout') return <Clock className="w-10 h-10 text-amber-400" />;
    if (winReason === 'disconnect') return <WifiOff className="w-10 h-10 text-rose-400" />;
    return <Frown className="w-10 h-10 text-rose-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
      <div
        className={`glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl border ${
          isWon
            ? 'border-cyan-500/50 shadow-cyan-500/20'
            : 'border-rose-500/50 shadow-rose-500/20'
        } animate-in fade-in zoom-in-95 duration-300`}
      >
        {/* Icon Header */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-xl ${
            isWon
              ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/30'
              : 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
          }`}
        >
          {getHeaderBadgeIcon()}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {isWon ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              VICTORY! YOU WIN!
            </span>
          ) : (
            <span className="text-rose-400">GAME OVER</span>
          )}
        </h2>

        <p className="text-slate-300 text-xs sm:text-sm max-w-sm mb-6 font-medium">
          {getScenarioText()}
        </p>

        {/* Side-by-side Card Reveal */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          {/* Your Secret Card */}
          {secretCard && (
            <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                Your Secret
              </span>
              <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border border-amber-500/40 mb-1.5 bg-slate-950">
                <Image
                  src={secretCard.imageUrl}
                  alt={secretCard.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="font-extrabold text-slate-200 text-xs sm:text-sm truncate w-full text-center">
                {secretCard.name}
              </span>
            </div>
          )}

          {/* Opponent Secret Card */}
          {opponentSecretCard && (
            <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2">
                Opponent&apos;s Secret
              </span>
              <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border border-cyan-500/40 mb-1.5 bg-slate-950">
                <Image
                  src={opponentSecretCard.imageUrl}
                  alt={opponentSecretCard.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="font-extrabold text-slate-200 text-xs sm:text-sm truncate w-full text-center">
                {opponentSecretCard.name}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link
            href="/"
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </Link>
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};

