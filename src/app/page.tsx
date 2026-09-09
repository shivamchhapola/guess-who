'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play, UploadCloud, Users, Gamepad2, ArrowRight,
  Flame, X, Eye, Globe,
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
              <span className="text-[11px] font-semibold text-slate-300 text-center leading-tight truncate w-full text-center">
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
        <section className="relative overflow-hidden">
          {/* Decorative glows */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '45%', height: '70%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '40%', height: '60%', background: 'radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24 text-center relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-8"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
              <Flame className="w-3.5 h-3.5 animate-bounce" />
              <span>Free · No Login To Play · Multiplayer</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-4 text-white"
              style={{ fontFamily: 'Outfit, sans-serif' }}>
              Guess Who
              <span className="block font-game-title mt-1">
                with your friends
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Upload your own photos or pick a ready-made set. Create a room, share the code, and start guessing.
            </p>

            {/* Join Room Form */}
            <div className="max-w-xl mx-auto mb-6">
              <form onSubmit={handleJoinRoom} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ENTER ROOM CODE"
                  maxLength={6}
                  className="flex-1 px-5 py-4 rounded-2xl text-center text-xl font-mono font-black tracking-widest uppercase focus:outline-none"
                  style={{
                    background: 'rgba(7,9,15,0.9)',
                    border: '2px solid rgba(71,85,105,0.8)',
                    color: '#f59e0b',
                    caretColor: '#f59e0b',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(71,85,105,0.8)')}
                />
                <button type="submit" className="game-btn-primary px-8 py-4 text-base rounded-2xl shrink-0">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Join Game</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ── Action Cards ─────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-20">
            {/* Upload Photos */}
            <div className="game-panel p-6 rounded-3xl flex flex-col justify-between group cursor-pointer"
              style={{ border: '1px solid rgba(245,158,11,0.2)' }}
              onClick={() => router.push('/create')}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Upload Your Photos
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Drag &amp; drop photos of your friends, family, or faves. We turn them into a playable game instantly — no setup needed.
                </p>
              </div>
              <span className="game-btn-primary text-sm py-3 justify-center">
                <span>Make Photo Game</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>

            {/* Host Room */}
            <div className="game-panel p-6 rounded-3xl flex flex-col justify-between group cursor-pointer"
              style={{ border: '1px solid rgba(139,92,246,0.2)' }}
              onClick={() => router.push('/host')}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}>
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Host a Room
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Create a private room, get a 6-letter code, and share it with your friend. Play over a call — no extra chat app needed.
                </p>
              </div>
              <span className="game-btn-purple text-sm py-3 justify-center">
                <span>Create Room</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>

            {/* Browse Lobbies */}
            <div className="game-panel p-6 rounded-3xl flex flex-col justify-between group cursor-pointer sm:col-span-2 md:col-span-1"
              style={{ border: '1px solid rgba(6,182,212,0.2)' }}
              onClick={() => router.push('/lobbies')}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#22d3ee' }}>
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Join Public Lobby
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  See all open game rooms and jump into a match instantly. No invite needed — just pick an open lobby and play.
                </p>
              </div>
              <span className="flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-2xl transition-all group-hover:text-white"
                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22d3ee' }}>
                <span>Browse Lobbies</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* ── Popular Sets ────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Ready-Made Game Sets
                </h2>
                <p className="text-slate-400 text-sm mt-1">Click any set to preview all characters, then play!</p>
              </div>
              <Link href="/templates"
                className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 shrink-0">
                All Sets <ArrowRight className="w-4 h-4" />
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
                      Preview All
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
            {/* GitHub */}
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
              {/* GitHub SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {/* Instagram */}
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

            {/* Portfolio */}
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
