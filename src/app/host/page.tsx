'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { CardSetTemplate } from '@/types/game';
import { THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import {
  Lock,
  Globe,
  RefreshCw,
  Gamepad2,
  Copy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavHeader } from '@/components/NavHeader';
import { soundFx } from '@/lib/audio';
import { PlayerProfileSetup } from '@/components/PlayerProfileSetup';

function generateRandomCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function HostRoomContent() {
  const searchParams = useSearchParams();
  const initialTemplateId = searchParams.get('template') || THE_OFFICE_TEMPLATE.id;

  const [roomCode, setRoomCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [selectedTemplateId] = useState<string>(initialTemplateId);

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
  }, [getUniqueRoomCode]);

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

      router.push(`/play/${upperCode}`);
    } catch (err) {
      console.error('Error launching room:', err);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${upperCode}_role`, 'host');
        sessionStorage.setItem(`room_${upperCode}_name`, finalHostName);
        sessionStorage.setItem(`room_${upperCode}_template`, selectedTemplateId);
      }
      router.push(`/play/${upperCode}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <form onSubmit={handleCreateRoom} className="flex flex-col gap-8">
        
        {/* Page Header */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1 block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            CREATE A GAME ROOM
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Host a Game
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Set up your host profile and room settings to get your room code. You can choose or change game sets anytime inside the lobby.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-medium text-center">
            {errorMessage}
          </div>
        )}

        {/* 2-Column Layout: Form & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Settings */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 1. PLAYER IDENTITY */}
            <section className="game-panel p-6 rounded-3xl border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="text-amber-500 font-extrabold">1.</span> Host Profile
              </h2>
              <PlayerProfileSetup
                name={hostName}
                avatar={selectedAvatar}
                onNameChange={setHostName}
                onAvatarChange={setSelectedAvatar}
                compact={false}
              />
            </section>

            {/* 2. ROOM PRIVACY & SETTINGS */}
            <section className="game-panel p-6 rounded-3xl border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="text-amber-500 font-extrabold">2.</span> Room Settings
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
                  <p className="text-xs text-slate-400 font-normal">Anyone can find &amp; join your room</p>
                </div>

                {/* Password Protection Card */}
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

          {/* Right Column: Room Summary Sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="p-6 rounded-3xl flex flex-col gap-5 border border-white/10 bg-slate-900/80 shadow-2xl">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                  Room Summary
                </h3>
                <span className="text-[11px] font-medium text-slate-400">
                  Ready to Create
                </span>
              </div>

              {/* Room Code Display */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Generated Room Code
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

              {/* Settings Summary */}
              <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Host Profile</span>
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

              {/* PRIMARY CTA */}
              <button
                type="submit"
                disabled={loading}
                className="game-btn-primary w-full py-4 text-base rounded-2xl justify-center shadow-lg shadow-amber-500/20 mt-2 font-bold flex items-center gap-2"
              >
                <Gamepad2 className="w-5 h-5 fill-current shrink-0" />
                <span>{loading ? 'Creating Room...' : 'Create Room & Enter Lobby'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

        </div>

      </form>
    </main>
  );
}

export default function HostRoomPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      <NavHeader activePage="host" />
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading room setup...</div>}>
        <HostRoomContent />
      </Suspense>
      <footer className="game-panel py-6 text-center text-xs text-slate-500" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        © {new Date().getFullYear()} GuessWhooo?
      </footer>
    </div>
  );
}
