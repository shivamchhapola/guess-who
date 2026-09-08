'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CardSetTemplate, CharacterCard, QuestionLogItem } from '@/types/game';
import { createClient } from '@/lib/supabase/client';
import { CardFlip } from './CardFlip';
import { QuestionAssistant } from './QuestionAssistant';
import { GuessModal } from './GuessModal';
import { VictoryModal } from './VictoryModal';
import { soundFx } from '@/lib/audio';
import { Eye, Volume2, VolumeX, MessageSquare, Send, Users, Shield, Copy, Check, ArrowLeft, Lock } from 'lucide-react';
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

  // Password unlock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!requiredPassword);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [passError, setPassError] = useState<string | null>(null);

  // Online Multiplayer State
  const [playerName, setPlayerName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`room_${roomCode}_name`) || `Player_${Math.floor(Math.random() * 1000)}`;
    }
    return `Player_${Math.floor(Math.random() * 1000)}`;
  });

  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [opponentSecretId, setOpponentSecretId] = useState<string | null>(null);
  const [turn, setTurn] = useState<'player' | 'opponent'>('player');
  const [chatMessages, setChatMessages] = useState<QuestionLogItem[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [selectedGuessCard, setSelectedGuessCard] = useState<CharacterCard | null>(null);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const supabase = createClient();

  // Supabase Realtime Channel Sync
  useEffect(() => {
    if (!isUnlocked) return;

    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: { key: playerName },
      },
    });

    // Track Player Presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const players = Object.keys(state);
      const other = players.find((p) => p !== playerName);
      if (other) {
        setOpponentName(other);
      }
    });

    // Handle Realtime Messages (Card Flips, Secret Selection, Chat, Victory)
    channel.on('broadcast', { event: 'game_event' }, ({ payload }) => {
      if (payload.type === 'secret_selected') {
        if (payload.sender !== playerName) {
          setOpponentSecretId(payload.cardId);
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

    // Broadcast secret selection to room
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

  const handleAutoFlipCards = (cardIdsToFlip: string[]) => {
    setFlippedCardIds((prev) => Array.from(new Set([...prev, ...cardIdsToFlip])));
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
      question: chatInput,
    };

    setChatMessages((prev) => [...prev, item]);
    setChatInput('');

    // Broadcast message
    const channel = supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'chat_message', item },
    });
  };

  const handleOpenGuessModal = (card: CharacterCard) => {
    setSelectedGuessCard(card);
    setIsGuessModalOpen(true);
  };

  const handleConfirmGuess = (card: CharacterCard) => {
    setIsGuessModalOpen(false);
    
    // Check win condition against opponent secret (or first card if practice)
    const isCorrect = opponentSecretId ? card.id === opponentSecretId : true;

    if (isCorrect) {
      setGameResult('won');
      const channel = supabase.channel(`room:${roomCode}`);
      channel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: { type: 'declare_victory', winner: playerName },
      });
    } else {
      setGameResult('lost');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const playerSecretCard = template.cards.find((c) => c.id === playerSecretId) || null;
  const opponentSecretCard = template.cards.find((c) => c.id === opponentSecretId) || null;

  // Render Password Lock Modal if locked
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
        <form onSubmit={handlePasswordSubmit} className="glass-panel w-full max-w-md p-8 rounded-3xl border border-amber-500/30 text-center flex flex-col items-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-100 mb-1">Passcode Required</h2>
          <p className="text-slate-400 text-xs mb-6">Room <span className="font-mono font-bold text-cyan-400">{roomCode}</span> is password protected.</p>

          {passError && (
            <p className="text-rose-400 text-xs font-semibold mb-4">{passError}</p>
          )}

          <input
            type="password"
            required
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Enter Room Passcode"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-sm font-bold text-slate-100 mb-4 focus:outline-none focus:border-amber-400"
          />

          <button
            type="submit"
            className="w-full py-3 font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg transition-all"
          >
            Unlock Room
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center">
      {/* Top Navigation & Online Room Bar */}
      <div className="w-full glass-panel p-4 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-4 border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xl text-cyan-400 tracking-wider">ROOM #{roomCode}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Copy Share Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-slate-400 text-xs">Playing: {template.title}</p>
          </div>
        </div>

        {/* Player & Opponent Status Badges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-slate-200">{playerName} (You)</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold text-slate-300">
              {opponentName ? opponentName : 'Waiting for Opponent...'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMuted(soundFx.toggleMute())}
            className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Secret Selection Overlay (If Not Picked Yet) */}
      {!isSecretSelected ? (
        <div className="w-full glass-panel p-8 rounded-3xl mb-8 text-center flex flex-col items-center border border-amber-500/30 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
            <Eye className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-100 mb-2">Pick Your Secret Character</h3>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            Click on any character card below to lock in your secret card for this online match!
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 w-full">
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
          {/* Main Card Grid (3 Columns) */}
          <div className="lg:col-span-3 flex flex-col">
            <QuestionAssistant
              cards={template.cards}
              flippedCardIds={flippedCardIds}
              onAutoFlipCards={handleAutoFlipCards}
              onResetFlips={handleResetFlips}
            />

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 w-full">
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

          {/* In-Game Realtime Chat & Questions Log (1 Column) */}
          <div className="lg:col-span-1 glass-panel p-4 rounded-3xl border border-white/10 flex flex-col justify-between h-[600px]">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-slate-200 text-sm">Room Chat & Log</h4>
              </div>

              {/* Chat Feed */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[460px] pr-1">
                {chatMessages.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-8">
                    No questions asked yet. Ask a question like "Does your character wear glasses?"
                  </p>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl text-xs ${
                        msg.sender === 'player'
                          ? 'bg-cyan-500/10 border border-cyan-500/20 text-slate-200 self-end'
                          : 'bg-slate-900 border border-slate-700 text-slate-300 self-start'
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 block mb-0.5">{msg.timestamp}</span>
                      <p>{msg.question}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-3 border-t border-white/10">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

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
