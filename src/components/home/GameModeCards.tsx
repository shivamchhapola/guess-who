'use client';

import Link from 'next/link';
import { Gamepad2, Globe, ArrowRight, ShieldCheck, Users, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export function GameModeCards() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
      <div className="text-center mb-6">
        <h2
          className="text-xl sm:text-2xl font-black text-white"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          More Ways to Play
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Create your own match room or match with players online
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* CARD 1: HOST A GAME */}
        <div
          className="game-panel p-6 sm:p-7 rounded-3xl flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
          style={{
            border: '1px solid rgba(139, 92, 246, 0.3)',
            background: 'rgba(15, 23, 42, 0.75)',
          }}
        >
          {/* Subtle violet top accent gradient */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40"
            style={{ background: '#8b5cf6' }}
          />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#a78bfa',
                }}
              >
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full text-violet-300 bg-violet-500/10 border border-violet-500/20">
                <Sparkles className="w-3 h-3" /> Custom Setup
              </span>
            </div>

            <span className="text-[11px] font-extrabold uppercase tracking-widest text-violet-400 block mb-1">
              Start a Room
            </span>
            <h3
              className="text-2xl font-black text-white mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Host a Game
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              Create a private room, get an invite code, set password protection, and pick any custom or popular character deck.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mb-6 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800">
                <ShieldCheck className="w-3 h-3 text-violet-400" /> Passcode Lock
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800">
                <Users className="w-3 h-3 text-violet-400" /> Up to 2 Players
              </span>
            </div>
          </div>

          <Link
            href="/host"
            onClick={() => soundFx.playSelect()}
            className="game-btn-purple text-sm py-3.5 px-5 justify-center rounded-2xl w-full shadow-lg shadow-purple-500/10 flex items-center gap-2 font-bold transition-all duration-200 active:scale-[0.98]"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Host a Game</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>
        </div>

        {/* CARD 2: PUBLIC LOBBIES */}
        <div
          className="game-panel p-6 sm:p-7 rounded-3xl flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
          style={{
            border: '1px solid rgba(6, 182, 212, 0.3)',
            background: 'rgba(15, 23, 42, 0.75)',
          }}
        >
          {/* Subtle cyan top accent gradient */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40"
            style={{ background: '#06b6d4' }}
          />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#22d3ee',
                }}
              >
                <Globe className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Live Matchmaking
              </span>
            </div>

            <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 block mb-1">
              Find Players
            </span>
            <h3
              className="text-2xl font-black text-white mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Public Lobbies
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              Browse active public rooms hosted by other players online looking for an opponent right now.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mb-6 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800">
                <Globe className="w-3 h-3 text-cyan-400" /> Realtime Lobbies
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Match
              </span>
            </div>
          </div>

          <Link
            href="/lobbies"
            onClick={() => soundFx.playSelect()}
            className="py-3.5 px-5 rounded-2xl text-sm font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all duration-200 justify-center flex items-center gap-2 w-full shadow-lg shadow-cyan-500/10 active:scale-[0.98]"
          >
            <Globe className="w-4 h-4" />
            <span>Browse Lobbies</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
}
