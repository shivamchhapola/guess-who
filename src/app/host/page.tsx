'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CardSetTemplate } from '@/types/game';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES, THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import { Zap, Lock, Globe, RefreshCw, Play, Sparkles, Check, Copy, ShieldCheck, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { NavHeader } from '@/components/NavHeader';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Check code uniqueness in DB
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
      // Fallback if DB check fails
    }
    setCheckingCode(false);
    return code;
  }, [supabase]);

  useEffect(() => {
    getUniqueRoomCode().then(code => setRoomCode(code));

    // Fetch user public custom templates if any
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
    const code = await getUniqueRoomCode();
    setRoomCode(code);
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    let upperCode = roomCode.toUpperCase();

    try {
      // Double check code uniqueness before insert
      const { data: existing } = await supabase
        .from('game_rooms')
        .select('code')
        .eq('code', upperCode)
        .maybeSingle();

      if (existing) {
        // Code collision detected, generate fresh unique code
        upperCode = await getUniqueRoomCode();
        setRoomCode(upperCode);
      }

      const roomPayload = {
        code: upperCode,
        host_id: hostName || 'Host Player',
        template_id: selectedTemplateId,
        password_hash: hasPassword ? password : null,
        is_public: isPublic,
        status: 'waiting',
        state: {
          hostName,
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
        sessionStorage.setItem(`room_${upperCode}_name`, hostName);
        sessionStorage.setItem(`room_${upperCode}_template`, selectedTemplateId);
      }

      router.push(`/play/${upperCode}?template=${selectedTemplateId}`);
    } catch (err) {
      console.error('Error creating room:', err);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${upperCode}_role`, 'host');
        sessionStorage.setItem(`room_${upperCode}_name`, hostName);
        sessionStorage.setItem(`room_${upperCode}_template`, selectedTemplateId);
      }
      router.push(`/play/${upperCode}?template=${selectedTemplateId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      <NavHeader activePage="host" />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handleCreateRoom} className="flex flex-col gap-8">

          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
              <Zap className="w-3.5 h-3.5" />
              <span>Multiplayer Host Studio</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}>
              Host a Game Room
            </h1>
            <p className="text-slate-400 text-sm">
              Customize your room settings, pick a character set, and invite your friend to play!
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-semibold text-center">
              {errorMessage}
            </div>
          )}

          {/* Grid 1: Host Profile & Room Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Host Display Name */}
            <div className="game-panel p-6 rounded-3xl flex flex-col justify-between"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Host Name</h2>
                    <p className="text-xs text-slate-400">Shown to joining opponent</p>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. MasterGuesser"
                  maxLength={20}
                  className="w-full px-4 py-3.5 rounded-2xl text-base font-bold text-white focus:outline-none transition-all"
                  style={{
                    background: 'rgba(7,9,15,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            </div>

            {/* Unique Room Code */}
            <div className="game-panel p-6 rounded-3xl flex flex-col justify-between"
              style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Room Code</h2>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        {checkingCode ? (
                          <span className="text-amber-400 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Verifying DB uniqueness...
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Checked &amp; Available
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    disabled={checkingCode}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all border border-white/5"
                    title="Generate New Code"
                  >
                    <RefreshCw className={`w-4 h-4 ${checkingCode ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={roomCode}
                    className="w-full px-4 py-3 text-center text-2xl font-mono font-black tracking-widest text-amber-400 uppercase rounded-2xl focus:outline-none"
                    style={{
                      background: 'rgba(7,9,15,0.95)',
                      border: '2px solid rgba(245,158,11,0.4)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="absolute right-3 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    style={{
                      background: copiedCode ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)',
                      color: copiedCode ? '#34d399' : '#fff',
                      border: copiedCode ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid 2: Room Privacy & Password Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Public Lobby Finder Toggle */}
            <div className="game-panel p-5 rounded-2xl flex items-center justify-between cursor-pointer"
              style={{ border: isPublic ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => setIsPublic(!isPublic)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#22d3ee' }}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Public Lobby Finder</h3>
                  <p className="text-xs text-slate-400">{isPublic ? 'Visible in public lobby list' : 'Private match — code only'}</p>
                </div>
              </div>

              <div className={`w-12 h-6 rounded-full transition-colors p-1 relative flex items-center ${isPublic ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Password Protection */}
            <div className="game-panel p-5 rounded-2xl flex flex-col justify-center"
              style={{ border: hasPassword ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setHasPassword(!hasPassword)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Room Password</h3>
                    <p className="text-xs text-slate-400">{hasPassword ? 'Password required to enter' : 'No password required'}</p>
                  </div>
                </div>

                <div className={`w-12 h-6 rounded-full transition-colors p-1 relative flex items-center ${hasPassword ? 'bg-amber-500' : 'bg-slate-800'}`}>
                  <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${hasPassword ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              {hasPassword && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <input
                    type="password"
                    required={hasPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set secret passcode"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white focus:outline-none"
                    style={{
                      background: 'rgba(7,9,15,0.9)',
                      border: '1px solid rgba(245,158,11,0.3)',
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Select Game Set */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Select Character Set</span>
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {templates.length} Sets Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className="game-panel p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between relative group"
                    style={{
                      border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected ? 'rgba(245,158,11,0.05)' : 'rgba(13,17,28,0.7)',
                      boxShadow: isSelected ? '0 0 20px rgba(245,158,11,0.15)' : 'none',
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
                      {/* Character Preview Grid */}
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
                      <span className="font-bold text-slate-300">{tpl.cards.length} Characters</span>
                      <span className="text-amber-400 font-semibold">{tpl.creatorName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || checkingCode}
              className="game-btn-primary w-full py-4 text-lg rounded-2xl justify-center shadow-xl"
            >
              <Play className="w-6 h-6 fill-current shrink-0" />
              <span>{loading ? 'Creating Game Room...' : 'Launch Game Room'}</span>
            </button>
          </div>

        </form>
      </main>

      <footer className="game-panel py-6 text-center text-xs text-slate-500" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        © {new Date().getFullYear()} GuessWhoParty!
      </footer>
    </div>
  );
}
