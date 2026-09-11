'use client';

import React from 'react';
import { CharacterCard } from '@/types/game';
import { Target, X, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface GuessModalProps {
  card: CharacterCard | null;
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirmGuess?: (card: CharacterCard) => void;
  onConfirm?: (card: CharacterCard) => void;
}

export const GuessModal: React.FC<GuessModalProps> = ({
  card,
  isOpen,
  onClose,
  onCancel,
  onConfirmGuess,
  onConfirm,
}) => {
  const handleClose = onCancel || onClose || (() => {});
  const handleConfirm = onConfirm || onConfirmGuess || (() => {});

  if (!isOpen || !card) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guess-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="glass-panel border border-pink-500/30 w-full max-w-md p-6 rounded-3xl flex flex-col items-center text-center shadow-2xl shadow-pink-500/10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-pink-400 font-bold text-sm uppercase tracking-wider">
            <Target className="w-5 h-5" />
            <span id="guess-modal-title">Final Guess Declaration</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Portrait */}
        <div className="relative w-32 h-40 rounded-2xl overflow-hidden border-2 border-pink-500/50 shadow-xl mb-4 bg-slate-900">
          <Image
            src={card.imageUrl}
            alt={card.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <h3 className="text-2xl font-black text-slate-100 mb-1">
          {card.name}
        </h3>
        <p className="text-slate-400 text-xs mb-6">
          Are you sure you want to guess <span className="font-bold text-slate-200">{card.name}</span> as your opponent&apos;s secret character?
        </p>

        <div className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-300 text-xs mb-6 text-left">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>If correct, you win immediately! If incorrect, you lose the match.</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-xl glass-card font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleConfirm(card)}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 font-bold text-white shadow-lg shadow-pink-500/25 transition-all hover:scale-105"
          >
            Confirm Guess
          </button>
        </div>
      </div>
    </div>
  );
};
