'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CardSetTemplate, CharacterCard, QuestionLogItem } from '@/types/game';
import { createClient } from '@/lib/supabase/client';
import { CardFlip } from './CardFlip';
import { GuessModal } from './GuessModal';
import { VictoryModal } from './VictoryModal';
import { soundFx } from '@/lib/audio';
import { Eye, Volume2, VolumeX, MessageSquare, Send, Copy, Check, ArrowLeft, Lock, RotateCcw } from 'lucide-react';
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

  const [isUnlocked, setIsUnlocked] = useState<boolean>(!requiredPassword);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [passError, setPassError] = useState<string | null>(null);

  const [playerName, setPlayerName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`room_${roomCode}_name`) || `Player_${Math.floor(Math.random() * 1000)}`;
    }
    return `Player_${Math.floor(Math.random() * 1000)}`;
  });

  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [opponentSecretId, setOpponentSecretId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<QuestionLogItem[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [selectedGuessCard, setSelectedGuessCard] = useState<CharacterCard | null>(null);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const supabase = createClient();

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
      if (other) {
        setOpponentName(other);
      }
    });

    channel.on('broadcast', { event: 'game_event' }, ({ payload }) => {
      if (payload.type === 'secret_selected') {
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
  }, [roomCode, playerName, isUnlocked]);

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

  const handleResetFlips = () => {
    setFlippedCardIds([]);
  };

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

  const playerSecretCard = template.cards.find((c) => c.id === playerSecretId) || null;
  const opponentSecretCard = template.cards.find((c) => c.id === opponentSecretId) || null;
  const standingCardsCount = template.cards.length - flippedCardIds.length;

  if (!isUnlocked) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-20">
        <div className="game-panel p-8 rounded-3xl border border-amber-500/40 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Password Protected Room</h2>
          <p className="text-slate-400 text-xs mb-6">Enter passcode to join Room #{roomCode}</p>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              required
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Enter Room Passcode"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-center text-white focus:outline-none focus:border-amber-400"
            />
            {passError && <p className="text-rose-400 text-xs font-semibold">{passError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
            >
              Unlock Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center">
      {/* Top Header Bar */}
      <div className="w-full game-panel p-4 rounded-3xl mb-6 flex items-center justify-between gap-4 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-widest text-amber-400 font-mono whitespace-nowrap">
                #{roomCode}
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 whitespace-nowrap hidden sm:inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Online
              </span>
            </div>
            <p className="text-slate-400 text-xs font-semibold whitespace-nowrap">
              Set: {template.title} • {template.cards.length} Cards
            </p>
          </div>
        </div>

        {/* Players & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Secret Card Widget */}
          {playerSecretCard && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950 border border-amber-400/50 shadow-md">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider whitespace-nowrap">Secret:</span>
              <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-amber-400 shrink-0">
                <Image
                  src={playerSecretCard.imageUrl}
                  alt={playerSecretCard.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-xs font-extrabold text-white whitespace-nowrap hidden sm:inline">{playerSecretCard.name}</span>
            </div>
          )}

          {/* Copy Invite Link */}
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            title="Copy Invite Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span className="whitespace-nowrap">{copiedLink ? 'Copied!' : 'Invite'}</span>
          </button>

          {/* Audio Mute Button */}
          <button
            type="button"
            onClick={() => setIsMuted(soundFx.toggleMute())}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Secret Card Selection Overlay */}
      {!isSecretSelected ? (
        <div className="w-full game-panel p-6 sm:p-8 rounded-3xl mb-8 text-center flex flex-col items-center border border-amber-500/40 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mb-1 whitespace-nowrap">
            Select Your Secret Character Card
          </h3>
          <p className="text-slate-300 text-xs max-w-md mb-6 whitespace-nowrap">
            Pick your secret character for this match!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 w-full">
            {template.cards.map((card) => (
              <CardFlip
                key={card.id}
                card={card}
                isFlippingDown={false}
                isSelectable={true}
                onToggleFlip={() => {}}
                onSelectSecret={handleSelectSecret}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
          {/* Main Card Grid */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="w-full game-panel p-3.5 sm:p-4 rounded-2xl mb-6 flex items-center justify-between gap-4 border border-white/10">
              <span className="text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                {standingCardsCount} / {template.cards.length} Remaining
              </span>

              <button
                type="button"
                onClick={() => {
                  soundFx.playCardFlip(false);
                  handleResetFlips();
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Flips</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 w-full">
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

          {/* In-Game Realtime Chat Box */}
          <div className="lg:col-span-1 game-panel p-4 sm:p-5 rounded-3xl border border-white/10 flex flex-col justify-between h-[620px] shadow-2xl">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <h4 className="font-extrabold text-white text-sm whitespace-nowrap">Room Chat</h4>
                </div>
                <span className="text-[10px] font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 truncate max-w-[120px]">
                  {opponentName ? `VS ${opponentName}` : 'Waiting player...'}
                </span>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
                {chatMessages.length === 0 ? (
                  <div className="text-slate-500 text-xs text-center py-12 px-2">
                    <p className="font-semibold mb-1">No messages yet!</p>
                    <p className="text-[11px] text-slate-600">Ask questions like "Does your character have blonde hair?"</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    if (msg.sender === 'system') {
                      return (
                        <div key={msg.id} className="w-full text-center py-1.5 px-2 my-0.5">
                          <div className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-2xl text-center leading-normal break-words w-full inline-block">
                            ✨ {msg.question}
                          </div>
                        </div>
                      );
                    }

                    const isMe = msg.senderId === playerName || msg.senderName === playerName;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[88%] ${
                          isMe ? 'self-end items-end' : 'self-start items-start'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5 px-1">
                          <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">
                            {isMe ? 'You' : msg.senderName || 'Opponent'}
                          </span>
                          <span className="text-[9px] text-slate-500 whitespace-nowrap">{msg.timestamp}</span>
                        </div>
                        <div
                          className={`p-2.5 rounded-2xl text-xs font-medium leading-relaxed break-words max-w-full ${
                            isMe
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-tr-none font-semibold shadow-md'
                              : 'bg-slate-900 border border-slate-700/80 text-slate-100 rounded-tl-none'
                          }`}
                        >
                          <p className="break-words">{msg.question}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-3 border-t border-white/10 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black transition-transform hover:scale-105 shadow-md shrink-0"
              >
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
