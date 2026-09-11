'use client';

import React from 'react';
import { Lock, Globe, Clock } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export interface HostSettingsFormProps {
  isPublic: boolean;
  onIsPublicChange: (isPublic: boolean) => void;
  hasPassword: boolean;
  onHasPasswordChange: (hasPassword: boolean) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  passwordError?: string | null;
  turnTimerSetting: number;
  onTurnTimerChange: (seconds: number) => void;
}

export function HostSettingsForm({
  isPublic,
  onIsPublicChange,
  hasPassword,
  onHasPasswordChange,
  password,
  onPasswordChange,
  passwordError,
  turnTimerSetting,
  onTurnTimerChange,
}: HostSettingsFormProps) {
  return (
    <section className="game-panel p-6 rounded-3xl border border-white/10">
      <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <span className="text-amber-500 font-extrabold">2.</span> Room Settings
      </h2>

      {/* Vertical Stack of Room Settings */}
      <div className="flex flex-col gap-3">
        {/* Public Lobby Setting Row */}
        <div
          onClick={() => {
            soundFx.playSelect();
            onIsPublicChange(!isPublic);
          }}
          className={`w-full p-4 rounded-2xl cursor-pointer select-none transition-all flex flex-col gap-1 text-left border ${
            isPublic
              ? 'border-cyan-500/40 bg-cyan-500/10'
              : 'border-white/10 bg-slate-950/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2.5">
              <Globe className={`w-4 h-4 ${isPublic ? 'text-cyan-400' : 'text-slate-400'}`} />
              <h3 className="text-sm font-bold text-white">Public Lobby</h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase transition-colors ${
                isPublic ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-slate-500 border border-white/10'
              }`}
            >
              {isPublic ? 'ON' : 'OFF'}
            </span>
          </div>
          <p className="text-xs text-slate-400 pl-6 pointer-events-none">Anyone can find &amp; join your room</p>
        </div>

        {/* Password Protection Setting Row */}
        <div
          onClick={() => {
            soundFx.playSelect();
            onHasPasswordChange(!hasPassword);
          }}
          className={`w-full p-4 rounded-2xl cursor-pointer select-none transition-all flex flex-col gap-3 border ${
            hasPassword
              ? 'border-amber-500/40 bg-amber-500/10'
              : 'border-white/10 bg-slate-950/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between pointer-events-none">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <Lock className={`w-4 h-4 ${hasPassword ? 'text-amber-400' : 'text-slate-400'}`} />
                <h3 className="text-sm font-bold text-white">Password</h3>
              </div>
              <p className="text-xs text-slate-400 pl-6">Require a passcode to join</p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase transition-colors shrink-0 ${
                hasPassword ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-500 border border-white/10'
              }`}
            >
              {hasPassword ? 'ON' : 'OFF'}
            </span>
          </div>

          {hasPassword && (
            <div
              className="pt-3 border-t border-amber-500/20 pl-6 flex flex-col gap-1 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Enter room password..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none bg-slate-950/90 border transition-colors placeholder:text-slate-600 ${
                  passwordError ? 'border-rose-500/80 focus:border-rose-500' : 'border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                }`}
              />
              {passwordError && (
                <p className="text-xs font-semibold text-rose-400 mt-0.5">{passwordError}</p>
              )}
            </div>
          )}
        </div>

        {/* Turn Timer Setting Row */}
        <div className="w-full p-4 rounded-2xl border border-white/10 bg-slate-950/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Turn Timer</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {turnTimerSetting === 0 ? 'Off' : `${turnTimerSetting}s per turn`}
            </span>
          </div>
          <p className="text-xs text-slate-400 pl-6">Set a maximum time limit for each player&apos;s turn</p>
          <div className="grid grid-cols-5 gap-2 pl-6 pt-1">
            {[0, 30, 60, 90, 120].map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  onTurnTimerChange(seconds);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  turnTimerSetting === seconds
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {seconds === 0 ? 'Off' : `${seconds}s`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
