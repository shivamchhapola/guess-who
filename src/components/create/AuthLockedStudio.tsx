'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, Image as ImageIcon, Archive, Share2, LogIn, ArrowRight } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export function AuthLockedStudio() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Central Glassmorphic Lock Panel */}
      <div
        className="game-panel p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden shadow-2xl"
        style={{ border: '1px solid rgba(245, 158, 11, 0.35)', background: 'rgba(15, 23, 42, 0.85)' }}
      >
        {/* Glow Effects */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)' }}
        />

        {/* Lock Icon Badge */}
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10"
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#f59e0b',
          }}
        >
          <Lock className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
        </div>

        {/* Heading & Subtitle */}
        <span className="text-xs font-black uppercase tracking-widest text-amber-400 block mb-2">
          CREATOR STUDIO LOCKED
        </span>
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Log in to <span className="text-amber-400">Make a Set</span> 📸
        </h1>
        <p className="text-slate-300 text-xs sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
          Creating custom decks requires a free account. Upload your photos, pack them in a ZIP, and publish a Guess Who set for your friends or the world.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-left">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Custom Photos</h4>
            <p className="text-[11px] text-slate-400 leading-snug">Upload photo sets of your friends, family, or co-workers.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3">
              <Archive className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">ZIP Unpacking</h4>
            <p className="text-[11px] text-slate-400 leading-snug">Upload a ZIP file of photos to generate a full-card set in seconds.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-3">
              <Share2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Community Sets</h4>
            <p className="text-[11px] text-slate-400 leading-snug">Share your sets publicly with players across the world.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Auto Compress</h4>
            <p className="text-[11px] text-slate-400 leading-snug">Instant client compression ensures fast loading in live games.</p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/login?redirect=/create"
            onClick={() => soundFx.playSelect()}
            className="game-btn-primary py-3.5 px-8 text-sm font-extrabold rounded-2xl inline-flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span>Log In to Continue</span>
          </Link>

          <Link
            href="/auth/login?tab=signup&redirect=/create"
            onClick={() => soundFx.playSelect()}
            className="py-3.5 px-7 rounded-2xl text-xs font-extrabold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span>Sign Up Free</span>
            <ArrowRight className="w-4 h-4 shrink-0 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
