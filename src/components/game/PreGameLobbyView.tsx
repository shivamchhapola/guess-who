'use client';

import React from 'react';
import { CardSetTemplate } from '@/types/game';
import { Users, Check, Play, Layers, Clock, Link } from 'lucide-react';
import Image from 'next/image';
import { Select } from '@/components/ui/Select';

interface PreGameLobbyViewProps {
  roomCode: string;
  isHost: boolean;
  playerName: string;
  playerAvatar: string;
  opponentName: string | null;
  opponentAvatar: string | null;
  currentTemplate: CardSetTemplate;
  turnTimerSetting: number;
  copiedCode: boolean;
  copiedLink: boolean;
  onCopyRoomCode: () => void;
  onCopyRoomLink: () => void;
  onChangeTimer: (timerSeconds: number) => void;
  onOpenChangeSetModal: () => void;
  onStartActiveMatch: () => void;
}

export const PreGameLobbyView: React.FC<PreGameLobbyViewProps> = ({
  roomCode,
  isHost,
  playerName,
  playerAvatar,
  opponentName,
  opponentAvatar,
  currentTemplate,
  turnTimerSetting,
  copiedCode,
  copiedLink,
  onCopyRoomCode,
  onCopyRoomLink,
  onChangeTimer,
  onOpenChangeSetModal,
  onStartActiveMatch,
}) => {
  // Derive Host vs Challenger identities based on isHost flag (BUG-09 fix)
  const hostName = isHost ? playerName : opponentName || 'Host';
  const hostAvatar = isHost ? playerAvatar : opponentAvatar;
  const hostBadge = isHost ? 'Host (You)' : 'Host';

  const challengerName = isHost ? opponentName : playerName;
  const challengerAvatar = isHost ? opponentAvatar : playerAvatar;
  const challengerBadge = !isHost ? 'Challenger (You)' : 'Challenger';

  return (
    <div className="w-full max-w-4xl mx-auto game-panel p-6 sm:p-8 rounded-3xl mb-6 shadow-2xl"
      style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span>🎮</span>
              <span>Match Lobby</span>
            </h2>
            {/* Clickable room code badge — copies code */}
            <button
              type="button"
              onClick={onCopyRoomCode}
              title="Click to copy room code"
              className="group relative text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer"
            >
              {copiedCode ? '✓ Copied!' : roomCode}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-700 shadow-lg">
                Copy room code
              </span>
            </button>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            {isHost ? 'Invite an opponent and choose game deck settings.' : 'Waiting for host to start the match...'}
          </p>
        </div>

        {/* Copy Invite Link */}
        <button
          type="button"
          onClick={onCopyRoomLink}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-100 bg-slate-800/80 hover:bg-slate-700/80 transition-all border border-slate-700/60 shadow-lg"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Link className="w-4 h-4 text-cyan-400" />}
          <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
        </button>
      </div>

      {/* Players Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Host (Player 1) */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-amber-500/50 flex items-center justify-center text-2xl">
            {hostAvatar?.startsWith('https://') ? (
              <Image src={hostAvatar} alt={hostName} fill className="object-cover" unoptimized />
            ) : (
              <span>{hostAvatar || '🎮'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-base truncate">{hostName}</h4>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {hostBadge}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Ready in Lobby</p>
          </div>
        </div>

        {/* Opponent (Player 2) */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          {challengerName ? (
            <>
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-cyan-500/50 flex items-center justify-center text-2xl">
                {challengerAvatar?.startsWith('https://') ? (
                  <Image src={challengerAvatar} alt={challengerName} fill className="object-cover" unoptimized />
                ) : (
                  <span>{challengerAvatar || '👾'}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base truncate">{challengerName}</h4>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {challengerBadge}
                  </span>
                </div>
                <p className="text-emerald-400 text-xs font-semibold mt-0.5">Connected & Ready</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-3 w-full py-2 text-slate-500 text-xs font-medium">
              <Users className="w-5 h-5 animate-pulse text-cyan-400" />
              <span>Waiting for challenger to join...</span>
            </div>
          )}
        </div>
      </div>

      {/* Lobby Settings & Deck Selection */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Selected Deck Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">Selected Game Set</div>
            <div className="text-sm font-black text-white">{currentTemplate.title} ({currentTemplate.cards.length} cards)</div>
          </div>
        </div>

        {/* Change Deck Button (Host Only) */}
        {isHost && (
          <button
            type="button"
            onClick={onOpenChangeSetModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Change Game Set</span>
          </button>
        )}

        {/* Turn Timer Selector */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-slate-300">Turn Timer:</span>
          {isHost ? (
            <Select<number>
              value={turnTimerSetting}
              options={[
                { value: 30, label: '30s (Fast)' },
                { value: 45, label: '45s (Standard)' },
                { value: 60, label: '60s (Relaxed)' },
                { value: 90, label: '90s (Casual)' },
              ]}
              onChange={onChangeTimer}
            />
          ) : (
            <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
              {turnTimerSetting}s
            </span>
          )}
        </div>
      </div>

      {/* Start Game Action Button */}
      {isHost ? (
        <button
          type="button"
          onClick={onStartActiveMatch}
          disabled={!opponentName}
          className="w-full py-4 rounded-2xl text-slate-950 font-black text-base bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-40 disabled:hover:from-amber-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{opponentName ? 'Start Match Now' : 'Waiting for Challenger to Join...'}</span>
        </button>
      ) : (
        <div className="w-full py-3.5 px-4 rounded-2xl bg-slate-900/90 text-center text-xs font-semibold text-slate-300 border border-slate-800">
          The host will start the match once both players are ready.
        </div>
      )}
    </div>
  );
};
