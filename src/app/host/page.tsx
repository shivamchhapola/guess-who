'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CardSetTemplate } from '@/types/game';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES, THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import {
  Zap,
  Lock,
  Globe,
  RefreshCw,
  Play,
  Sparkles,
  Check,
  Copy,
  ShieldCheck,
  User,
  Crown,
  Eye,
  ChevronRight,
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
  const [checkingCode, setCheckingCode] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(THE_OFFICE_TEMPLATE.id);
  const [templates, setTemplates] = useState<CardSetTemplate[]>([
    THE_OFFICE_TEMPLATE,
    ...ALL_POPULAR_TEMPLATES.filter(t => t.id !== THE_OFFICE_TEMPLATE.id),
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

  // Supabase DB uniqueness check
  const getUniqueRoomCode = useCallback(async (): Promise<string> => {
    setCheckingCode(true);
    let code = generateRandomCode(6);
    try {
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase
          .from('game_rooms')
          .select('code')
          .eq('code', code)
          .maybeSingle();

        if (!data) {
          setCheckingCode(false);
          return code;
        }
        code = generateRandomCode(6);
      }
    } catch {
      // Fallback
    }
    setCheckingCode(false);
    return code;
  }, [supabase]);

  useEffect(() => {
    getUniqueRoomCode().then(code => setRoomCode(code));

    // Fetch public custom templates from Supabase
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
            cards: (t.cards || []).map((c: { id: string; name: string; image_url: string; attributes: Record<string, unknown> }) => ({
              id: c.id,
              name: c.name,
              imageUrl: c.image_url,
              attributes: c.attributes || {},
            })),
          }));

          setTemplates((prev) => [
            ...prev,
            ...formatted.filter(ft => !prev.some(pt => pt.id === ft.id)),
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
      // Re-verify uniqueness in Supabase before creation
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
        console.warn('Supabase DB room insert note:', error);
      }

      // Store local host session metadata
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${upperCode}_role`, 'host');
        sessionStorage.setItem(`room_${upperCode}_name`, finalHostName);
        sessionStorage.setItem(`room_${upperCode}_template`, selectedTemplateId);
      }

      router.push(`/play/${upperCode}?template=${selectedTemplateId}`);
    } catch (err) {
      console.error('Error creating room:', err);
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

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      <NavHeader activePage="host" />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handleCreateRoom} className="flex flex-col gap-8">

          {/* Top Hero Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                <Zap className="w-3.5 h-3.5 animate-bounce" />
                <span>Multiplayer Game Setup</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight"
                style={{ fontFamily: 'Outfit, sans-serif' }}>
                Host a Game Room
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Pick a deck, customize your room settings, and invite your friend to play!
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || checkingCode}
              className="game-btn-primary py-4 px-8 text-base sm:text-lg rounded-2xl shrink-0 justify-center shadow-xl shadow-amber-500/20"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{loading ? 'Creating Room...' : 'Launch Room'}</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-semibold text-center">
              {errorMessage}
            </div>
          )}

          {/* 2-Column Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── Left Column: Config Controls ──────────────── */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Box 1: Select Game Deck */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>1. Choose Character Deck</span>
                  </h2>
                  <span className="text-xs font-bold text-slate-400">
                    {templates.length} Decks Ready
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
                        className="game-panel p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between relative group"
                        style={{
                          border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                          background: isSelected ? 'rgba(245,158,11,0.06)' : 'rgba(13,17,28,0.7)',
                          boxShadow: isSelected ? '0 0 24px rgba(245,158,11,0.2)' : 'none',
                        }}
                      >
                        {/* Selected Badge */}
                        {isSelected && (
                          <div className="absolute top-4 right-4 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>SELECTED</span>
                          </div>
                        )}

                        <div>
                          {/* Photo Grid Preview */}
                          <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl mb-4 aspect-[2.2/1] overflow-hidden"
                            style={{ background: '#07090f', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {tpl.cards.slice(0, 4).map((c) => (
                              <div key={c.id} className="relative w-full h-full rounded-lg bg-slate-900 overflow-hidden">
                                <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                              </div>
                            ))}
                          </div>

                          <h3 className="font-black text-white text-lg mb-1 group-hover:text-amber-400 transition-colors"
                            style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {tpl.title}
                          </h3>
                          <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{tpl.description}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5">
                          <span className="font-bold text-slate-300">{tpl.cards.length} Cards</span>
                          <span className="text-amber-400 font-semibold">{tpl.creatorName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box 2: Host Identity */}
              <div className="game-panel p-6 rounded-3xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>2. Host Profile</h2>
                    <p className="text-xs text-slate-400">Choose your avatar icon and handle</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Quick Avatar Picker */}
                  <div className="flex items-center gap-1.5 p-2 rounded-2xl overflow-x-auto w-full sm:w-auto"
                    style={{ background: 'rgba(7,9,15,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {AVATAR_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          soundFx.playSelect();
                          setSelectedAvatar(emoji);
                        }}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-transform ${
                          selectedAvatar === emoji
                            ? 'bg-amber-400 text-black scale-110 font-bold shadow-md'
                            : 'hover:bg-white/10 text-white'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Name Input */}
                  <input
                    type="text"
                    required
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Host Display Name"
                    maxLength={20}
                    className="flex-1 w-full px-4 py-3 rounded-2xl text-base font-bold text-white focus:outline-none transition-all"
                    style={{
                      background: 'rgba(7,9,15,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.6)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
              </div>

              {/* Box 3: Privacy & Password Settings */}
              <div className="game-panel p-6 rounded-3xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 className="text-lg font-black text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  3. Room Privacy &amp; Security
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Public Lobby Finder Toggle */}
                  <div
                    onClick={() => {
                      soundFx.playSelect();
                      setIsPublic(!isPublic);
                    }}
                    className="p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between"
                    style={{
                      background: isPublic ? 'rgba(6,182,212,0.08)' : 'rgba(7,9,15,0.6)',
                      border: isPublic ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#22d3ee' }}>
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Public Lobby</h3>
                        <p className="text-xs text-slate-400">{isPublic ? 'Listed for anyone to join' : 'Private link only'}</p>
                      </div>
                    </div>

                    <div className={`w-11 h-6 rounded-full transition-colors p-1 relative flex items-center ${isPublic ? 'bg-cyan-400' : 'bg-slate-800'}`}>
                      <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Password Protection */}
                  <div
                    className="p-4 rounded-2xl border flex flex-col justify-between"
                    style={{
                      background: hasPassword ? 'rgba(245,158,11,0.08)' : 'rgba(7,9,15,0.6)',
                      border: hasPassword ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      onClick={() => {
                        soundFx.playSelect();
                        setHasPassword(!hasPassword);
                      }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Password</h3>
                          <p className="text-xs text-slate-400">{hasPassword ? 'Protected by passcode' : 'No passcode'}</p>
                        </div>
                      </div>

                      <div className={`w-11 h-6 rounded-full transition-colors p-1 relative flex items-center ${hasPassword ? 'bg-amber-400' : 'bg-slate-800'}`}>
                        <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${hasPassword ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {hasPassword && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <input
                          type="password"
                          required={hasPassword}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Secret passcode"
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white focus:outline-none"
                          style={{
                            background: 'rgba(7,9,15,0.95)',
                            border: '1px solid rgba(245,158,11,0.4)',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* ── Right Column: Live Room Code & Lobby Summary Card ───── */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-8">
              
              {/* Room Ticket Box */}
              <div className="game-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl"
                style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(13,17,28,0.9)' }}>
                
                <div className="pointer-events-none absolute -top-16 -right-16 w-36 h-36 rounded-full"
                  style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.2) 0%, transparent 70%)' }} />

                {/* Ticket Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <h3 className="font-extrabold text-white text-base">Verified Room Ticket</h3>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                    DB Verified
                  </span>
                </div>

                {/* Big Monospace Code Display */}
                <div className="text-center mb-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Room Code</span>
                  <div className="p-4 rounded-2xl flex items-center justify-center gap-2 relative"
                    style={{ background: 'rgba(7,9,15,0.95)', border: '2px solid rgba(245,158,11,0.5)' }}>
                    <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-amber-400 uppercase">
                      {roomCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      disabled={checkingCode}
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-400 transition-colors ml-2"
                      title="Generate Fresh Code"
                    >
                      <RefreshCw className={`w-4 h-4 ${checkingCode ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Supabase DB Uniqueness Badge */}
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold">
                    {checkingCode ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying DB uniqueness...
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Code verified unique in database
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons for Host */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: copiedCode ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                      color: copiedCode ? '#34d399' : '#fff',
                      border: copiedCode ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{copiedCode ? 'Code Copied' : 'Copy Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: copiedLink ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                      color: copiedLink ? '#34d399' : '#fff',
                      border: copiedLink ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
                  </button>
                </div>

                {/* Summary Card Details */}
                <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 font-medium">Selected Deck:</span>
                    <span className="font-extrabold text-amber-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {selectedTemplate.title} ({selectedTemplate.cards.length} Cards)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 font-medium">Host Player:</span>
                    <span className="font-extrabold text-white">
                      {selectedAvatar} {hostName || 'Host Player'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 font-medium">Visibility:</span>
                    <span className="font-bold text-cyan-400">
                      {isPublic ? 'Public Match' : 'Private Match'}
                    </span>
                  </div>
                </div>

                {/* Big Launch CTA */}
                <button
                  type="submit"
                  disabled={loading || checkingCode}
                  className="game-btn-primary w-full py-4 text-lg rounded-2xl justify-center shadow-xl shadow-amber-500/25 mt-6"
                >
                  <Play className="w-6 h-6 fill-current shrink-0" />
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
