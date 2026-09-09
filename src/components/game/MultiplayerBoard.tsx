'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CardSetTemplate, CharacterCard, QuestionLogItem } from '@/types/game';
import { createClient } from '@/lib/supabase/client';
import { ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { CardFlip } from './CardFlip';
import { GuessModal } from './GuessModal';
import { VictoryModal } from './VictoryModal';
import { soundFx } from '@/lib/audio';
import {
  Eye, Volume2, VolumeX, MessageSquare, Send, Copy, Check,
  ArrowLeft, Lock, RotateCcw, ChevronDown, ChevronUp, Users,
  Play, RefreshCw, X, Sparkles, ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SetPreviewModal } from '../SetPreviewModal';
import { PlayerProfileSetup } from '../PlayerProfileSetup';

interface MultiplayerBoardProps {
  roomCode: string;
  template: CardSetTemplate;
  requiredPassword?: string | null;
}

export const MultiplayerBoard: React.FC<MultiplayerBoardProps> = ({
  roomCode,
  template,
  requiredPassword,
}) => {
  const router = useRouter();
  const [inLobby, setInLobby] = useState<boolean>(true);
  const [currentTemplate, setCurrentTemplate] = useState<CardSetTemplate>(template);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [isHost] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`room_${roomCode}_role`) === 'host';
    }
    return false;
  });
  const [connectedPlayers, setConnectedPlayers] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isChangeSetOpen, setIsChangeSetOpen] = useState<boolean>(false);
  const [availableTemplates] = useState<CardSetTemplate[]>([
    ...ALL_POPULAR_TEMPLATES,
    CLASSIC_GUESS_WHO_TEMPLATE,
  ]);

  const [playerSecretId, setPlayerSecretId] = useState<string | null>(null);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [isSecretSelected, setIsSecretSelected] = useState<boolean>(false);

  const [isUnlocked, setIsUnlocked] = useState<boolean>(!requiredPassword);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [passError, setPassError] = useState<string | null>(null);

  const [playerName, setPlayerName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`room_${roomCode}_name`) || '';
    }
    return '';
  });

  const [hasSetIdentity, setHasSetIdentity] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return Boolean(sessionStorage.getItem(`room_${roomCode}_name`));
    }
    return false;
  });

  const [joinNickname, setJoinNickname] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🎮');
  const [playerAvatar] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`room_${roomCode}_avatar`) || '';
    }
    return '';
  });

  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [opponentSecretId, setOpponentSecretId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<QuestionLogItem[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const [selectedGuessCard, setSelectedGuessCard] = useState<CharacterCard | null>(null);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const supabase = createClient();

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (template && template.id) {
      setCurrentTemplate(template);
    }
  }, [template]);

  useEffect(() => {
    if (!isUnlocked || !hasSetIdentity || !playerName) return;

    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: { key: playerName },
      },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const players = Object.keys(state);
      setConnectedPlayers(players);
      const other = players.find((p) => p !== playerName);
      if (other) setOpponentName(other);
    });

    channel.on('broadcast', { event: 'game_event' }, ({ payload }) => {
      if (payload.type === 'template_changed') {
        setCurrentTemplate(payload.template);
      } else if (payload.type === 'start_game') {
        setInLobby(false);
      } else if (payload.type === 'secret_selected') {
        if (payload.sender !== playerName) {
          setOpponentSecretId(payload.cardId);
          setChatMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sender: 'system',
              question: `${payload.sender} selected their secret card!`,
            },
          ]);
        }
      } else if (payload.type === 'chat_message') {
        setChatMessages((prev) => [...prev, payload.item]);
      } else if (payload.type === 'declare_victory') {
        if (payload.winner === playerName) {
          setGameResult('won');
        } else {
          setGameResult('lost');
        }
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, playerName, isUnlocked, hasSetIdentity]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === requiredPassword) {
      setIsUnlocked(true);
      setPassError(null);
    } else {
      setPassError('Incorrect room password.');
    }
  };

  const handleHostChangeTemplate = (newTemplate: CardSetTemplate) => {
    soundFx.playSelect();
    setCurrentTemplate(newTemplate);
    setIsChangeSetOpen(false);

    const channel = supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'template_changed', template: newTemplate },
    });
  };

  const handleStartGame = () => {
    soundFx.playSelect();
    setInLobby(false);

    const channel = supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'start_game', startedBy: playerName },
    });
  };

  const handleSelectSecret = (cardId: string) => {
    setPlayerSecretId(cardId);
    setIsSecretSelected(true);
    soundFx.playSelect();

    const channel = supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'secret_selected', sender: playerName, cardId },
    });
  };

  const handleToggleFlip = (cardId: string) => {
    setFlippedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleResetFlips = () => setFlippedCardIds([]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const item: QuestionLogItem = {
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'player',
      senderName: playerName,
      senderId: playerName,
      question: chatInput.trim(),
    };

    setChatMessages((prev) => [...prev, item]);
    setChatInput('');
    soundFx.playSelect();

    const channel = supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'chat_message', item },
    });
  };

  const handleCopyInviteLink = () => {
    soundFx.playSelect();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}/play/${roomCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyRoomCode = () => {
    soundFx.playSelect();
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleConfirmLeave = () => {
    soundFx.playSelect();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`room_${roomCode}_role`);
      sessionStorage.removeItem(`room_${roomCode}_name`);
      sessionStorage.removeItem(`room_${roomCode}_avatar`);
    }
    router.push(isHost ? '/host' : '/');
  };

  const handleOpenGuessModal = (card: CharacterCard) => {
    setSelectedGuessCard(card);
    setIsGuessModalOpen(true);
  };

  const handleConfirmGuess = (guessedCard: CharacterCard) => {
    const isCorrect = opponentSecretCard ? guessedCard.id === opponentSecretCard.id : true;

    if (isCorrect) {
      setGameResult('won');
      soundFx.playVictory();
    } else {
      setGameResult('lost');
      soundFx.playDefeat();
    }

    const channel = supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: {
        type: 'declare_victory',
        winner: isCorrect ? playerName : opponentName,
      },
    });
  };

  const playerSecretCard = currentTemplate.cards.find((c) => c.id === playerSecretId) || null;
  const opponentSecretCard = currentTemplate.cards.find((c) => c.id === opponentSecretId) || null;
  const standingCardsCount = currentTemplate.cards.length - flippedCardIds.length;

  /* ── Player Identity / Join Setup Gate ───────────────────────── */
  if (!hasSetIdentity) {
    const handleJoinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      soundFx.playSelect();

      if (requiredPassword && inputPassword !== requiredPassword) {
        setPassError('Incorrect room passcode.');
        return;
      }

      const nicknameToUse = joinNickname.trim() || 'Guest Player';
      const finalName = `${selectedAvatar} ${nicknameToUse}`;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${roomCode}_name`, finalName);
      }

      setPlayerName(finalName);
      setPassError(null);
      setIsUnlocked(true);
      setHasSetIdentity(true);
    };

    return (
      <div className="w-full max-w-lg mx-auto px-4 py-12 sm:py-16">
        <div
          className="game-panel p-6 sm:p-8 rounded-3xl text-left shadow-2xl animate-slide-in-up"
          style={{ border: '1px solid rgba(245,158,11,0.3)' }}
        >
          {/* Room Context Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-0.5">
                Joining Room
              </span>
              <h2 className="text-2xl font-black text-white font-mono tracking-wider">
                #{roomCode}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full block mb-1">
                {template.title}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block">
                {template.cards.length} Characters
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Your Player Profile
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Choose your nickname and avatar before entering the game room.
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="flex flex-col gap-6">
            <PlayerProfileSetup
              name={joinNickname}
              avatar={selectedAvatar}
              onNameChange={setJoinNickname}
              onAvatarChange={setSelectedAvatar}
              compact={false}
            />

            {/* Room Password Input (If Password Protected) */}
            {requiredPassword && (
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Room Passcode Required
                </label>
                <input
                  type="password"
                  required
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Enter room passcode"
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold text-white bg-slate-950 border border-amber-500/40 focus:border-amber-400 focus:outline-none"
                />
                {passError && (
                  <p className="text-rose-400 text-xs font-semibold mt-1.5">{passError}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="game-btn-primary w-full py-4 text-base rounded-2xl justify-center shadow-lg shadow-amber-500/20 font-bold flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              <span>Enter Room</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Password Gate ─────────────────────────────────────────── */
  if (!isUnlocked) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-20">
        <div className="game-panel p-8 rounded-3xl text-center shadow-2xl"
          style={{ border: '1px solid rgba(245,158,11,0.35)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Password Protected</h2>
          <p className="text-slate-400 text-sm mb-6">Enter the passcode for Room <span className="text-amber-400 font-mono font-black">#{roomCode}</span></p>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              required
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Room Passcode"
              className="w-full px-4 py-3 rounded-xl text-sm text-center text-white focus:outline-none"
              style={{ background: 'rgba(7,9,15,0.9)', border: '2px solid rgba(71,85,105,0.8)' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(71,85,105,0.8)')}
            />
            {passError && <p className="text-rose-400 text-xs font-semibold">{passError}</p>}
            <button type="submit" className="game-btn-primary w-full justify-center py-3">
              Unlock Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Room Lobby View (Pre-Game Context) ─────────────────────── */
  if (inLobby) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8">
        
        {/* Lobby Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl game-panel border border-white/10 shadow-xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setShowLeaveModal(true);
              }}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              title={isHost ? 'Back to room setup' : 'Leave room'}
              aria-label={isHost ? 'Back to room setup' : 'Leave room'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400 block">
                  GAME ROOM LOBBY
                </span>
                {isHost && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Host
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider">
                #{roomCode}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyRoomCode}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              style={{
                background: copiedCode ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                border: copiedCode ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.09)',
                color: copiedCode ? '#34d399' : '#e2e8f0',
              }}
              title="Copy room code"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span>{copiedCode ? 'Code Copied!' : 'Copy Room Code'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Players & Match Controls */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Players In Room (2-Player Capacity) */}
            <div className="game-panel p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>PLAYERS</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  {opponentName ? '2 / 2' : '1 / 2'}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Current Player Row */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {playerAvatar && playerAvatar.startsWith('http') ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={playerAvatar} alt="Avatar" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl shrink-0">
                        {playerAvatar || (isHost ? '👑' : '🎮')}
                      </div>
                    )}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold text-white truncate">
                        {playerName}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                        You
                      </span>
                    </div>
                  </div>
                  {isHost && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                      HOST
                    </span>
                  )}
                </div>

                {/* Opponent Player Row / Empty Slot */}
                {opponentName ? (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl shrink-0">
                        👾
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold text-white truncate">
                          {opponentName}
                        </span>
                        <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 shrink-0">
                          Connected
                        </span>
                      </div>
                    </div>
                    {!isHost && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                        HOST
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-dashed border-white/15 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 font-bold shrink-0">
                        ○
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-300 truncate">
                          Waiting for opponent
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                          Share room code with your friend.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyRoomCode}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      title="Copy room code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Match Controls */}
            <div className="game-panel p-6 rounded-3xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Pre-Game Status
              </h3>

              {isHost ? (
                <div className="flex flex-col gap-3">
                  <p className="text-slate-400 text-xs leading-relaxed">
                    You are the host. When everyone is ready, click <span className="text-amber-400 font-bold">Start Game</span> to begin character selection.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartGame}
                    className="game-btn-primary w-full py-4 text-base rounded-2xl justify-center shadow-lg shadow-amber-500/20 font-bold flex items-center gap-2 mt-2"
                  >
                    <Play className="w-5 h-5 fill-current shrink-0" />
                    <span>Start Game</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3 text-cyan-300 text-xs font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Waiting for the host to start the game…</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Currently Selected Set & Host Controls */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="game-panel p-6 rounded-3xl border border-amber-500/30 flex flex-col gap-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-0.5">
                    Selected Deck
                  </span>
                  <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {currentTemplate.title}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  {currentTemplate.cards.length} Cards
                </span>
              </div>

              <p className="text-slate-400 text-xs font-normal leading-relaxed">
                {currentTemplate.description || 'Guess Who character deck.'}
              </p>

              {/* 4-Card Artwork Preview Grid */}
              <div className="grid grid-cols-4 gap-2 p-2 rounded-2xl bg-slate-950 border border-white/10 aspect-[3/1] overflow-hidden">
                {currentTemplate.cards.slice(0, 4).map((c) => (
                  <div key={c.id} className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-white/5">
                    <Image src={c.imageUrl} alt={c.name} fill className="object-cover object-top" unoptimized />
                  </div>
                ))}
              </div>

              {/* Set Action Controls */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-200 hover:text-white transition-colors flex-1"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Preview Character Cards</span>
                </button>

                {isHost && (
                  <button
                    type="button"
                    onClick={() => setIsChangeSetOpen(true)}
                    className="py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors flex-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Change Deck</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Set Preview Modal */}
        {isPreviewOpen && (
          <div className="modal-backdrop" onClick={() => setIsPreviewOpen(false)}>
            <div
              className="glass-panel rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-slide-in-up"
              style={{ border: '1px solid rgba(245,158,11,0.3)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {currentTemplate.title}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">{currentTemplate.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
                {currentTemplate.cards.map((card) => (
                  <div key={card.id} className="flex flex-col items-center gap-1.5">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                      <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300 text-center leading-tight truncate w-full">
                      {card.name}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="game-btn-primary w-full py-3.5 text-sm justify-center"
              >
                Done Previewing
              </button>
            </div>
          </div>
        )}

        {/* Change Set Switcher Modal (For Host) */}
        {isChangeSetOpen && (
          <div className="modal-backdrop" onClick={() => setIsChangeSetOpen(false)}>
            <div
              className="glass-panel rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-slide-in-up"
              style={{ border: '1px solid rgba(139,92,246,0.3)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Select a Character Deck
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Choose a deck for this room. Everyone in the lobby will see the change instantly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangeSetOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {availableTemplates.map((tpl) => {
                  const isSelected = currentTemplate.id === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleHostChangeTemplate(tpl)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-2 border-amber-500 bg-amber-500/10 shadow-lg'
                          : 'border border-white/10 bg-slate-900/60 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-extrabold text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {tpl.title}
                        </h4>
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-3">{tpl.description}</p>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {tpl.cards.length} Cards
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsChangeSetOpen(false)}
                className="py-3 px-4 rounded-2xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 border border-white/10 w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Leave Confirmation Modal */}
        {showLeaveModal && (
          <div
            className="modal-backdrop z-50 fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
            onClick={() => setShowLeaveModal(false)}
          >
            <div
              className="game-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-white/15 shadow-2xl text-left flex flex-col gap-5 animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h3 className="text-xl font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {isHost ? 'Back to Room Setup?' : 'Leave Game Room?'}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  Are you sure you want to leave room <span className="font-mono font-bold text-amber-400">#{roomCode}</span>? Leaving will disconnect you from the active lobby.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLeave}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 border border-rose-500/30 transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  {isHost ? 'Leave & Setup' : 'Leave Room'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  /* ── Main Game Board ───────────────────────────────────────── */
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col">

      {/* ── Top Header Bar ──────────────────────────────────── */}
      <div className="game-panel px-4 py-3 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-3"
        style={{ border: '1px solid rgba(255,255,255,0.09)' }}>

        {/* Left: back + room info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            title="Leave Room"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-widest text-amber-400 font-mono">#{roomCode}</span>
              <span className="hidden sm:inline-flex text-[10px] font-black uppercase px-2 py-0.5 rounded-full items-center gap-1"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="text-left group flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors text-[11px] font-semibold truncate cursor-pointer"
            >
              <span className="truncate">{currentTemplate.title}</span>
              <span className="text-slate-600">•</span>
              <span className="shrink-0">{currentTemplate.cards.length} cards</span>
              <Eye className="w-3 h-3 text-slate-500 group-hover:text-amber-400 ml-0.5 shrink-0" />
            </button>
          </div>
        </div>

        {/* Right: secret card + invite + mute + chat toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Secret card widget */}
          {playerSecretCard && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">My secret</span>
              <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0" style={{ border: '1px solid rgba(245,158,11,0.6)' }}>
                <Image src={playerSecretCard.imageUrl} alt={playerSecretCard.name} fill className="object-cover" unoptimized />
              </div>
              <span className="text-xs font-bold text-white max-w-[80px] truncate">{playerSecretCard.name}</span>
            </div>
          )}

          {/* Invite */}
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
            style={{
              background: copiedLink ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
              border: copiedLink ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
              color: copiedLink ? '#34d399' : '#cbd5e1',
            }}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Invite'}</span>
          </button>

          {/* Mute */}
          <button
            type="button"
            onClick={() => setIsMuted(soundFx.toggleMute())}
            className="p-2 rounded-xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Chat toggle (mobile) */}
          <button
            type="button"
            onClick={() => setChatOpen(v => !v)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
            style={{
              background: chatOpen ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.06)',
              border: chatOpen ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)',
              color: chatOpen ? '#f59e0b' : '#94a3b8',
            }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {chatOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Chat Panel (collapsible) ─────────────────── */}
      {chatOpen && (
        <div className="lg:hidden game-panel p-4 rounded-2xl mb-4 flex flex-col gap-3"
          style={{ border: '1px solid rgba(255,255,255,0.09)', maxHeight: '380px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h4 className="font-extrabold text-white text-sm">Room Chat &amp; Questions</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {opponentName ? `VS ${opponentName}` : 'Waiting…'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ minHeight: 0 }}>
            {chatMessages.length === 0 ? (
              <p className="text-slate-600 text-xs text-center py-4">No messages yet. Ask a question below!</p>
            ) : (
              chatMessages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="text-[10px] font-bold text-amber-300 px-2 py-1 rounded-xl"
                        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        ✨ {msg.question}
                      </span>
                    </div>
                  );
                }
                const isMe = msg.senderId === playerName || msg.senderName === playerName;
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`px-3.5 py-2 rounded-2xl text-xs font-medium leading-relaxed break-words ${isMe
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-tr-none font-semibold'
                        : 'text-slate-100 rounded-tl-none'
                      }`}
                      style={!isMe ? { background: 'rgba(30,40,70,0.9)', border: '1px solid rgba(255,255,255,0.08)' } : {}}>
                      {msg.question}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {['Glasses?', 'Hat?', 'Blonde hair?', 'Facial hair?', 'Male?', 'Female?'].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setChatInput(`Does your character have ${q.toLowerCase()}`)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-300 shrink-0 transition-colors"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question (e.g. Do they wear glasses?)"
              className="flex-1 px-3 py-2.5 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
              style={{ background: 'rgba(7,9,15,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
            <button type="submit" className="p-2.5 rounded-xl shrink-0 font-bold text-xs flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#0a0f1a' }}>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ── Secret Selection Overlay ─────────────────────────── */}
      {!isSecretSelected ? (
        <div className="w-full game-panel p-5 sm:p-8 rounded-3xl mb-6 text-center flex flex-col items-center"
          style={{ border: '1px solid rgba(245,158,11,0.3)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Choose Your Secret Character
          </h3>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            Pick one card — your opponent will try to guess which one it is!
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 w-full">
            {template.cards.map((card) => (
              <CardFlip
                key={card.id}
                card={card}
                isFlippingDown={false}
                isSelectable={true}
                onToggleFlip={() => { }}
                onSelectSecret={handleSelectSecret}
              />
            ))}
          </div>
        </div>
      ) : (
        /* ── Game in Progress ─────────────────────────────── */
        <div className="flex flex-col lg:flex-row gap-4 w-full">

          {/* Card Grid Column */}
          <div className="flex-1 min-w-0">
            {/* Status Bar */}
            <div className="game-panel px-4 py-2.5 rounded-xl mb-4 flex items-center justify-between gap-3"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-3 py-1 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                  {standingCardsCount} / {template.cards.length} Standing
                </span>
                {opponentName && (
                  <span className="hidden sm:inline text-xs text-slate-400 font-semibold">
                    VS <span className="text-white">{opponentName}</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFx.playCardFlip(false);
                  handleResetFlips();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {template.cards.map((card) => (
                <CardFlip
                  key={card.id}
                  card={card}
                  isFlippingDown={flippedCardIds.includes(card.id)}
                  isSecret={card.id === playerSecretId}
                  isGuessable={true}
                  onToggleFlip={handleToggleFlip}
                  onMakeGuess={handleOpenGuessModal}
                />
              ))}
            </div>
          </div>

          {/* Desktop Chat Sidebar (Bigger & Roomier) */}
          <div className="hidden lg:flex flex-col w-80 xl:w-96 2xl:w-[420px] game-panel p-5 rounded-3xl shrink-0 lg:sticky lg:top-4"
            style={{ border: '1px solid rgba(255,255,255,0.1)', height: 'fit-content', maxHeight: 'calc(100vh - 5rem)' }}>
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-4 pb-3 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base leading-tight">Live Game Chat</h4>
                  <p className="text-[11px] text-slate-400">Ask questions &amp; chat with opponent</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-300 px-3 py-1 rounded-full truncate max-w-[130px]"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                {opponentName ? `VS ${opponentName}` : 'Waiting…'}
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1" style={{ minHeight: '340px', maxHeight: '520px' }}>
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/10 text-slate-500 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-slate-400 text-xs font-bold mb-1">No questions asked yet</p>
                  <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                    Use quick chips below or type a custom question to narrow down character features!
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="text-center py-1">
                        <span className="text-[11px] font-bold text-amber-300 px-3.5 py-1.5 rounded-2xl inline-block"
                          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                          ✨ {msg.question}
                        </span>
                      </div>
                    );
                  }
                  const isMe = msg.senderId === playerName || msg.senderName === playerName;
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[88%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                        {isMe ? 'You' : msg.senderName || 'Opponent'} · {msg.timestamp}
                      </span>
                      <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed break-words max-w-full ${isMe
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-tr-none font-bold shadow-md'
                          : 'text-slate-100 rounded-tl-none'
                        }`}
                        style={!isMe ? { background: 'rgba(25,35,60,0.95)', border: '1px solid rgba(255,255,255,0.09)' } : {}}>
                        {msg.question}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Question Chips */}
            <div className="mb-3 pt-2 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Quick Questions</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Does your character wear glasses?',
                  'Is your character male?',
                  'Does your character wear a hat?',
                  'Does your character have blonde hair?',
                  'Does your character have facial hair?'
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setChatInput(q)}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-amber-300 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 shrink-0 border-t border-white/5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question or type a message…"
                className="flex-1 px-4 py-3 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                style={{ background: 'rgba(7,9,15,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <button type="submit" className="p-3 rounded-2xl shrink-0 font-extrabold text-xs flex items-center justify-center transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#0a0f1a' }}>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <GuessModal
        card={selectedGuessCard}
        isOpen={isGuessModalOpen}
        onClose={() => setIsGuessModalOpen(false)}
        onConfirmGuess={handleConfirmGuess}
      />

      <VictoryModal
        isOpen={gameResult !== null}
        isWon={gameResult === 'won'}
        secretCard={opponentSecretCard}
        onPlayAgain={() => setGameResult(null)}
      />

      {/* Set Preview Drawer / Modal */}
      <SetPreviewModal
        template={currentTemplate}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="modal-backdrop" onClick={() => setShowExitConfirm(false)}>
          <div
            className="glass-panel p-6 sm:p-8 rounded-3xl max-w-sm w-full text-center animate-slide-in-up"
            style={{ border: '1px solid rgba(244,63,94,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <ArrowLeft className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Leave Game Room?
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Are you sure you want to exit room <strong className="text-amber-400">#{roomCode}</strong>? Your active match progress will end.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="game-btn-secondary flex-1 py-2.5 text-xs font-bold"
              >
                Stay in Room
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex-1 cursor-pointer"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
