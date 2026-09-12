'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Gamepad2, UploadCloud, Users, LogIn, Menu, X, Tv } from 'lucide-react';

interface NavHeaderProps {
  /** Accent color for the active/current page indicator */
  activePage?: 'home' | 'templates' | 'create' | 'host' | 'lobbies' | 'play';
}

export function NavHeader({ activePage }: NavHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

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

              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-slate-300 bg-slate-800/80 border border-slate-700/70 hover:text-white transition-all min-h-[44px]"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Log In</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
