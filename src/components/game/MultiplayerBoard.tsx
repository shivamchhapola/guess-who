'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CardSetTemplate, CharacterCard, QuestionLogItem, SharedRoomState, SharedPlayer, GameStatus, WinReason } from '@/types/game';
import { createClient } from '@/lib/supabase/client';
import { CardFlip } from './CardFlip';
import { GuessModal } from './GuessModal';
import { VictoryModal } from './VictoryModal';
import { soundFx } from '@/lib/audio';
import {
  Eye, Volume2, VolumeX, MessageSquare, Send, Copy, Check,
  ArrowLeft, Lock, RotateCcw, ChevronDown, ChevronUp,
  CheckCircle2, Clock, UserCheck, Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
  const [playerSecretId, setPlayerSecretId] = useState<string | null>(null);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [isSecretSelected, setIsSecretSelected] = useState<boolean>(false);
  const [isOpponentReady, setIsOpponentReady] = useState<boolean>(false);

  const [isUnlocked, setIsUnlocked] = useState<boolean>(!requiredPassword);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [passError, setPassError] = useState<string | null>(null);

  const [playerName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`room_${roomCode}_name`) || `Player_${Math.floor(Math.random() * 1000)}`;
    }
    return `Player_${Math.floor(Math.random() * 1000)}`;
  });

  const [isHost] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`room_${roomCode}_role`) === 'host';
    }
    return false;
  });

  const [sharedRoomState, setSharedRoomState] = useState<SharedRoomState>(() => ({
    roomId: roomCode,
    hostPlayerId: isHost ? playerName : '',
    players: {
      [playerName]: {
        id: playerName,
        nickname: playerName,
        avatar: '',
        isHost,
        isReady: false,
        connected: true,
      },
    },
    selectedSetId: template.id,
    gameStatus: 'setup',
    currentTurnPlayerId: null,
    turnTimerSetting: 60,
    turnStartedAt: null,
    winnerPlayerId: null,
    winReason: null,
    gameRound: 1,
  }));

  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [opponentSecretId, setOpponentSecretId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<QuestionLogItem[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

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

  const [currentTemplate, setCurrentTemplate] = useState<CardSetTemplate>(template);

  useEffect(() => {
    if (template && template.id) {
      setCurrentTemplate(template);
    }
  }, [template]);

  useEffect(() => {
    if (!isUnlocked) return;

    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: { key: playerName },
      },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const players = Object.keys(state);
      const other = players.find((p) => p !== playerName);
      if (other) setOpponentName(other);
    });

    channel.on('broadcast', { event: 'game_event' }, ({ payload }) => {
      if (payload.type === 'shared_state_sync') {
        if (payload.sharedState) {
          setSharedRoomState(payload.sharedState);
        }
      } else if (payload.type === 'template_changed') {
        if (payload.template) {
          setCurrentTemplate(payload.template);
          setPlayerSecretId(null);
          setIsSecretSelected(false);
          setIsOpponentReady(false);
          setFlippedCardIds([]);
          setSharedRoomState((prev) => ({
            ...prev,
            selectedSetId: payload.template.id,
          }));
          setChatMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sender: 'system',
              question: `Host changed character deck to "${payload.template.title}"`,
            },
          ]);
        }
      } else if (payload.type === 'player_ready') {
        if (payload.sender !== playerName) {
          setIsOpponentReady(true);
          setChatMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sender: 'system',
              question: `${payload.sender} chosen their secret character!`,
            },
          ]);
        }
      } else if (payload.type === 'secret_selected') {
        if (payload.sender !== playerName) {
          setIsOpponentReady(true);
          setOpponentSecretId(payload.cardId);
        }
      } else if (payload.type === 'turn_assigned') {
        if (payload.sharedState) {
          setSharedRoomState(payload.sharedState);
        } else if (payload.currentTurnPlayerId) {
          setSharedRoomState((prev) => ({
            ...prev,
            gameStatus: 'active',
            currentTurnPlayerId: payload.currentTurnPlayerId,
            turnStartedAt: Date.now(),
          }));
        }
        soundFx.playSelect();
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: 'system',
            question: `Match started! ${payload.currentTurnPlayerId === playerName ? 'You go first!' : `${payload.currentTurnPlayerId} goes first!`}`,
          },
        ]);
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
  }, [roomCode, playerName, isUnlocked]);

  // Host random turn assignment when both players become ready
  useEffect(() => {
    if (isHost && isSecretSelected && isOpponentReady && !sharedRoomState.currentTurnPlayerId) {
      const candidates = [playerName];
      if (opponentName) candidates.push(opponentName);
      const chosenStarter = candidates[Math.floor(Math.random() * candidates.length)];

      const updatedState: SharedRoomState = {
        ...sharedRoomState,
        gameStatus: 'active',
        currentTurnPlayerId: chosenStarter,
        turnStartedAt: Date.now(),
      };
      setSharedRoomState(updatedState);

      const channel = supabase.channel(`room:${roomCode}`);
      channel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: {
          type: 'turn_assigned',
          currentTurnPlayerId: chosenStarter,
          sharedState: updatedState,
        },
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'system',
          question: `Match started! ${chosenStarter === playerName ? 'You go first!' : `${chosenStarter} goes first!`}`,
        },
      ]);
    }
  }, [isHost, isSecretSelected, isOpponentReady, sharedRoomState, playerName, opponentName, roomCode, supabase]);

  const handleHostChangeTemplate = async (newTemplate: CardSetTemplate) => {
    if (!isHost) return;
    soundFx.playSelect();
    setCurrentTemplate(newTemplate);
    setPlayerSecretId(null);
    setIsSecretSelected(false);
    setFlippedCardIds([]);

    const updatedSharedState: SharedRoomState = {
      ...sharedRoomState,
      selectedSetId: newTemplate.id,
    };
    setSharedRoomState(updatedSharedState);

    // Broadcast template change to all connected clients
    const channel = supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'template_changed', template: newTemplate },
    });
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'shared_state_sync', sharedState: updatedSharedState },
    });

    // Update Database using correct column 'code'
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newTemplate.id);
      await supabase
        .from('game_rooms')
        .update({
          template_id: isUuid ? newTemplate.id : null,
          state: {
            selectedTemplateId: newTemplate.id,
            sharedState: updatedSharedState,
          },
        })
        .eq('code', roomCode);
    } catch (err) {
      console.warn('Failed to update room template in DB:', err);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === requiredPassword) {
      setIsUnlocked(true);
      setPassError(null);
    } else {
      setPassError('Incorrect room password.');
    }
  };

  const handleSelectSecret = (cardId: string) => {
    setPlayerSecretId(cardId);
    setIsSecretSelected(true);
    soundFx.playSelect();

    setSharedRoomState((prev) => ({
      ...prev,
      players: {
        ...prev.players,
        [playerName]: {
          ...(prev.players[playerName] || {
            id: playerName,
            nickname: playerName,
            avatar: '',
            isHost,
            connected: true,
          }),
          isReady: true,
        },
      },
    }));

    const channel = supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'player_ready', sender: playerName, isReady: true },
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
      question: chatInput,
    };

    setChatMessages((prev) => [...prev, item]);
    setChatInput('');

    const channel = supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'chat_message', item },
    });
  };

  const handleCopyInviteLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenGuessModal = (card: CharacterCard) => {
    setSelectedGuessCard(card);
    setIsGuessModalOpen(true);
  };

  const handleConfirmGuess = (card: CharacterCard) => {
    setIsGuessModalOpen(false);
    const isWinner = opponentSecretId ? card.id === opponentSecretId : true;

    if (isWinner) {
      setGameResult('won');
    } else {
      setGameResult('lost');
    }

    const channel = supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: {
        type: 'declare_victory',
        winner: isWinner ? playerName : opponentName || 'Opponent',
      },
    });
  };

  const playerSecretCard = currentTemplate.cards.find((c) => c.id === playerSecretId) || null;
  const opponentSecretCard = currentTemplate.cards.find((c) => c.id === opponentSecretId) || null;
  const standingCardsCount = currentTemplate.cards.length - flippedCardIds.length;

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

  /* ── Main Game Board ───────────────────────────────────────── */
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col">

      {/* ── Top Header Bar ──────────────────────────────────── */}
      <div className="game-panel px-4 py-3 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-3"
        style={{ border: '1px solid rgba(255,255,255,0.09)' }}>

        {/* Left: back + room info */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-300 hover:text-white transition-colors shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-widest text-amber-400 font-mono">#{roomCode}</span>
              <span className="hidden sm:inline-flex text-[10px] font-black uppercase px-2 py-0.5 rounded-full items-center gap-1"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            </div>
            <p className="text-slate-500 text-[11px] font-semibold truncate">{currentTemplate.title} · {currentTemplate.cards.length} cards</p>
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

      {/* ── Secret Selection & Readiness Gate ─────────────────── */}
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
          <p className="text-slate-400 text-sm max-w-md mb-4">
            Pick one card — your opponent will try to guess which one it is!
          </p>

          {/* Player Readiness Status Bar */}
          <div className="flex items-center justify-center gap-4 mb-6 text-xs font-bold">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950 border border-amber-500/30 text-amber-400">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>You: <strong>Selecting...</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950 border border-white/10 text-slate-400">
              {isOpponentReady ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Opponent: <strong className="text-emerald-400">Ready ✓</strong></span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
                  <span>Opponent: <strong className="text-slate-400">Selecting...</strong></span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 w-full">
            {currentTemplate.cards.map((card) => (
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
      ) : !isOpponentReady ? (
        /* ── Waiting for Opponent Readiness Gate ─────────────── */
        <div className="w-full game-panel p-8 rounded-3xl mb-6 text-center flex flex-col items-center animate-in fade-in"
          style={{ border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(7,12,24,0.95)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Waiting for Opponent Selection
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
            You have chosen your character! The match will unlock as soon as <span className="text-cyan-400 font-bold">{opponentName || 'your opponent'}</span> selects theirs.
          </p>

          <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-white/10 max-w-sm w-full">
            <div className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>You: Ready</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Opponent: Choosing</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── Active Game in Progress ─────────────────────────────── */
        <div className="flex flex-col lg:flex-row gap-4 w-full">

          {/* Card Grid Column */}
          <div className="flex-1 min-w-0">
            {/* Status Bar */}
            <div className="game-panel px-4 py-3 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-3"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                  {standingCardsCount} / {currentTemplate.cards.length} Standing
                </span>

                {/* Turn Indicator Banner */}
                {sharedRoomState.currentTurnPlayerId ? (
                  sharedRoomState.currentTurnPlayerId === playerName ? (
                    <span className="px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1.5 animate-pulse">
                      ⚡ YOUR TURN
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      <span>{opponentName || 'Opponent'}'s Turn</span>
                    </span>
                  )
                ) : (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 bg-white/5 border border-white/10">
                    Assigning Turn...
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
              {currentTemplate.cards.map((card) => (
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
    </div>
  );
};
