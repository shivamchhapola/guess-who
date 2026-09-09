'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CardSetTemplate } from '@/types/game';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES, THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import {
  Lock,
  Globe,
  RefreshCw,
  Play,
  Check,
  Copy,
  User,
  Layers,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { NavHeader } from '@/components/NavHeader';
import { soundFx } from '@/lib/audio';

const AVATAR_EMOJIS = ['👑', '🎮', '🦊', '🚀', '⚡', '🎯', '👾', '🦄'];

function generateRandomCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function HostRoomPage() {
  const [roomCode, setRoomCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(THE_OFFICE_TEMPLATE.id);
  const [templates, setTemplates] = useState<CardSetTemplate[]>([
    THE_OFFICE_TEMPLATE,
    ...ALL_POPULAR_TEMPLATES.filter((t) => t.id !== THE_OFFICE_TEMPLATE.id),
    CLASSIC_GUESS_WHO_TEMPLATE,
  ]);

  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  const [hostName, setHostName] = useState<string>('Host Player');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('👑');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const getUniqueRoomCode = useCallback(async (): Promise<string> => {
    let code = generateRandomCode(6);
    try {
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase
          .from('game_rooms')
          .select('code')
          .eq('code', code)
          .maybeSingle();

        if (!data) {
          return code;
        }
        code = generateRandomCode(6);
      }
    } catch {
      // Quiet fallback
    }
    return code;
  }, [supabase]);

  useEffect(() => {
    getUniqueRoomCode().then((code) => setRoomCode(code));

    async function fetchTemplates() {
      try {
        const { data: dbTemplates } = await supabase
          .from('templates')
          .select('*, cards(*)')
          .eq('is_public', true);

        if (dbTemplates && dbTemplates.length > 0) {
          const formatted: CardSetTemplate[] = dbTemplates.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            creatorName: t.creator_name || 'Community Creator',
            isPublic: t.is_public,
            tags: t.tags || ['Custom'],
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            cards: (t.cards || []).map(
              (c: { id: string; name: string; image_url: string; attributes: Record<string, unknown> }) => ({
                id: c.id,
                name: c.name,
                imageUrl: c.image_url,
                attributes: c.attributes || {},
              })
            ),
          }));

          setTemplates((prev) => [
            ...prev,
            ...formatted.filter((ft) => !prev.some((pt) => pt.id === ft.id)),
          ]);
        }
      } catch (err) {
        console.warn('Could not fetch custom templates:', err);
      }
    }
    fetchTemplates();
  }, [getUniqueRoomCode, supabase]);

  const handleRegenerateCode = async () => {
    soundFx.playSelect();
    const code = await getUniqueRoomCode();
    setRoomCode(code);
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    soundFx.playSelect();
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInviteLink = () => {
    if (!roomCode) return;
    soundFx.playSelect();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}/play/${roomCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSelect();
    setLoading(true);
    setErrorMessage(null);

    let upperCode = roomCode.toUpperCase();
    const finalHostName = `${selectedAvatar} ${hostName.trim() || 'Host Player'}`;

    try {
      const { data: existing } = await supabase
        .from('game_rooms')
        .select('code')
        .eq('code', upperCode)
        .maybeSingle();

      if (existing) {
        upperCode = await getUniqueRoomCode();
        setRoomCode(upperCode);
      }

      const roomPayload = {
        code: upperCode,
        host_id: finalHostName,
        template_id: selectedTemplateId,
        password_hash: hasPassword ? password : null,
        is_public: isPublic,
        status: 'waiting',
        state: {
          hostName: finalHostName,
          selectedTemplateId,
        },
      };

      const { error } = await supabase.from('game_rooms').insert(roomPayload);
      if (error && error.code !== '23505') {
        console.warn('Room creation note:', error);
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${upperCode}_role`, 'host');
        sessionStorage.setItem(`room_${upperCode}_name`, finalHostName);
        sessionStorage.setItem(`room_${upperCode}_template`, selectedTemplateId);
      }

      router.push(`/play/${upperCode}?template=${selectedTemplateId}`);
    } catch (err) {
      console.error('Error launching room:', err);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${upperCode}_role`, 'host');
        sessionStorage.setItem(`room_${upperCode}_name`, finalHostName);
        sessionStorage.setItem(`room_${upperCode}_template`, selectedTemplateId);
      }
      router.push(`/play/${upperCode}?template=${selectedTemplateId}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      <NavHeader activePage="host" />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handleCreateRoom} className="flex flex-col gap-8">
          
          {/* Page Header */}
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-500 mb-1 block">
              MULTIPLAYER GAME SETUP
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Host a Game Room
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Choose a character deck, set up your player profile, and launch the match.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Main Grid: Decisions on Left, Persistent Summary on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── LEFT COLUMN: Configuration Steps (7 Cols) ─────── */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              
              {/* 1. CHOOSE CHARACTER DECK */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <span className="text-amber-500 font-black">1.</span> Choose Character Deck
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">
                    {templates.length} Decks
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {templates.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => {
                          soundFx.playSelect();
                          setSelectedTemplateId(tpl.id);
                        }}
                        className="game-panel p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-[230px] relative group"
                        style={{
                          border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                          background: isSelected ? 'rgba(245,158,11,0.06)' : 'rgba(13,17,28,0.7)',
                        }}
                      >
                        {/* Selected Indicator Badge */}
                        {isSelected && (
                          <div className="absolute top-3.5 right-3.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Selected</span>
                          </div>
                        )}

                        <div>
                          {/* Deck Image Preview Grid */}
                          <div
                            className="grid grid-cols-4 gap-1 p-1.5 rounded-xl mb-3 aspect-[2.4/1] overflow-hidden"
                            style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            {tpl.cards.slice(0, 4).map((c) => (
                              <div key={c.id} className="relative w-full h-full rounded bg-slate-900 overflow-hidden">
                                <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                              </div>
                            ))}
                          </div>

                          <h3 className="font-extrabold text-white text-base truncate mb-1 group-hover:text-amber-400 transition-colors">
                            {tpl.title}
                          </h3>
                          {/* Reserved 2-line height description container */}
                          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 h-[2.5rem] overflow-hidden">
                            {tpl.description || 'Custom Guess Who card set ready for party play.'}
                          </p>
                        </div>

                        {/* Deck Card Footer */}
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                          <span className="font-semibold text-slate-300 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-amber-500" />
                            {tpl.cards.length} Cards
                          </span>
                          <span className="text-slate-400 text-[11px] truncate max-w-[100px]">{tpl.creatorName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 2. PLAYER PROFILE */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="text-amber-500 font-black">2.</span> Player Profile
                </h2>

                <div className="game-panel p-5 rounded-2xl flex flex-col gap-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Compact Avatar Selector */}
                    <div
                      className="flex items-center gap-1.5 p-1.5 rounded-xl overflow-x-auto w-full sm:w-auto shrink-0"
                      style={{ background: 'rgba(7,9,15,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {AVATAR_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            soundFx.playSelect();
                            setSelectedAvatar(emoji);
                          }}
                          className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                            selectedAvatar === emoji
                              ? 'bg-amber-500 text-black font-bold shadow'
                              : 'hover:bg-white/10 text-white'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Clean Handle Input */}
                    <div className="relative flex-1 w-full">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={hostName}
                        onChange={(e) => setHostName(e.target.value)}
                        placeholder="Your Display Name"
                        maxLength={20}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none transition-all"
                        style={{
                          background: 'rgba(7,9,15,0.9)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'rgba(245,158,11,0.6)')}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. ROOM PRIVACY */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="text-amber-500 font-black">3.</span> Room Privacy
                </h2>

                <div className="flex flex-col gap-3">
                  {/* Fixed Equal Height Privacy Cards Grid (Option B) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Public Lobby Card */}
                    <div
                      onClick={() => {
                        soundFx.playSelect();
                        setIsPublic(!isPublic);
                      }}
                      className="game-panel p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between h-[72px]"
                      style={{
                        background: isPublic ? 'rgba(6,182,212,0.08)' : 'rgba(7,9,15,0.6)',
                        border: isPublic ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(6,182,212,0.12)', color: '#22d3ee' }}
                        >
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">Public Lobby</h3>
                          <p className="text-xs text-slate-400">Anyone can join</p>
                        </div>
                      </div>

                      <div
                        className={`w-10 h-5 rounded-full transition-colors p-0.5 relative flex items-center ${
                          isPublic ? 'bg-cyan-400' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                            isPublic ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Password Protection Card */}
                    <div
                      onClick={() => {
                        soundFx.playSelect();
                        setHasPassword(!hasPassword);
                      }}
                      className="game-panel p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between h-[72px]"
                      style={{
                        background: hasPassword ? 'rgba(245,158,11,0.08)' : 'rgba(7,9,15,0.6)',
                        border: hasPassword ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
                        >
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">Password</h3>
                          <p className="text-xs text-slate-400">Require a passcode</p>
                        </div>
                      </div>

                      <div
                        className={`w-10 h-5 rounded-full transition-colors p-0.5 relative flex items-center ${
                          hasPassword ? 'bg-amber-400' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                            hasPassword ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Input expanded BELOW if password enabled (Option B - prevents card resizing) */}
                  {hasPassword && (
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center gap-3">
                      <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                      <input
                        type="password"
                        required={hasPassword}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter room password"
                        className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-white focus:outline-none"
                        style={{
                          background: 'rgba(7,9,15,0.95)',
                          border: '1px solid rgba(245,158,11,0.4)',
                        }}
                      />
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* ── RIGHT COLUMN: Persistent Room Summary Sidebar (5 Cols) ─ */}
            <div className="lg:col-span-5 lg:sticky lg:top-8">
              <div
                className="game-panel p-6 rounded-3xl flex flex-col gap-5 border shadow-xl"
                style={{
                  border: '1px solid rgba(245,158,11,0.3)',
                  background: 'rgba(13,17,28,0.95)',
                }}
              >
                {/* Header with human-friendly status */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-extrabold text-white text-base uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Room Summary
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    Ready to share
                  </span>
                </div>

                {/* Room Code Area */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Room Code
                  </span>
                  <div
                    className="p-3.5 rounded-2xl flex items-center justify-between relative"
                    style={{ background: 'rgba(7,9,15,0.95)', border: '1.5 solid rgba(245,158,11,0.5)' }}
                  >
                    <span className="text-2xl font-mono font-black text-amber-400 uppercase tracking-widest">
                      {roomCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-400 transition-colors"
                      title="Regenerate Code"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Copy Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background: copiedCode ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                        color: copiedCode ? '#34d399' : '#cbd5e1',
                        border: copiedCode ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.09)',
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background: copiedLink ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                        color: copiedLink ? '#34d399' : '#cbd5e1',
                        border: copiedLink ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.09)',
                      }}
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Configuration Summary Items */}
                <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Deck</span>
                    <span className="font-extrabold text-amber-400 truncate max-w-[160px]">
                      {selectedTemplate.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Host</span>
                    <span className="font-bold text-white">
                      {selectedAvatar} {hostName || 'Host Player'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Visibility</span>
                    <span className="font-bold text-cyan-400">
                      {isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>

                {/* SINGLE PRIMARY CTA ON THE SCREEN */}
                <button
                  type="submit"
                  disabled={loading}
                  className="game-btn-primary w-full py-4 text-base rounded-2xl justify-center shadow-lg shadow-amber-500/20 mt-2"
                >
                  <Play className="w-5 h-5 fill-current shrink-0" />
                  <span>{loading ? 'Launching Room...' : 'Launch Game Room'}</span>
                </button>
              </div>
            </div>

          </div>

        </form>
      </main>

      <footer className="game-panel py-6 text-center text-xs text-slate-500" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        © {new Date().getFullYear()} GuessWhooo?
      </footer>
    </div>
  );
}
