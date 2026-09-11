'use client';

import React from 'react';
import { Lock, Users } from 'lucide-react';
import { PlayerProfileSetup } from '../PlayerProfileSetup';

interface JoinIdentityGateProps {
  joinNickname: string;
  selectedAvatar: string;
  setJoinNickname: (val: string) => void;
  setSelectedAvatar: (val: string) => void;
  requiredPassword?: string | null;
  inputPassword: string;
  setInputPassword: (val: string) => void;
  passError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const JoinIdentityGate: React.FC<JoinIdentityGateProps> = ({
  joinNickname,
  selectedAvatar,
  setJoinNickname,
  setSelectedAvatar,
  requiredPassword,
  inputPassword,
  setInputPassword,
  passError,
  onSubmit,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-12">
      <div className="game-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-amber-500/30">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your Player Profile
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Choose your nickname and avatar before entering the game room.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <PlayerProfileSetup
            name={joinNickname}
            avatar={selectedAvatar}
            onNameChange={setJoinNickname}
            onAvatarChange={setSelectedAvatar}
            compact={false}
          />

          {requiredPassword && (
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Room Passcode Required
              </label>
              <input
                type="password"
                required
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="Enter room passcode"
                className="w-full px-4 py-3 rounded-2xl text-sm font-bold text-white bg-slate-950 border border-amber-500/40 focus:border-amber-400 focus:outline-none"
              />
              {passError && (
                <p className="text-rose-400 text-xs font-semibold mt-1.5">{passError}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="game-btn-primary w-full py-4 text-base rounded-2xl justify-center shadow-lg shadow-amber-500/20 font-bold flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            <span>Enter Room</span>
          </button>
        </form>
      </div>
    </div>
  );
};
