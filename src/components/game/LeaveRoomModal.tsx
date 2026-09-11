'use client';

import React from 'react';

interface LeaveRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLeave: () => void;
}

export const LeaveRoomModal: React.FC<LeaveRoomModalProps> = ({
  isOpen,
  onClose,
  onConfirmLeave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="game-panel w-full max-w-sm rounded-3xl p-6 text-center border border-slate-700 shadow-2xl">
        <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Leave Match?
        </h3>
        <p className="text-slate-400 text-xs mb-6">Are you sure you want to exit to the main menu?</p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700"
          >
            Stay in Match
          </button>
          <button
            type="button"
            onClick={onConfirmLeave}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20"
          >
            Leave Match
          </button>
        </div>
      </div>
    </div>
  );
};
