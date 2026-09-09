'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Lock,
  Mail,
  Key,
  Sparkles,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Wand2,
  Gamepad2,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { NavHeader } from '@/components/NavHeader';
import { THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0] },
          },
        });
        if (error) throw error;
        setSuccessMsg('Account created successfully! You can now log in.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/create');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during authentication.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      <NavHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* ── Left Side: Creator Showcase ─────────────────── */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider w-fit"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
              <Wand2 className="w-3.5 h-3.5 animate-pulse" />
              <span>GuessWhooo? Creator Studio</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}>
              Design Your Own <br />
              <span className="font-game-title text-amber-400">Custom Guess Who Decks</span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              Log in to save your photo decks, manage public game sets, and publish custom character collections for the community!
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="game-panel p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs mb-1">Custom Photo Decks</h3>
                <p className="text-[11px] text-slate-500">Upload photos of friends &amp; family instantly.</p>
              </div>

              <div className="game-panel p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs mb-1">Community Publish</h3>
                <p className="text-[11px] text-slate-500">Share your sets on the public template finder.</p>
              </div>

              <div className="game-panel p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs mb-1">Cloud Sync</h3>
                <p className="text-[11px] text-slate-500">Save and edit your card decks anytime.</p>
              </div>
            </div>

            {/* Sample Deck Preview Mini Widget */}
            <div className="game-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid grid-cols-2 gap-1 w-14 h-14 rounded-xl overflow-hidden bg-slate-950 p-1 shrink-0">
                  {THE_OFFICE_TEMPLATE.cards.slice(0, 4).map(c => (
                    <div key={c.id} className="relative w-full h-full rounded overflow-hidden">
                      <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">No Login to Play</span>
                  <h4 className="text-sm font-bold text-white">Just want to play a quick match?</h4>
                  <p className="text-xs text-slate-400">Players never need an account to join rooms.</p>
                </div>
              </div>

              <Link
                href="/lobbies"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white shrink-0 flex items-center gap-1 transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Play Now</span>
              </Link>
            </div>
          </div>

          {/* ── Right Side: Creator Auth Form ───────────────── */}
          <div className="lg:col-span-5 w-full">
            <div className="game-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl"
              style={{ border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(13,17,28,0.85)' }}>
              
              {/* Decorative corner glow */}
              <div className="pointer-events-none absolute -top-20 -right-20 w-44 h-44 rounded-full"
                style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.18) 0%, transparent 70%)' }} />

              {/* Form Title Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {mode === 'login' ? 'Creator Sign In' : 'Create Creator Account'}
                  </h2>
                  <p className="text-xs text-slate-400">Access Creator Studio &amp; saved card sets</p>
                </div>
              </div>

              {/* Mode Segmented Control */}
              <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl mb-6"
                style={{ background: 'rgba(7,9,15,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-wider"
                  style={{
                    background: mode === 'login' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                    color: mode === 'login' ? '#000' : '#94a3b8',
                    boxShadow: mode === 'login' ? '0 4px 12px rgba(245,158,11,0.3)' : 'none',
                  }}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-wider"
                  style={{
                    background: mode === 'signup' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                    color: mode === 'signup' ? '#000' : '#94a3b8',
                    boxShadow: mode === 'signup' ? '0 4px 12px rgba(245,158,11,0.3)' : 'none',
                  }}
                >
                  Sign Up
                </button>
              </div>

              {/* Status Notifications */}
              {errorMsg && (
                <div className="p-3.5 mb-6 rounded-2xl text-xs flex items-center gap-2.5 font-semibold"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 mb-6 rounded-2xl text-xs flex items-center gap-2.5 font-semibold"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Creator Handle</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. CardDeckMaster"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold text-white focus:outline-none transition-all"
                        style={{
                          background: 'rgba(7,9,15,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.6)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creator@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold text-white focus:outline-none transition-all"
                      style={{
                        background: 'rgba(7,9,15,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.6)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 rounded-2xl text-sm font-semibold text-white focus:outline-none transition-all"
                      style={{
                        background: 'rgba(7,9,15,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.6)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="game-btn-primary w-full py-4 text-base rounded-2xl justify-center mt-2"
                >
                  <Sparkles className="w-5 h-5 fill-current" />
                  <span>{loading ? 'Processing...' : mode === 'login' ? 'Log In to Studio' : 'Create Account'}</span>
                </button>
              </form>

              {/* Guest Studio Link */}
              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>Continue as Guest Creator (No Login)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="game-panel py-6 text-center text-xs text-slate-500" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        © {new Date().getFullYear()} GuessWhooo?
      </footer>
    </div>
  );
}
