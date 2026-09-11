'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface RoomPasswordGateProps {
  roomCode: string;
  inputPassword: string;
  setInputPassword: (val: string) => void;
  passError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const RoomPasswordGate: React.FC<RoomPasswordGateProps> = ({
  roomCode,
  inputPassword,
  setInputPassword,
  passError,
  onSubmit,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-20">
      <div className="game-panel p-8 rounded-3xl text-center shadow-2xl border border-amber-500/30">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Password Protected
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Enter the passcode for Room <span className="text-amber-400 font-mono font-black">#{roomCode}</span>
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            required
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Room Passcode"
            className="w-full px-4 py-3 rounded-xl text-sm text-center text-white bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none"
          />
          {passError && <p className="text-rose-400 text-xs font-semibold">{passError}</p>}
          <button type="submit" className="game-btn-primary w-full justify-center py-3">
            Unlock Room
          </button>
        </form>
      </div>
    </div>
  );
};
