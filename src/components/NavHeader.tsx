'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Gamepad2, UploadCloud, Users, LogIn, LogOut, User as UserIcon, Menu, X, Tv } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface NavHeaderProps {
  /** Accent color for the active/current page indicator */
  activePage?: 'home' | 'templates' | 'create' | 'host' | 'lobbies' | 'play';
}

export function NavHeader({ activePage }: NavHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Reuses the hoisted supabase ref — no redundant client creation
  const handleLogOut = async () => {
    await supabaseRef.current.auth.signOut();
    // Do NOT manually setUser(null) — onAuthStateChange fires and does it
  };

  const displayName =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Player';

  const navLinks = [
    { href: '/templates', label: 'Browse Sets', icon: Tv, page: 'templates' },
    { href: '/lobbies', label: 'Join Lobby', icon: Users, page: 'lobbies' },
    { href: '/host', label: 'Host Game', icon: Gamepad2, page: 'host' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        width: '100%',
        background: 'rgba(7, 9, 15, 0.95)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 shadow-lg group-hover:scale-105 transition-transform shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}
          >
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Guess<span style={{ color: '#f59e0b' }}>Whooo?</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon, page }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                color: activePage === page ? '#f59e0b' : '#94a3b8',
                background: activePage === page ? 'rgba(245,158,11,0.1)' : 'transparent',
              }}
              onMouseEnter={e => {
                if (activePage !== page) {
                  (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={e => {
                if (activePage !== page) {
                  (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            href="/create"
            className="game-btn-primary text-sm px-4 py-2"
            style={{ borderRadius: '0.75rem' }}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Make Set</span>
          </Link>

          {authLoading ? (
            /* Skeleton pill prevents layout shift while auth resolves */
            <div className="w-24 h-7 rounded-xl bg-slate-800/60 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="max-w-[120px] truncate">{displayName}</span>
              </div>
              <button
                type="button"
                onClick={handleLogOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer hover:bg-red-500/10"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all"
              style={{ color: '#64748b' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#64748b'}
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button (Single control on mobile header) */}
        <button
          type="button"
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            background: 'rgba(7, 9, 15, 0.98)',
            padding: '0.875rem 1rem 1.25rem',
            boxShadow: '0 12px 24px rgba(0,0,0,0.6)',
          }}
        >
          <div className="flex flex-col gap-1.5">
            {navLinks.map(({ href, label, icon: Icon, page }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all min-h-[44px]"
                style={{
                  color: activePage === page ? '#f59e0b' : '#cbd5e1',
                  background: activePage === page ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                  border: activePage === page ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
                }}
              >
                <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{label}</span>
              </Link>
            ))}

            <div className="pt-2.5 mt-1 border-t flex flex-col gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <Link
                href="/create"
                onClick={() => setMobileOpen(false)}
                className="game-btn-primary w-full justify-center text-sm min-h-[44px]"
                style={{ borderRadius: '0.875rem', padding: '0.75rem 1rem' }}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Make Custom Deck</span>
              </Link>

              {user ? (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/80 border border-amber-500/20 text-xs font-bold text-slate-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <UserIcon className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{displayName}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-extrabold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 shrink-0">
                      Logged In
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogOut();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all min-h-[44px] cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-slate-300 bg-slate-800/80 border border-slate-700/70 hover:text-white transition-all min-h-[44px]"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Log In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
