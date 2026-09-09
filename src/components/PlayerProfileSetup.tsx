'use client';

import React from 'react';
import { User } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export const AVATAR_EMOJIS = ['👑', '🎮', '🦊', '🚀', '⚡', '🎯', '👾', '🦄', '🍿', '🎸', '🎨', '🔥'];

interface PlayerProfileSetupProps {
  name: string;
  avatar: string;
  onNameChange: (name: string) => void;
  onAvatarChange: (avatar: string) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function PlayerProfileSetup({
  name,
  avatar,
  onNameChange,
  onAvatarChange,
  title,
  subtitle,
  compact = false,
}: PlayerProfileSetupProps) {
  return (
    <div className="flex flex-col gap-4">
      {title && (
        <div>
          <h3 className="text-lg font-extrabold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {title}
          </h3>
          {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className={`flex flex-col ${compact ? 'sm:flex-row' : ''} gap-4 items-stretch sm:items-center`}>
        {/* Avatar Selector */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Your Avatar
          </span>
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-white/10 overflow-x-auto max-w-full">
            {AVATAR_EMOJIS.map((emoji) => {
              const isSelected = avatar === emoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    onAvatarChange(emoji);
                  }}
                  className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-black font-bold scale-105 shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                      : 'hover:bg-white/10 text-white opacity-80 hover:opacity-100'
                  }`}
                  title={`Select ${emoji} avatar`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* Player Nickname Input */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Your Nickname
          </span>
          <div className="relative w-full">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter your nickname..."
              maxLength={20}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none transition-all bg-slate-950/80 border border-white/10 focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
