'use client';

import React from 'react';
import { User, Shuffle, Dices } from 'lucide-react';
import { soundFx } from '@/lib/audio';
import {
  AVATAR_STYLES,
  SEED_VARIATIONS,
  generateRandomName,
  generateRandomAvatar,
} from '@/lib/randomIdentity';

interface PlayerProfileSetupProps {
  name: string;
  avatar: string;
  onNameChange: (name: string) => void;
  onAvatarChange: (avatarUrl: string) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  nameError?: string | null;
}

function parseAvatarUrl(url: string): { style: string; seed: string } {
  if (!url || !url.startsWith('http')) {
    return { style: 'avataaars', seed: 'Alex' };
  }
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    const styleIdx = parts.findIndex(p => p === '7.x') + 1;
    const style = (styleIdx > 0 && parts[styleIdx]) ? parts[styleIdx] : 'avataaars';
    const seed = urlObj.searchParams.get('seed') || 'Alex';
    return { style, seed };
  } catch {
    return { style: 'avataaars', seed: 'Alex' };
  }
}

export function PlayerProfileSetup({
  name,
  avatar,
  onNameChange,
  onAvatarChange,
  nameError,
}: PlayerProfileSetupProps) {
  const { style: activeStyle, seed: activeSeed } = parseAvatarUrl(avatar);

  const isMountedRef = React.useRef(false);

  // Load saved preferences on mount if available
  React.useEffect(() => {
    if (isMountedRef.current || typeof window === 'undefined') return;
    isMountedRef.current = true;
    const savedName = localStorage.getItem('guesswho_profile_name');
    const savedAvatar = localStorage.getItem('guesswho_profile_avatar');
    if (savedName && !name) {
      onNameChange(savedName);
    }
    if (savedAvatar && !avatar) {
      onAvatarChange(savedAvatar);
    }
  }, [avatar, name, onAvatarChange, onNameChange]);

  // Save to localStorage when changed
  const handleNameUpdate = (newName: string) => {
    onNameChange(newName);
    if (typeof window !== 'undefined' && newName.trim()) {
      localStorage.setItem('guesswho_profile_name', newName.trim());
    }
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    onAvatarChange(newAvatarUrl);
    if (typeof window !== 'undefined' && newAvatarUrl) {
      localStorage.setItem('guesswho_profile_avatar', newAvatarUrl);
    }
  };

  const currentAvatarUrl = avatar && avatar.startsWith('http')
    ? avatar
    : `https://api.dicebear.com/7.x/${activeStyle}/svg?seed=${activeSeed}`;

  const updateAvatar = (style: string, seed: string) => {
    soundFx.playSelect();
    const newUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    handleAvatarUpdate(newUrl);
  };

  const handleRandomizeAvatar = () => {
    soundFx.playSelect();
    const newAvatar = generateRandomAvatar();
    handleAvatarUpdate(newAvatar);
  };

  const handleRandomizeNickname = () => {
    soundFx.playSelect();
    const current = name.trim();
    let newName = generateRandomName();
    for (let attempts = 0; attempts < 10; attempts++) {
      if (newName !== current) break;
      newName = generateRandomName();
    }
    handleNameUpdate(newName);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar Creator Card */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Avatar Creator
        </label>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar Preview & Shuffle */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/40 flex items-center justify-center p-2 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentAvatarUrl}
                alt="Player Avatar"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <button
              type="button"
              onClick={handleRandomizeAvatar}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all flex items-center gap-1.5"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
          </div>

          {/* Style & Variant Controls */}
          <div className="flex-1 w-full flex flex-col gap-4">
            {/* Style Selector */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                Style
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => updateAvatar(style.id, activeSeed)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                      activeStyle === style.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <span>{style.icon}</span>
                    <span>{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Variations */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                Variant
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {SEED_VARIATIONS.map((seed, idx) => {
                  const seedUrl = `https://api.dicebear.com/7.x/${activeStyle}/svg?seed=${seed}`;
                  const isSelected = activeSeed === seed;
                  return (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => updateAvatar(activeStyle, seed)}
                      className={`aspect-square rounded-xl p-1 border transition-colors flex items-center justify-center ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 shadow-sm shadow-amber-500/30'
                          : 'border-white/10 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                      title={`Variant ${idx + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={seedUrl} alt={`Variant ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nickname Input Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Nickname
          </label>
          <button
            type="button"
            onClick={handleRandomizeNickname}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all flex items-center gap-1.5"
            title="Randomize nickname"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Randomize</span>
          </button>
        </div>

        <div className="relative w-full">
          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => handleNameUpdate(e.target.value)}
            placeholder="Host Player"
            maxLength={20}
            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none transition-all bg-slate-950/80 border ${
              nameError ? 'border-rose-500/80 focus:border-rose-500' : 'border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
            }`}
          />
        </div>
        {nameError && (
          <p className="text-xs font-semibold text-rose-400 mt-1">{nameError}</p>
        )}
      </div>
    </div>
  );
}
