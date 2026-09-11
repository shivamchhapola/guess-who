'use client';

import React from 'react';
import { CardSetTemplate } from '@/types/game';
import { Users, Copy, Check, Play, Layers, Clock } from 'lucide-react';
import Image from 'next/image';

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
  onCopyRoomCode: () => void;
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
  onCopyRoomCode,
  onChangeTimer,
  onOpenChangeSetModal,
  onStartActiveMatch,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto game-panel p-6 sm:p-8 rounded-3xl mb-6 shadow-2xl"
      style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Match Lobby
            </h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {roomCode}
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            {isHost ? 'Invite an opponent and choose game deck settings.' : 'Waiting for host to start the match...'}
          </p>
        </div>

        {/* Copy Invite Link */}
        <button
          type="button"
          onClick={onCopyRoomCode}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-100 bg-slate-800/80 hover:bg-slate-700/80 transition-all border border-slate-700/60 shadow-lg"
        >
          {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
          <span>{copiedCode ? 'Link Copied!' : 'Copy Room Link'}</span>
        </button>
      </div>

      {/* Players Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Host (Player 1) */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-amber-500/50 flex items-center justify-center text-2xl">
            {playerAvatar?.startsWith('https://') ? (
              <Image src={playerAvatar} alt={playerName} fill className="object-cover" unoptimized />
            ) : (
              <span>{playerAvatar || '🎮'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-base truncate">{playerName || 'Host'}</h4>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {isHost ? 'Host (You)' : 'Host'}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Ready in Lobby</p>
          </div>
        </div>

        {/* Opponent (Player 2) */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          {opponentName ? (
            <>
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-cyan-500/50 flex items-center justify-center text-2xl">
                {opponentAvatar?.startsWith('https://') ? (
                  <Image src={opponentAvatar} alt={opponentName} fill className="object-cover" unoptimized />
                ) : (
                  <span>{opponentAvatar || '👾'}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base truncate">{opponentName}</h4>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {!isHost ? 'You' : 'Challenger'}
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
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 transition-all flex items-center gap-1.5"
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
            <select
              value={turnTimerSetting}
              onChange={(e) => onChangeTimer(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value={30}>30s (Fast)</option>
              <option value={45}>45s (Standard)</option>
              <option value={60}>60s (Relaxed)</option>
              <option value={90}>90s (Casual)</option>
            </select>
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
          className="w-full py-4 rounded-2xl text-slate-950 font-black text-base bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-40 disabled:hover:from-amber-400 flex items-center justify-center gap-2"
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
