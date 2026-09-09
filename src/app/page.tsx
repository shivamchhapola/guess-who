'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play, Users, Gamepad2, ArrowRight,
  Flame, X, Eye, Globe, PlusCircle,
} from 'lucide-react';
import { NavHeader } from '@/components/NavHeader';
import { ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';
import { CardSetTemplate } from '@/types/game';

/* ─── Template Preview Modal ─────────────────────────────────── */
function TemplatePreviewModal({
  template,
  onClose,
}: {
  template: CardSetTemplate;
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="glass-panel rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-slide-in-up"
        style={{ border: '1px solid rgba(245,158,11,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {template.title}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{template.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {template.tags.map(tag => (
                <span key={tag} className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Characters Grid */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          {template.cards.length} Characters
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
          {template.cards.map(card => (
            <div key={card.id} className="flex flex-col items-center gap-1.5 group">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-300 text-center leading-tight truncate w-full">
                {card.name}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.push(`/play/practice?template=${template.id}`)}
            className="game-btn-primary flex-1 py-3.5 text-base justify-center"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Play Solo Practice</span>
          </button>
          <Link
            href={`/host?template=${template.id}`}
            className="game-btn-purple flex-1 py-3.5 text-base justify-center"
          >
            <Users className="w-5 h-5" />
            <span>Host Multiplayer Room</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Landing Page ───────────────────────────────────────────── */
export default function Home() {
  const [roomCode, setRoomCode] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CardSetTemplate | null>(null);
  const router = useRouter();

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (code.length >= 4) {
      router.push(`/play/${code}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader activePage="home" />

      <main className="flex-1">
        {/* ── Hero Section ─────────────────────────────────── */}
        <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
          {/* Decorative glows */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div style={{ position: 'absolute', top: '-10%', left: '15%', width: '45%', height: '70%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '10%', right: '15%', width: '40%', height: '60%', background: 'radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
              <Flame className="w-3.5 h-3.5 animate-bounce" />
              <span>Free · No Login Required · Online Multiplayer</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-4 text-white"
              style={{ fontFamily: 'Outfit, sans-serif' }}>
              Guess Whooo?
              <span className="block font-game-title mt-1">
                with your friends !
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Pick a ready-made deck or upload custom photos. Play Guess Who online with zero friction.
            </p>

            {/* ── TWO PRIMARY ENTRY PATHS ─────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left max-w-3xl mx-auto mb-12">
              
              {/* PATH 1: HOST A GAME */}
              <div 
                className="game-panel p-6 sm:p-8 rounded-3xl flex flex-col justify-between group transition-all"
                style={{ border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(15, 23, 42, 0.75)' }}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-violet-400 block mb-1">
                    Start a New Room
                  </span>
                  <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Host a Game
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Create a private room, get a code, invite friends, and choose your favorite deck in the lobby.
                  </p>
                </div>

                <Link
                  href="/host"
                  className="game-btn-purple text-base py-3.5 px-6 justify-center rounded-2xl w-full shadow-lg shadow-purple-500/10 flex items-center gap-2"
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>Host a Game</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {/* PATH 2: JOIN A GAME (Fast Path) */}
              <div 
                className="game-panel p-6 sm:p-8 rounded-3xl flex flex-col justify-between group transition-all"
                style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(15, 23, 42, 0.75)' }}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">
                    Have a Code?
                  </span>
                  <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Join a Game
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Enter your 6-letter room code below to instantly jump into a match.
                  </p>
                </div>

                <form onSubmit={handleJoinRoom} className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={roomCode}
                      onChange={e => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="ROOM CODE"
                      maxLength={6}
                      className="flex-1 px-4 py-3.5 rounded-2xl text-center text-lg font-mono font-black tracking-widest uppercase focus:outline-none"
                      style={{
                        background: 'rgba(7,9,15,0.9)',
                        border: '2px solid rgba(71,85,105,0.8)',
                        color: '#f59e0b',
                        caretColor: '#f59e0b',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.6)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(71,85,105,0.8)')}
                    />
                    <button type="submit" className="game-btn-primary px-6 py-3.5 text-sm rounded-2xl shrink-0 flex items-center gap-1.5">
                      <span>Join</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* ── SUPPORTING NAVIGATION BAR ───────────────────────────── */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-white/10 max-w-3xl mx-auto">
              <Link
                href="/templates"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Browse Sets</span>
              </Link>
              <Link
                href="/create"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <PlusCircle className="w-4 h-4 text-purple-400" />
                <span>Create Custom Set</span>
              </Link>
              <Link
                href="/lobbies"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Public Lobbies</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Featured Sets Preview Section ────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Popular Character Decks
                </h2>
                <p className="text-slate-400 text-sm mt-1">Preview character cards before hosting or playing.</p>
              </div>
              <Link href="/templates"
                className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 shrink-0">
                View All Decks <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {ALL_POPULAR_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className="game-panel p-5 rounded-3xl text-left group transition-all w-full"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                >
                  {/* Photo Grid Preview */}
                  <div className="grid grid-cols-4 gap-1.5 rounded-2xl overflow-hidden mb-4"
                    style={{ background: '#07090f', aspectRatio: '2/1', padding: '0.375rem' }}>
                    {tpl.cards.slice(0, 8).map(c => (
                      <div key={c.id} className="relative rounded-lg overflow-hidden" style={{ background: '#0f172a' }}>
                        <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-black text-white mb-1 group-hover:text-amber-400 transition-colors"
                    style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {tpl.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-2 mb-4">{tpl.description}</p>

                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xs font-semibold text-slate-500">
                      {tpl.cards.length} Characters
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                      <Eye className="w-3.5 h-3.5" />
                      Preview Cards
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="game-panel py-8 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Branding */}
          <div className="text-center sm:text-left">
            <p className="text-sm font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              GuessWho<span style={{ color: '#f59e0b' }}>Party!</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">© {new Date().getFullYear()} · Free custom Guess Who for everyone.</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/shivamchhapola/guess-who"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: '#94a3b8' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.11)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
                (e.currentTarget as HTMLElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)';
                (e.currentTarget as HTMLElement).style.color = '#94a3b8';
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>

            <a
              href="https://www.instagram.com/shiv_chhapola"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: '#94a3b8' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(236,72,153,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(236,72,153,0.25)';
                (e.currentTarget as HTMLElement).style.color = '#f472b6';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)';
                (e.currentTarget as HTMLElement).style.color = '#94a3b8';
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              <span className="hidden sm:inline">Instagram</span>
            </a>

            <a
              href="https://shivamchhapola.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: '#94a3b8' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.25)';
                (e.currentTarget as HTMLElement).style.color = '#a78bfa';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)';
                (e.currentTarget as HTMLElement).style.color = '#94a3b8';
              }}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
