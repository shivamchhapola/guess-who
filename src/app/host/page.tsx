'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavHeader } from '@/components/NavHeader';
import { soundFx } from '@/lib/audio';
import { PlayerProfileSetup } from '@/components/PlayerProfileSetup';
import { HostSettingsForm } from '@/components/host/HostSettingsForm';
import { generateRandomName, generateRandomAvatar } from '@/lib/randomIdentity';

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
  const [turnTimerSetting, setTurnTimerSetting] = useState<number>(60); // 0 (off), 30, 60, 90, 120

  const [hostName, setHostName] = useState<string>(() => generateRandomName());
  const [selectedAvatar, setSelectedAvatar] = useState<string>(() => generateRandomAvatar());

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
    const hostPresenceKey = selectedAvatar && selectedAvatar.startsWith('https://')
      ? `${selectedAvatar} ${finalHostName}`
      : finalHostName;

    try {
      for (let attempt = 0; attempt < 5; attempt++) {
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
          host_id: hostPresenceKey,
          template_id: selectedTemplateId,
          password_hash: hasPassword ? password.trim() : null,
          is_public: isPublic,
          turn_timer_seconds: turnTimerSetting,
          status: 'waiting',
          state: {
            hostName: finalHostName,
            selectedAvatar,
            selectedTemplateId,
            turnTimerSetting,
            gameStatus: 'setup',
          },
        };

        const { error } = await supabase.from('game_rooms').insert(roomPayload);
        if (!error) {
          break;
        } else if (error.code === '23505') {
          upperCode = await getUniqueRoomCode();
          setRoomCode(upperCode);
        } else {
          console.warn('Room creation note:', error);
          break;
        }
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${upperCode}_role`, 'host');
        sessionStorage.setItem(`room_${upperCode}_name`, hostPresenceKey);
        sessionStorage.setItem(`room_${upperCode}_avatar`, selectedAvatar);
        sessionStorage.setItem(`room_${upperCode}_template`, selectedTemplateId);
        sessionStorage.setItem(`room_${upperCode}_timer`, String(turnTimerSetting));
      }

      router.push(`/play/${upperCode}?template=${selectedTemplateId}`);
    } catch (err) {
      console.error('Error launching room:', err);
      setErrorMessage('Could not launch room. Please try again.');
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
          <HostSettingsForm
            isPublic={isPublic}
            onIsPublicChange={setIsPublic}
            hasPassword={hasPassword}
            onHasPasswordChange={(val) => {
              setHasPassword(val);
              if (passwordError) setPasswordError(null);
            }}
            password={password}
            onPasswordChange={(val) => {
              setPassword(val);
              if (passwordError) setPasswordError(null);
            }}
            passwordError={passwordError}
            turnTimerSetting={turnTimerSetting}
            onTurnTimerChange={setTurnTimerSetting}
          />

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
