'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import {
  Lock,
  Globe,
  ArrowRight,
  Loader2,
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
  const [selectedTemplateId] = useState<string>(initialTemplateId);

  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  const [hostName, setHostName] = useState<string>('Host Player');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('https://api.dicebear.com/7.x/avataaars/svg?seed=Alex');

  const [loading, setLoading] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmittingRef = useRef<boolean>(false);

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

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    setNameError(null);
    setPasswordError(null);
    setErrorMessage(null);

    const trimmedName = hostName.trim();
    let hasValidationError = false;

    if (!trimmedName) {
      setNameError('Nickname is required.');
      hasValidationError = true;
    }

    if (hasPassword && !password.trim()) {
      setPasswordError('Password is required when passcode protection is enabled.');
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    soundFx.playSelect();

    let upperCode = (roomCode || generateRandomCode(6)).toUpperCase();
    const finalHostName = trimmedName;

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
        password_hash: hasPassword ? password.trim() : null,
        is_public: isPublic,
        status: 'waiting',
        state: {
          hostName: finalHostName,
          selectedAvatar,
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
        sessionStorage.setItem(`room_${upperCode}_avatar`, selectedAvatar);
        sessionStorage.setItem(`room_${upperCode}_template`, selectedTemplateId);
      }

      router.push(`/play/${upperCode}`);
    } catch (err) {
      console.error('Error launching room:', err);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${upperCode}_role`, 'host');
        sessionStorage.setItem(`room_${upperCode}_name`, finalHostName);
        sessionStorage.setItem(`room_${upperCode}_avatar`, selectedAvatar);
        sessionStorage.setItem(`room_${upperCode}_template`, selectedTemplateId);
      }
      router.push(`/play/${upperCode}`);
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <form onSubmit={handleCreateRoom} className="flex flex-col gap-8">
        
        {/* Page Header */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1 block">
            HOST A GAME
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Host a Game
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Set up your profile and room settings.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-medium text-center">
            {errorMessage}
          </div>
        )}

        {/* Single Column Content Flow */}
        <div className="flex flex-col gap-6">
          
          {/* 1. Host Profile */}
          <section className="game-panel p-6 rounded-3xl border border-white/10">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="text-amber-500 font-extrabold">1.</span> Host Profile
            </h2>
            <PlayerProfileSetup
              name={hostName}
              avatar={selectedAvatar}
              onNameChange={(val) => {
                setHostName(val);
                if (nameError) setNameError(null);
              }}
              onAvatarChange={setSelectedAvatar}
              nameError={nameError}
            />
          </section>

          {/* 2. Room Settings */}
          <section className="game-panel p-6 rounded-3xl border border-white/10">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="text-amber-500 font-extrabold">2.</span> Room Settings
            </h2>

            {/* Vertical Stack of Room Settings */}
            <div className="flex flex-col gap-3">
              
              {/* Public Lobby Setting Row */}
              <div
                onClick={() => {
                  soundFx.playSelect();
                  setIsPublic(!isPublic);
                }}
                className={`w-full p-4 rounded-2xl cursor-pointer select-none transition-all flex flex-col gap-1 text-left border ${
                  isPublic
                    ? 'border-cyan-500/40 bg-cyan-500/10'
                    : 'border-white/10 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-2.5">
                    <Globe className={`w-4 h-4 ${isPublic ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <h3 className="text-sm font-bold text-white">Public Lobby</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase transition-colors ${
                    isPublic ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-slate-500 border border-white/10'
                  }`}>
                    {isPublic ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 pl-6 pointer-events-none">Anyone can find &amp; join your room</p>
              </div>

              {/* Password Protection Setting Row */}
              <div
                onClick={() => {
                  soundFx.playSelect();
                  setHasPassword(!hasPassword);
                  setPasswordError(null);
                }}
                className={`w-full p-4 rounded-2xl cursor-pointer select-none transition-all flex flex-col gap-3 border ${
                  hasPassword
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : 'border-white/10 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pointer-events-none">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                      <Lock className={`w-4 h-4 ${hasPassword ? 'text-amber-400' : 'text-slate-400'}`} />
                      <h3 className="text-sm font-bold text-white">Password</h3>
                    </div>
                    <p className="text-xs text-slate-400 pl-6">Require a passcode to join</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase transition-colors shrink-0 ${
                    hasPassword ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-500 border border-white/10'
                  }`}>
                    {hasPassword ? 'ON' : 'OFF'}
                  </span>
                </div>

                {hasPassword && (
                  <div
                    className="pt-3 border-t border-amber-500/20 pl-6 flex flex-col gap-1 cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                      }}
                      placeholder="Enter room password..."
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none bg-slate-950/90 border transition-colors placeholder:text-slate-600 ${
                        passwordError ? 'border-rose-500/80 focus:border-rose-500' : 'border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                      }`}
                    />
                    {passwordError && (
                      <p className="text-xs font-semibold text-rose-400 mt-0.5">{passwordError}</p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* Primary Action CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="game-btn-primary w-full py-4 text-base rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[56px] shadow-xl shadow-amber-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin shrink-0 text-slate-950" />
                  <span>Creating Room...</span>
                </>
              ) : (
                <>
                  <span>Create Room</span>
                  <ArrowRight className="w-5 h-5 ml-0.5 shrink-0" />
                </>
              )}
            </button>
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
