'use client';

import Link from 'next/link';
import { Gamepad2, Globe } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export function GameModeCards() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-14 sm:mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* CARD 1: HOST A GAME */}
        <div
          className="game-panel p-5 sm:p-7 rounded-3xl flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
          style={{
            border: '1px solid rgba(139, 92, 246, 0.3)',
            background: 'rgba(15, 23, 42, 0.75)',
          }}
        >
          <div>
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105"
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#a78bfa',
              }}
            >
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-violet-400 block mb-1">
              Start a Room
            </span>
            <h3
              className="text-xl sm:text-2xl font-black text-white mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Host a Game
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              Create a private room, get a code, invite friends, and choose your favorite deck in the lobby.
            </p>
          </div>

          <Link
            href="/host"
            onClick={() => soundFx.playSelect()}
            className="game-btn-purple text-sm h-12 sm:h-13 py-3 px-5 justify-center rounded-2xl w-full shadow-lg shadow-purple-500/10 flex items-center gap-2 font-bold transition-all duration-200 active:scale-[0.98]"
          >
            <Gamepad2 className="w-4 h-4 shrink-0" />
            <span>Host a Game</span>
          </Link>
        </div>

        {/* CARD 2: PUBLIC LOBBIES */}
        <div
          className="game-panel p-5 sm:p-7 rounded-3xl flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
          style={{
            border: '1px solid rgba(6, 182, 212, 0.3)',
            background: 'rgba(15, 23, 42, 0.75)',
          }}
        >
          <div>
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105"
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#22d3ee',
              }}
            >
              <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 block mb-1">
              Find Players
            </span>
            <h3
              className="text-xl sm:text-2xl font-black text-white mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Public Lobbies
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              Browse active public rooms hosted by other players looking for an opponent right now.
            </p>
          </div>

          <Link
            href="/lobbies"
            onClick={() => soundFx.playSelect()}
            className="h-12 sm:h-13 py-3 px-5 rounded-2xl text-sm font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all duration-200 justify-center flex items-center gap-2 w-full shadow-lg shadow-cyan-500/10 active:scale-[0.98]"
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span>Browse Lobbies</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
