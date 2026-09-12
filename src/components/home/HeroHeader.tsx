'use client';

import { Flame } from 'lucide-react';

export function HeroHeader() {
  return (
    <div className="text-center relative max-w-4xl mx-auto px-4 sm:px-6">
      {/* Feature Badge */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-4 sm:mb-6 shadow-sm max-w-[95vw]"
        style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
        }}
      >
        <Flame className="w-3.5 h-3.5 animate-bounce shrink-0" />
        <span className="truncate">Free · Online Multiplayer · Custom Decks</span>
      </div>

      {/* Hero Title */}
      <h1
        className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] mb-3 sm:mb-4 text-white"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        GuessWhooo?
        <span
          className="block text-amber-400 text-xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mt-1 sm:mt-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          with your friends!
        </span>
      </h1>

      {/* Description */}
      <p className="text-slate-300 text-xs sm:text-base md:text-lg max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
        Pick a ready-made deck or upload custom photos. Play GuessWhooo? online with zero friction.
      </p>
    </div>
  );
}
