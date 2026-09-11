'use client';

import React from 'react';
import Image from 'next/image';
import {
  ArrowLeft, ArrowRight, Check, Clock, Copy, Eye, Play, RefreshCw,
  Search, Users, X,
} from 'lucide-react';
import { CardSetTemplate } from '@/types/game';
import { SetPreviewModal } from '../../SetPreviewModal';

interface MultiplayerLobbyProps {
  roomCode: string;
  isHost: boolean;
  playerName: string;
  playerAvatar: string;
  opponentName: string | null;
  opponentAvatar: string | null;
  copiedCode: boolean;
  currentTemplate: CardSetTemplate;
  turnTimerSetting: number;
  isChangeSetOpen: boolean;
  filteredTemplates: CardSetTemplate[];
  previewingTemplate: CardSetTemplate | null;
  showLeaveModal: boolean;
  onCopyRoomCode: () => void;
  onRequestLeave: () => void;
  onCloseLeave: () => void;
  onConfirmLeave: () => void;
  onPreviewTemplate: (template: CardSetTemplate | null) => void;
  onOpenChangeSet: () => void;
  onCloseChangeSet: () => void;
  onHostChangeTemplate: (template: CardSetTemplate) => void;
  onSetTurnTimer: (seconds: number) => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  roomCode,
  isHost,
  playerName,
  playerAvatar,
  opponentName,
  opponentAvatar,
  copiedCode,
  currentTemplate,
  turnTimerSetting,
  isChangeSetOpen,
  filteredTemplates,
  previewingTemplate,
  showLeaveModal,
  onCopyRoomCode,
  onRequestLeave,
  onCloseLeave,
  onConfirmLeave,
  onPreviewTemplate,
  onOpenChangeSet,
  onCloseChangeSet,
  onHostChangeTemplate,
  onSetTurnTimer,
}) => (
  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
    {/* Lobby Header Bar */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl game-panel border border-white/10 shadow-xl">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onRequestLeave}
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          title={isHost ? 'Back to room setup' : 'Leave room'}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400 block">GAME ROOM LOBBY</span>
            {isHost && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Host</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider">#{roomCode}</h1>
        </div>
      </div>

      <button
        type="button"
        onClick={onCopyRoomCode}
        className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        style={{
          background: copiedCode ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
          border: copiedCode ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.09)',
          color: copiedCode ? '#34d399' : '#e2e8f0',
        }}
      >
        {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-amber-400" />}
        <span>{copiedCode ? 'Code Copied!' : 'Copy Room Code'}</span>
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="game-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Users className="w-4 h-4 text-amber-400" />
              <span>PLAYERS</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{opponentName ? '2 / 2' : '1 / 2'}</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {playerAvatar && playerAvatar.startsWith('http') ? (
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={playerAvatar} alt="Avatar" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl shrink-0">{playerAvatar || (isHost ? '👑' : '🎮')}</div>
                )}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-bold text-white truncate">{playerName}</span>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0">You</span>
                </div>
              </div>
              {isHost && <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">HOST</span>}
            </div>

            {opponentName ? (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {opponentAvatar && opponentAvatar.startsWith('http') ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={opponentAvatar} alt="Opponent avatar" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl shrink-0">👾</div>
                  )}
                  <span className="text-sm font-bold text-white truncate">{opponentName}</span>
                </div>
                {!isHost && <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">HOST</span>}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-dashed border-white/15 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 font-bold shrink-0">○</div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-300 truncate">Waiting for opponent</span>
                    <span className="text-xs text-slate-500 truncate">Share room code with your friend.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="game-panel p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Pre-Game Status</h3>
          {isHost ? (
            <div className="flex flex-col gap-3">
              <p className="text-slate-400 text-xs leading-relaxed">
                {opponentName ? <span>Both players connected! Click <span className="text-amber-400 font-bold">Start Match</span> to proceed to character selection.</span> : <span>Waiting for second player. Share code <span className="font-mono text-amber-400 font-bold">#{roomCode}</span> to join.</span>}
              </p>
              {opponentName ? (
                <button type="button" onClick={onConfirmLeave} className="game-btn-primary w-full py-4 text-base rounded-2xl justify-center shadow-lg shadow-amber-500/20 font-bold flex items-center gap-2 mt-2 cursor-pointer transition-all hover:scale-[1.01]">
                  <Play className="w-5 h-5 fill-current shrink-0" /><span>Start Match</span><ArrowRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button type="button" disabled className="w-full py-4 text-xs sm:text-sm font-bold rounded-2xl bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center gap-2 mt-2 cursor-not-allowed opacity-75">
                  <div className="w-2 h-2 rounded-full bg-amber-400/60 animate-ping" /><span>Waiting for second player...</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3 text-cyan-300 text-xs font-bold">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" /><span>{opponentName ? 'Connected! Waiting for host to start match…' : 'Waiting for host to start match…'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="game-panel p-6 rounded-3xl border border-amber-500/30 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div><span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-0.5">Selected Deck</span><h3 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{currentTemplate.title}</h3></div>
            <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{currentTemplate.cards.length} Cards</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">{currentTemplate.description || 'Guess Who character deck.'}</p>
          <div className="grid grid-cols-4 gap-2 p-2 rounded-2xl bg-slate-950 border border-white/10 aspect-[3/1] overflow-hidden">
            {currentTemplate.cards.slice(0, 4).map((c) => <div key={c.id} className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-white/5"><Image src={c.imageUrl} alt={c.name} fill className="object-cover object-top" unoptimized /></div>)}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={() => onPreviewTemplate(currentTemplate)} className="py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-200 hover:text-white transition-colors flex-1 cursor-pointer"><Eye className="w-4 h-4 text-amber-400" /><span>Preview Cards</span></button>
            {isHost && <button type="button" onClick={onOpenChangeSet} className="py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors flex-1 cursor-pointer"><RefreshCw className="w-4 h-4" /><span>Change Deck</span></button>}
          </div>
        </div>

        {isHost && (
          <div className="game-panel p-6 rounded-3xl border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-400" /><h3 className="text-sm font-bold text-white">Turn Timer Setting</h3></div><span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">{turnTimerSetting === 0 ? 'Off' : `${turnTimerSetting}s`}</span></div>
            <p className="text-xs text-slate-400">Host can change time limit per turn before starting match:</p>
            <div className="grid grid-cols-5 gap-2 pt-1">
              {[0, 30, 60, 90, 120].map((sec) => <button key={sec} type="button" onClick={() => onSetTurnTimer(sec)} className={`py-2 rounded-xl text-xs font-bold border transition-all ${turnTimerSetting === sec ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>{sec === 0 ? 'Off' : `${sec}s`}</button>)}
            </div>
          </div>
        )}
      </div>
    </div>

    {isChangeSetOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={onCloseChangeSet}>
        <div className="glass-panel rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col p-6 sm:p-8 animate-slide-in-up shadow-2xl relative" style={{ border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(15, 23, 42, 0.95)' }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-white/10 shrink-0">
            <div><h2 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Select a Character Deck</h2><p className="text-slate-400 text-xs sm:text-sm mt-1">Choose a deck for this room. Players will see updates instantly.</p></div>
            <button type="button" onClick={onCloseChangeSet} className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0"><X className="w-5 h-5" /></button>
          </div>
          <div className="relative mb-3 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search sets by title, tag, or creator..." value={setSearchQuery} onChange={(e) => setSetSearchQuery(e.target.value)} className="w-full bg-slate-950/80 border border-white/15 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50" />
          </div>
          <div className="flex-1 overflow-y-auto pr-1 mb-4 min-h-[280px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTemplates.map((tpl) => {
                const isSelected = currentTemplate.id === tpl.id;
                return <div key={tpl.id} className={`p-4 rounded-2xl transition-all flex flex-col justify-between gap-3 ${isSelected ? 'border-2 border-amber-500 bg-amber-500/10' : 'border border-white/10 bg-slate-900/60'}`}>
                  <div><div className="flex items-start justify-between gap-2 mb-1"><h4 className="font-extrabold text-white text-base truncate">{tpl.title}</h4>{isSelected && <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">Selected</span>}</div><p className="text-slate-400 text-xs line-clamp-2 mb-3">{tpl.description}</p></div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10"><button type="button" onClick={() => onPreviewTemplate(tpl)} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/5 border border-white/10 flex-1">Preview</button>{!isSelected && <button type="button" onClick={() => onHostChangeTemplate(tpl)} className="game-btn-primary px-3 py-2 text-xs font-bold justify-center rounded-xl flex-1">Use This Set</button>}</div>
                </div>;
              })}
            </div>
          </div>
        </div>
      </div>
    )}

    <SetPreviewModal template={previewingTemplate} isOpen={Boolean(previewingTemplate)} onClose={() => onPreviewTemplate(null)} />
    {showLeaveModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="game-panel p-6 rounded-3xl max-w-md w-full border border-white/15 flex flex-col gap-4">
          <h3 className="text-xl font-extrabold text-white">Leave Game Room?</h3>
          <p className="text-slate-300 text-xs">Are you sure you want to leave room #{roomCode}?</p>
          <div className="flex items-center gap-3 pt-2"><button type="button" onClick={onCloseLeave} className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-300 bg-white/5">Cancel</button><button type="button" onClick={onConfirmLeave} className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-rose-600">Leave Room</button></div>
        </div>
      </div>
    )}
  </div>
);
