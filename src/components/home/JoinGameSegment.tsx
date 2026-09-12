'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export function JoinGameSegment() {
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (code.length >= 4) {
      soundFx.playSelect();
      router.push(`/play/${code}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setRoomCode(sanitized);
  };

  const isCodeValid = roomCode.trim().length >= 4;

  return (
    <div className="max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 text-center">
      {/* Game Heading */}
      <h2
        className="text-lg sm:text-2xl font-extrabold text-white mb-3 tracking-tight"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        Have a <span className="text-amber-400">room code?</span>
      </h2>

      {/* Inline Input & Button Form */}
      <form onSubmit={handleJoinRoom} className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={roomCode}
            onChange={handleInputChange}
            placeholder="Enter 6-letter room code"
            maxLength={6}
            aria-label="Enter Room Code"
            className="w-full h-12 sm:h-14 px-4 sm:px-5 rounded-2xl text-center sm:text-left text-base sm:text-lg font-mono font-black tracking-widest uppercase focus:outline-none transition-all duration-200 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:normal-case placeholder:text-slate-500 placeholder:text-xs sm:placeholder:text-base"
            style={{
              background: 'rgba(13, 19, 36, 0.95)',
              border: roomCode.length > 0 ? '2px solid rgba(245, 158, 11, 0.7)' : '2px solid rgba(71, 85, 105, 0.5)',
              color: '#f59e0b',
              caretColor: '#f59e0b',
              boxShadow: roomCode.length > 0 ? '0 0 18px rgba(245, 158, 11, 0.2)' : 'none',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(245, 158, 11, 0.8)';
              e.target.style.boxShadow = '0 0 22px rgba(245, 158, 11, 0.25)';
            }}
            onBlur={e => {
              e.target.style.borderColor = roomCode.length > 0 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(71, 85, 105, 0.5)';
              e.target.style.boxShadow = roomCode.length > 0 ? '0 0 18px rgba(245, 158, 11, 0.2)' : 'none';
            }}
          />
          {roomCode.length > 0 && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md hidden sm:inline-block">
              {roomCode.length}/6
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!isCodeValid}
          className={`h-12 sm:h-14 px-6 sm:px-7 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 shrink-0 cursor-pointer ${
            isCodeValid
              ? 'game-btn-primary shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-800/90 text-slate-500 border border-slate-700/80 cursor-not-allowed opacity-60'
          }`}
        >
          <Play className="w-4 h-4 fill-current shrink-0" />
          <span>Join Room</span>
        </button>
      </form>
    </div>
  );
}
