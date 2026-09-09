'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, Key, Sparkles, User, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavHeader } from '@/components/NavHeader';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md game-panel p-8 rounded-3xl relative overflow-hidden"
          style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
          {/* Top glow */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-48 h-48 rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 70%)' }} />

          {/* Header Info */}
          <div className="flex flex-col items-center text-center mb-8 relative">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-105"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {mode === 'login' ? 'Creator Sign In' : 'Create Account'}
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
              Playing GuessWho requires <span className="text-amber-400 font-bold">no account</span>. Login is only needed for saving custom card sets.
            </p>
          </div>

          {/* Switch Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl mb-6"
            style={{ background: 'rgba(7,9,15,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
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

          {/* Messages */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="CreatorHandle"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold text-white focus:outline-none transition-all"
                    style={{
                      background: 'rgba(7,9,15,0.9)',
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
                    background: 'rgba(7,9,15,0.9)',
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
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold text-white focus:outline-none transition-all"
                  style={{
                    background: 'rgba(7,9,15,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
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

          {/* Guest Shortcut */}
          <div className="mt-8 pt-5 border-t border-white/10 text-center">
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Continue as Guest Creator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="game-panel py-6 text-center text-xs text-slate-500" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        © {new Date().getFullYear()} GuessWhoParty!
      </footer>
    </div>
  );
}
