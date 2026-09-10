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
          sharedState: {
            roomId: upperCode,
            hostPlayerId: finalHostName,
            players: {
              [finalHostName]: {
                id: finalHostName,
                nickname: hostName.trim() || 'Host Player',
                avatar: selectedAvatar,
                isHost: true,
                isReady: false,
                connected: true,
              },
            },
            selectedSetId: selectedTemplateId,
            gameStatus: 'setup',
            currentTurnPlayerId: null,
            turnTimerSetting: 60,
            turnStartedAt: null,
            winnerPlayerId: null,
            winReason: null,
            gameRound: 1,
          },
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
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1 block">
              MULTIPLAYER GAME SETUP
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Host a Game Room
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Choose a deck, set up your player identity, and launch the match.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Main 2-Column Composition */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── LEFT COLUMN: Core Decisions (~65-70% width) ───── */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* 1. CHOOSE A CHARACTER DECK */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <span className="text-amber-500 font-extrabold">1.</span> Choose a Character Deck
                  </h2>
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
                        className={`p-4 rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-[180px] relative group ${
                          isSelected
                            ? 'border-2 border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                            : 'border border-white/10 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        {/* Selected Check Badge (Positioned cleanly in top-right) */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow z-10">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Selected</span>
                          </div>
                        )}

                        <div>
                          {/* Compact 4-Image Grid Preview */}
                          <div className="grid grid-cols-4 gap-1 p-1 rounded-lg mb-3 aspect-[3.2/1] overflow-hidden bg-slate-950/80 border border-white/5">
                            {tpl.cards.slice(0, 4).map((c) => (
                              <div key={c.id} className="relative w-full h-full rounded overflow-hidden bg-slate-900">
                                <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                              </div>
                            ))}
                          </div>

                          <h3 className="font-bold text-white text-base truncate mb-1 group-hover:text-amber-400 transition-colors">
                            {tpl.title}
                          </h3>
                          <p className="text-slate-400 text-xs font-normal leading-relaxed line-clamp-1">
                            {tpl.description || 'Guess Who character set.'}
                          </p>
                        </div>

                        {/* Deck Card Footer */}
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/5">
                          <span className="font-medium">{tpl.cards.length} cards</span>
                          <span className="text-slate-400 text-[11px] truncate max-w-[120px]">{tpl.creatorName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 2. PLAYER IDENTITY */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="text-amber-500 font-extrabold">2.</span> Player Identity
                </h2>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Compact Avatar Selector */}
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <span className="text-[11px] font-semibold text-slate-400">Avatar</span>
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/10 overflow-x-auto">
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
                    </div>

                    {/* Handle Input */}
                    <div className="flex flex-col gap-1 flex-1 w-full">
                      <span className="text-[11px] font-semibold text-slate-400">Player Name</span>
                      <div className="relative w-full">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={hostName}
                          onChange={(e) => setHostName(e.target.value)}
                          placeholder="Host Player"
                          maxLength={20}
                          className="w-full pl-10 pr-4 py-2 rounded-xl text-sm font-semibold text-white focus:outline-none transition-all bg-slate-950/80 border border-white/10 focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. ROOM SETTINGS (ROOM PRIVACY) */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="text-amber-500 font-extrabold">3.</span> Room Settings
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  {/* Public Lobby Card */}
                  <div
                    onClick={() => {
                      soundFx.playSelect();
                      setIsPublic(!isPublic);
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                      isPublic
                        ? 'border border-cyan-500/40 bg-cyan-500/10'
                        : 'border border-white/10 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Globe className={`w-4 h-4 ${isPublic ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <h3 className="text-sm font-bold text-white">Public Lobby</h3>
                      </div>
                      <span className={`text-[11px] font-extrabold uppercase ${isPublic ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {isPublic ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-normal">Anyone can find &amp; join the room</p>
                  </div>

                  {/* Password Card (Self-contained expansion) */}
                  <div
                    className={`p-4 rounded-2xl transition-all flex flex-col gap-3 ${
                      hasPassword
                        ? 'border border-amber-500/40 bg-amber-500/10'
                        : 'border border-white/10 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div
                      onClick={() => {
                        soundFx.playSelect();
                        setHasPassword(!hasPassword);
                      }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Lock className={`w-4 h-4 ${hasPassword ? 'text-amber-400' : 'text-slate-400'}`} />
                        <h3 className="text-sm font-bold text-white">Password</h3>
                      </div>
                      <span className={`text-[11px] font-extrabold uppercase ${hasPassword ? 'text-amber-400' : 'text-slate-500'}`}>
                        {hasPassword ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-normal">Require a passcode to join</p>

                    {/* Passcode input self-contained inside Password card */}
                    {hasPassword && (
                      <div className="pt-2 border-t border-amber-500/20">
                        <input
                          type="password"
                          required={hasPassword}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter room password"
                          className="w-full px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-950/90 border border-amber-500/40 focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>

            </div>

            {/* ── RIGHT COLUMN: Room Summary Sidebar (~30-35% width) ── */}
            <div className="lg:col-span-4 lg:sticky lg:top-8">
              <div className="p-6 rounded-3xl flex flex-col gap-5 border border-white/10 bg-slate-900/80 shadow-2xl">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                    Room Summary
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">
                    Room setup
                  </span>
                </div>

                {/* Room Code Box */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Room Code
                  </span>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between">
                    <span className="text-2xl font-mono font-black text-amber-400 uppercase tracking-widest">
                      {roomCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                      title="Regenerate room code"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Copy Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 bg-white/5 border border-white/10 text-slate-200 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 bg-white/5 border border-white/10 text-slate-200 hover:text-white"
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Configuration Summary Table */}
                <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Deck</span>
                    <span className="font-semibold text-white truncate max-w-[140px]">
                      {selectedTemplate.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Host</span>
                    <span className="font-semibold text-white">
                      {selectedAvatar} {hostName || 'Host Player'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Visibility</span>
                    <span className="font-semibold text-cyan-400">
                      {isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Password</span>
                    <span className={`font-semibold ${hasPassword ? 'text-amber-400' : 'text-slate-500'}`}>
                      {hasPassword ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* SINGLE PRIMARY CTA ON THE ENTIRE SCREEN */}
                <button
                  type="submit"
                  disabled={loading}
                  className="game-btn-primary w-full py-4 text-base rounded-2xl justify-center shadow-lg shadow-amber-500/20 mt-2 font-bold"
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
