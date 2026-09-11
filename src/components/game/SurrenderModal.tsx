'use client';

import React from 'react';

interface SurrenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSurrender: () => void;
}

export const SurrenderModal: React.FC<SurrenderModalProps> = ({
  isOpen,
  onClose,
  onConfirmSurrender,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="game-panel w-full max-w-sm rounded-3xl p-6 text-center border border-rose-500/40 shadow-2xl">
        <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Surrender Match?
        </h3>
        <p className="text-slate-400 text-xs mb-6">Your opponent will be declared the match winner immediately.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmSurrender}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30"
          >
            Confirm Surrender
          </button>
        </div>
      </div>
    </div>
  );
};
