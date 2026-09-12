'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, ArrowRight, KeyRound } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export function JoinGameSegment() {
  const [roomCode, setRoomCode] = useState('');
  const [isHovered, setIsHovered] = useState(false);
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
      <div
        className="game-panel p-5 sm:p-7 rounded-3xl relative overflow-hidden transition-all duration-300"
        style={{
          border: isHovered ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(245,158,11,0.3)',
          boxShadow: isHovered
            ? '0 10px 30px -10px rgba(245,158,11,0.25)'
            : '0 4px 20px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow backdrop accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20"
          style={{ background: '#f59e0b' }}
        />

        {/* Segment Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.3)',
                color: '#f59e0b',
              }}
            >
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 block leading-tight">
                Quick Join
              </span>
              <h2
                className="text-xl sm:text-2xl font-black text-white leading-tight"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Have a Room Code?
              </h2>
            </div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Enter your code to jump straight in
          </p>
        </div>

        {/* Inline Input & Button Form */}
        <form onSubmit={handleJoinRoom} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={roomCode}
              onChange={handleInputChange}
              placeholder="ENTER ROOM CODE"
              maxLength={6}
              aria-label="Enter 6-letter Room Code"
              className="w-full h-12 px-4 rounded-2xl text-center sm:text-left text-base sm:text-lg font-mono font-black tracking-widest uppercase focus:outline-none transition-all duration-200"
              style={{
                background: 'rgba(7, 9, 15, 0.95)',
                border: '2px solid rgba(71, 85, 105, 0.7)',
                color: '#f59e0b',
                caretColor: '#f59e0b',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(245, 158, 11, 0.8)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(71, 85, 105, 0.7)')}
            />
            {roomCode.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded-md hidden sm:inline-block">
                {roomCode.length}/6
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!isCodeValid}
            className={`h-12 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 shrink-0 cursor-pointer ${
              isCodeValid
                ? 'game-btn-primary shadow-lg shadow-amber-500/20 active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span>Join Room</span>
            <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
          </button>
        </form>
      </div>
    </div>
  );
}
