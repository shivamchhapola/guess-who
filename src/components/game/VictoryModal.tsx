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
  guessedCard,
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

  let title = isWon ? 'VICTORY!' : 'GAME OVER';
  let description = isWon
    ? 'Fantastic deduction! You won the match.'
    : 'Better luck next time!';
  let IconComponent = isWon ? Trophy : Frown;

  if (isWon) {
    switch (winReason) {
      case 'correct_guess':
        title = 'VICTORY! YOU GUESSED IT!';
        description = `Fantastic deduction! You correctly identified your opponent's secret character${guessedCard ? ` (${guessedCard.name})` : ''}.`;
        break;
      case 'opponent_wrong_guess':
        title = 'VICTORY BY FORFEIT!';
        description = `Your opponent made an incorrect final guess and forfeited the match!`;
        break;
      case 'surrender':
        title = 'VICTORY BY SURRENDER!';
        description = `Your opponent surrendered the match. You win!`;
        IconComponent = Trophy;
        break;
      case 'disconnect':
        title = 'VICTORY BY DISCONNECT!';
        description = `Your opponent disconnected from the match. You win!`;
        IconComponent = WifiOff;
        break;
      case 'timeout':
        title = 'VICTORY BY TIMEOUT!';
        description = `Your opponent ran out of match time. You win!`;
        IconComponent = Clock;
        break;
      default:
        title = 'VICTORY! YOU WON!';
        description = 'Congratulations on winning the match!';
        break;
    }
  } else {
    switch (winReason) {
      case 'wrong_guess':
        title = 'INCORRECT GUESS — DEFEAT';
        description = `You guessed "${guessedCard?.name || 'a character'}", but that was NOT your opponent's secret character! In Guess Who, an incorrect final guess results in an immediate loss.`;
        IconComponent = Frown;
        break;
      case 'correct_guess':
        title = 'GAME OVER — DEFEAT';
        description = `Your opponent correctly identified your secret character!`;
        IconComponent = Frown;
        break;
      case 'surrender':
        title = 'MATCH FORFEITED';
        description = `You surrendered the match.`;
        IconComponent = Flag;
        break;
      case 'disconnect':
        title = 'DISCONNECTED';
        description = `Match ended due to network disconnection.`;
        IconComponent = WifiOff;
        break;
      case 'timeout':
        title = 'TIME OUT — DEFEAT';
        description = `You ran out of match time!`;
        IconComponent = Clock;
        break;
      default:
        title = 'GAME OVER';
        description = 'Better luck in the next round!';
        break;
    }
  }

  const targetCard = opponentSecretCard || (isWon && guessedCard ? guessedCard : null);

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
          <IconComponent className={`w-10 h-10 ${isWon ? 'animate-bounce' : ''}`} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-2 leading-tight">
          {title}
        </h2>

        <p className="text-slate-300 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
          {description}
        </p>

        {/* Revealed Secret Cards Display */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 max-w-sm">
          {/* Opponent's Secret Character */}
          {targetCard && (
            <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mb-1.5 truncate max-w-full">
                Opponent's Character
              </span>
              <div className="relative w-20 h-24 rounded-xl overflow-hidden border border-cyan-500/40 mb-1 bg-slate-950">
                <Image
                  src={targetCard.imageUrl}
                  alt={targetCard.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="font-bold text-white text-xs truncate max-w-full">{targetCard.name}</span>
            </div>
          )}

          {/* Your Secret Character */}
          {secretCard && (
            <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-1.5 truncate max-w-full">
                Your Character
              </span>
              <div className="relative w-20 h-24 rounded-xl overflow-hidden border border-amber-500/40 mb-1 bg-slate-950">
                <Image
                  src={secretCard.imageUrl}
                  alt={secretCard.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="font-bold text-white text-xs truncate max-w-full">{secretCard.name}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link
            href="/"
            className="w-full sm:flex-1 py-3 px-5 rounded-xl glass-card font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors border border-white/10"
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
