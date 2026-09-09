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
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          width: '100%',
          background: 'rgba(7, 9, 15, 0.97)',
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
            <span className="text-lg font-black tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Guess<span style={{ color: '#f59e0b' }}>Whooo?</span>
            </span>
          </Link>

          {/* Desktop Nav */}
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

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div
            className="md:hidden border-t"
            style={{
              borderColor: 'rgba(255,255,255,0.06)',
              background: 'rgba(7, 9, 15, 0.99)',
              padding: '0.75rem 1rem 1rem',
            }}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon, page }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    color: activePage === page ? '#f59e0b' : '#94a3b8',
                    background: activePage === page ? 'rgba(245,158,11,0.08)' : 'transparent',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <div className="pt-2 mt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <Link
                  href="/create"
                  onClick={() => setMobileOpen(false)}
                  className="game-btn-primary w-full justify-center mt-2"
                  style={{ borderRadius: '0.875rem', padding: '0.75rem 1rem' }}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Make Set from Photos</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
