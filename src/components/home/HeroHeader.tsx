'use client';

import { Flame } from 'lucide-react';

export function HeroHeader() {
  return (
    <div className="text-center relative max-w-4xl mx-auto px-4 sm:px-6">
      {/* Top Feature Badge */}
      <div
        className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider mb-5 sm:mb-6 shadow-sm"
        style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
        }}
      >
        <Flame className="w-3.5 h-3.5 animate-bounce shrink-0" />
        <span className="truncate">Free · No Login Required · Online Multiplayer</span>
      </div>

      {/* Hero Title */}
      <h1
        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-4 text-white"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        GuessWhooo?
        <span className="block font-game-title text-amber-400 mt-1 sm:mt-2 text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-normal">
          with your friends !
        </span>
      </h1>

      {/* Description */}
      <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
        Pick a ready-made deck or upload custom photos. Play GuessWhooo? online with zero friction.
      </p>
    </div>
  );
}
