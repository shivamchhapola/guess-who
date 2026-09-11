'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CardSetTemplate, CharacterCard, QuestionLogItem, GameStatus, WinReason, SharedRoomState } from '@/types/game';
import { createClient } from '@/lib/supabase/client';
import { ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { CardFlip } from './CardFlip';
import { GuessModal } from './GuessModal';
import { VictoryModal } from './VictoryModal';
import { RoomPasswordGate } from './RoomPasswordGate';
import { JoinIdentityGate } from './JoinIdentityGate';
import { soundFx } from '@/lib/audio';
import {
  Eye, MessageSquare, Send, Copy, Check,
  ArrowLeft, RotateCcw, Users,
  Play, RefreshCw, X, Search, Clock, Flag, ArrowRight, Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SetPreviewModal } from '../SetPreviewModal';
import { matchesSearch } from '@/lib/setUtils';
import { generateRandomName, generateRandomAvatar } from '@/lib/randomIdentity';

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
  const supabase = createClient();

  /* ── Core Local & Room Identity State ───────────────────────────── */
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [presenceKey, setPresenceKey] = useState<string>('');
  const [hasSetIdentity, setHasSetIdentity] = useState<boolean>(false);
  const [joinNickname, setJoinNickname] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🎮');
  const [playerAvatar, setPlayerAvatar] = useState<string>('');
  const [, setConnectedPlayers] = useState<string[]>([]);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [opponentAvatar, setOpponentAvatar] = useState<string | null>(null);

  /* ── Password Security Gate ─────────────────────────────────────── */
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!requiredPassword);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [passError, setPassError] = useState<string | null>(null);

  /* ── Template & Set Selection State ────────────────────────────── */
  const [currentTemplate, setCurrentTemplate] = useState<CardSetTemplate>(template);
  const [isChangeSetOpen, setIsChangeSetOpen] = useState<boolean>(false);
  const [setSearchQuery, setSetSearchQuery] = useState<string>('');
  const [selectedTagFilter] = useState<string | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<CardSetTemplate | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<CardSetTemplate[]>([
    ...ALL_POPULAR_TEMPLATES,
    CLASSIC_GUESS_WHO_TEMPLATE,
  ]);

  /* ── Gameplay & Card State ──────────────────────────────────────── */
  const [playerSecretId, setPlayerSecretId] = useState<string | null>(null);
  const [opponentSecretId, setOpponentSecretId] = useState<string | null>(null);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<QuestionLogItem[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [showSurrenderModal, setShowSurrenderModal] = useState<boolean>(false);
  const [showMobileSecretModal, setShowMobileSecretModal] = useState<boolean>(false);

  /* ── Authoritative 14-Task Shared Room State ─────────────────────── */
  const [gameStatus, setGameStatus] = useState<GameStatus>('setup'); // 'setup' | 'selecting_character' | 'active' | 'finished'
  const [turnTimerSetting, setTurnTimerSetting] = useState<number>(60);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);
  const [turnStartedAt, setTurnStartedAt] = useState<number | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [winReason, setWinReason] = useState<WinReason | null>(null);
  const [gameRound, setGameRound] = useState<number>(1);
  const [isMyReady, setIsMyReady] = useState<boolean>(false);
  const [isOpponentReady, setIsOpponentReady] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  /* ── Modals & UI Controls ───────────────────────────────────────── */
  const [selectedGuessCard, setSelectedGuessCard] = useState<CharacterCard | null>(null);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState<boolean>(false);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  /* ── Secret Card Persistence Helper (AUD-P1-01) ──────────────────── */
  const updatePlayerSecretId = useCallback(
    (secretId: string | null) => {
      setPlayerSecretId(secretId);
      if (typeof window !== 'undefined') {
        if (secretId) {
          sessionStorage.setItem(`room_${roomCode}_secret`, secretId);
        } else {
          sessionStorage.removeItem(`room_${roomCode}_secret`);
        }
      }
    },
    [roomCode]
  );

  /* ── Filtered Templates ─────────────────────────────────────────── */
  const filteredTemplates = useMemo(() => {
    return availableTemplates.filter((t) => {
      const queryMatch = matchesSearch(t, setSearchQuery);
      const tagMatch = !selectedTagFilter || (t.tags || []).includes(selectedTagFilter);
      return queryMatch && tagMatch;
    });
  }, [availableTemplates, setSearchQuery, selectedTagFilter]);

  /* ── Hydration & Session Identity Setup ──────────────────────────── */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      queueMicrotask(() => {
        setIsHost(sessionStorage.getItem(`room_${roomCode}_role`) === 'host');
        const rawName = sessionStorage.getItem(`room_${roomCode}_name`) || '';
        setPresenceKey(rawName);

        const savedTimer = sessionStorage.getItem(`room_${roomCode}_timer`);
        if (savedTimer) {
          setTurnTimerSetting(Number(savedTimer));
        }

        const savedSecret = sessionStorage.getItem(`room_${roomCode}_secret`);
        if (savedSecret) {
          setPlayerSecretId(savedSecret);
          setIsMyReady(true);
        }

        if (rawName.startsWith('https://')) {
          const spaceIdx = rawName.indexOf(' ');
          if (spaceIdx > 0) {
            setPlayerAvatar(rawName.slice(0, spaceIdx));
            setPlayerName(rawName.slice(spaceIdx + 1));
          } else {
            setPlayerName(rawName);
          }
        } else {
          setPlayerName(rawName);
          setPlayerAvatar(sessionStorage.getItem(`room_${roomCode}_avatar`) || '');
        }
        setHasSetIdentity(Boolean(rawName));
        setJoinNickname(generateRandomName());
        setSelectedAvatar(generateRandomAvatar());
        setIsMounted(true);
      });
    }
  }, [roomCode]);

  /* ── Scroll Chat Log ────────────────────────────────────────────── */
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  /* ── Sync Template Props ────────────────────────────────────────── */
  useEffect(() => {
    if (template && template.id) {
      queueMicrotask(() => {
        setCurrentTemplate(template);
      });
    }
  }, [template]);

  /* ── DB Room State Synchronization Helper ────────────────────────── */
  const syncRoomStateToDb = useCallback(
    async (stateUpdate: {
      status?: GameStatus;
      turnTimerSetting?: number;
      currentTurnPlayerId?: string | null;
      turnStartedAt?: number | null;
      winnerId?: string | null;
      winReason?: WinReason | null;
      gameRound?: number;
      selectedSetId?: string;
    }) => {
      try {
        const nextStatus = stateUpdate.status || gameStatus;
        const roomPayloadState = {
          gameStatus: nextStatus,
          turnTimerSetting: stateUpdate.turnTimerSetting ?? turnTimerSetting,
          currentTurnPlayerId: stateUpdate.currentTurnPlayerId !== undefined ? stateUpdate.currentTurnPlayerId : currentTurnPlayerId,
          turnStartedAt: stateUpdate.turnStartedAt !== undefined ? stateUpdate.turnStartedAt : turnStartedAt,
          winnerId: stateUpdate.winnerId !== undefined ? stateUpdate.winnerId : winnerId,
          winReason: stateUpdate.winReason !== undefined ? stateUpdate.winReason : winReason,
          gameRound: stateUpdate.gameRound ?? gameRound,
          selectedSetId: stateUpdate.selectedSetId || currentTemplate.id,
        };

        await supabase
          .from('game_rooms')
          .update({
            status: nextStatus,
            state: roomPayloadState,
            updated_at: new Date().toISOString(),
          })
          .eq('code', roomCode);
      } catch (err) {
        console.warn('Failed to sync room state to DB:', err);
      }
    },
    [currentTemplate.id, currentTurnPlayerId, gameRound, gameStatus, roomCode, supabase, turnStartedAt, turnTimerSetting, winReason, winnerId]
  );

  /* ── Initial Room State Rehydration on Connect/Refresh ───────────── */
  useEffect(() => {
    if (!isUnlocked || !hasSetIdentity) return;

    async function rehydrateRoomState() {
      try {
        const { data: roomData } = await supabase
          .from('game_rooms')
          .select('status, state, template_id')
          .eq('code', roomCode)
          .maybeSingle();

        if (roomData && roomData.state) {
          const s = roomData.state as Record<string, unknown>;
          queueMicrotask(() => {
            if (roomData.status || s.gameStatus) {
              setGameStatus((roomData.status || s.gameStatus) as GameStatus);
            }
            if (typeof s.turnTimerSetting === 'number') {
              setTurnTimerSetting(s.turnTimerSetting);
            }
            if (s.currentTurnPlayerId !== undefined) {
              setCurrentTurnPlayerId(s.currentTurnPlayerId as string | null);
            }
            if (s.turnStartedAt !== undefined) {
              setTurnStartedAt(s.turnStartedAt as number | null);
            }
            if (s.winnerId !== undefined) {
              setWinnerId(s.winnerId as string | null);
            }
            if (s.winReason !== undefined) {
              setWinReason(s.winReason as WinReason | null);
            }
            if (typeof s.gameRound === 'number') {
              setGameRound(s.gameRound);
            }
          });
        }
      } catch (err) {
        console.warn('Could not rehydrate room state from DB:', err);
      }
    }

    rehydrateRoomState();
  }, [isUnlocked, hasSetIdentity, roomCode, supabase]);

  /* ── Fetch DB Templates ─────────────────────────────────────────── */
  useEffect(() => {
    async function fetchAllTemplates() {
      try {
        const { data: dbTemplates } = await supabase
          .from('templates')
          .select('*, cards(*)')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (dbTemplates && dbTemplates.length > 0) {
          const formatted: CardSetTemplate[] = dbTemplates.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            creatorName: t.creator_name || 'Community Creator',
            isPublic: t.is_public,
            tags: t.tags || ['Custom'],
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            cards: (t.cards || []).map((c: { id: string; name: string; image_url: string; attributes: Record<string, unknown> }) => ({
              id: c.id,
              name: c.name,
              imageUrl: c.image_url,
              attributes: c.attributes || {},
            })),
          }));
          setAvailableTemplates([...ALL_POPULAR_TEMPLATES, CLASSIC_GUESS_WHO_TEMPLATE, ...formatted]);
        }
      } catch (err) {
        console.warn('Could not load remote templates for lobby:', err);
      }
    }
    fetchAllTemplates();
  }, [supabase]);

  /* ── Realtime Supabase Channel Subscriptions ────────────────────── */
  useEffect(() => {
    if (!isUnlocked || !hasSetIdentity || !presenceKey) return;

    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: { key: presenceKey },
      },
    });
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const players = Object.keys(state);
      setConnectedPlayers(players);
      const otherKey = players.find((p) => p !== presenceKey);
      if (otherKey) {
        const spaceIdx = otherKey.indexOf(' ');
        if (spaceIdx > 0 && otherKey.startsWith('https://')) {
          setOpponentAvatar(otherKey.slice(0, spaceIdx));
          setOpponentName(otherKey.slice(spaceIdx + 1));
        } else {
          setOpponentAvatar(null);
          setOpponentName(otherKey);
        }
      } else {
        setOpponentName(null);
        setOpponentAvatar(null);
        setIsOpponentReady(false);
      }
    });

    channel.on('broadcast', { event: 'game_event' }, ({ payload }) => {
      if (payload.type === 'shared_state_sync') {
        const s = payload.state as Partial<SharedRoomState>;
        if (s.status) setGameStatus(s.status);
        if (s.turnTimerSetting !== undefined) setTurnTimerSetting(s.turnTimerSetting);
        if (s.currentTurnPlayerId !== undefined) setCurrentTurnPlayerId(s.currentTurnPlayerId);
        if (s.turnStartedAt !== undefined) setTurnStartedAt(s.turnStartedAt);
        if (s.winnerId !== undefined) setWinnerId(s.winnerId);
        if (s.winReason !== undefined) setWinReason(s.winReason);
        if (s.gameRound !== undefined) setGameRound(s.gameRound);

        if (s.selectedSetId) {
          const matched = availableTemplates.find((t) => t.id === s.selectedSetId);
          if (matched && matched.id !== currentTemplate.id) {
            setCurrentTemplate(matched);
          }
        }

        if (s.players && playerName) {
          const me = s.players[playerName];
          if (me) setIsMyReady(me.isReady);
          const oppKey = Object.keys(s.players).find((k) => k !== playerName);
          if (oppKey) {
            setIsOpponentReady(s.players[oppKey].isReady);
          }
        }
      } else if (payload.type === 'template_changed') {
        setCurrentTemplate(payload.template);
        soundFx.playSelect();
        updatePlayerSecretId(null);
        setIsMyReady(false);
        setIsOpponentReady(false);
        setFlippedCardIds([]);
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: 'system',
            question: `Host updated character deck to "${payload.template.title}"`,
          },
        ]);
      } else if (payload.type === 'start_character_selection') {
        setGameStatus('selecting_character');
      } else if (payload.type === 'player_ready') {
        if (payload.sender !== playerName) {
          setIsOpponentReady(true);
          setChatMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sender: 'system',
              question: `${payload.sender} selected their secret character!`,
            },
          ]);
        }
      } else if (payload.type === 'game_started') {
        setGameStatus('active');
        setCurrentTurnPlayerId(payload.startingPlayerId);
        setTurnStartedAt(payload.turnStartedAt || Date.now());
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: 'system',
            question: `Match started! ${payload.startingPlayerId === playerName ? 'You start first!' : `${payload.startingPlayerId} starts first!`}`,
          },
        ]);
      } else if (payload.type === 'turn_changed') {
        setCurrentTurnPlayerId(payload.nextTurnPlayerId);
        setTurnStartedAt(payload.turnStartedAt || Date.now());
        soundFx.playSelect();
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: 'system',
            question: `Turn passed to ${payload.nextTurnPlayerId === playerName ? 'you' : payload.nextTurnPlayerId}`,
          },
        ]);
      } else if (payload.type === 'chat_message') {
        setChatMessages((prev) => [...prev, payload.item]);
        soundFx.playMessagePop();
      } else if (payload.type === 'declare_victory') {
        setGameStatus('finished');
        setWinnerId(payload.winnerId);
        setWinReason(payload.winReason);
        if (payload.secretCardId) setOpponentSecretId(payload.secretCardId);
      } else if (payload.type === 'new_round_started') {
        setGameStatus('setup'); // Return to lobby for settings / deck changes before starting next match
        updatePlayerSecretId(null);
        setOpponentSecretId(null);
        setIsMyReady(false);
        setIsOpponentReady(false);
        setFlippedCardIds([]);
        setWinnerId(null);
        setWinReason(null);
        setGameRound((r) => r + 1);
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: 'system',
            question: `Returned to lobby for Round ${payload.gameRound || 'New'}. Host can change settings or deck before starting!`,
          },
        ]);
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [roomCode, presenceKey, isUnlocked, hasSetIdentity, supabase, playerName, availableTemplates, currentTemplate.id, updatePlayerSecretId]);

  /* ── Pass Turn Action ───────────────────────────────────────────── */
  const handleEndTurn = useCallback((reason?: 'timeout') => {
    if (currentTurnPlayerId !== playerName && reason !== 'timeout') return;

    soundFx.playSelect();
    const nextPlayer = opponentName || 'Opponent';
    const now = Date.now();

    setCurrentTurnPlayerId(nextPlayer);
    setTurnStartedAt(now);

    const channel = channelRef.current || supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: {
        type: 'turn_changed',
        nextTurnPlayerId: nextPlayer,
        turnStartedAt: now,
        reason,
      },
    });

    syncRoomStateToDb({
      status: 'active',
      currentTurnPlayerId: nextPlayer,
      turnStartedAt: now,
    });
  }, [currentTurnPlayerId, opponentName, playerName, roomCode, supabase, syncRoomStateToDb]);

  /* ── Turn Timer Real-time Countdown ─────────────────────────────── */
  useEffect(() => {
    if (gameStatus !== 'active' || !turnTimerSetting || turnTimerSetting === 0 || !turnStartedAt) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - turnStartedAt) / 1000);
      const remaining = Math.max(0, turnTimerSetting - elapsed);
      setSecondsRemaining(remaining);

      if (remaining === 0 && currentTurnPlayerId === playerName) {
        handleEndTurn('timeout');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStatus, turnTimerSetting, turnStartedAt, currentTurnPlayerId, playerName, handleEndTurn]);

  /* ── Host Deck Switcher ─────────────────────────────────────────── */
  const handleHostChangeTemplate = async (newTemplate: CardSetTemplate) => {
    soundFx.playSelect();
    setCurrentTemplate(newTemplate);
    setIsChangeSetOpen(false);
    updatePlayerSecretId(null);
    setIsMyReady(false);
    setIsOpponentReady(false);
    setFlippedCardIds([]);

    setChatMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'system',
        question: `Host updated character deck to "${newTemplate.title}"`,
      },
    ]);

    const channel = channelRef.current || supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'template_changed', template: newTemplate },
    });

    syncRoomStateToDb({
      status: 'setup',
      selectedSetId: newTemplate.id,
    });

    try {
      await supabase
        .from('game_rooms')
        .update({ template_id: newTemplate.id })
        .eq('code', roomCode);
    } catch (err) {
      console.warn('Failed to update room template in DB:', err);
    }
  };

  /* ── Host Triggers Character Selection Phase ─────────────────────── */
  const handleHostStartGame = () => {
    soundFx.playSelect();
    setGameStatus('selecting_character');

    const channel = channelRef.current || supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'start_character_selection', startedBy: playerName },
    });

    syncRoomStateToDb({
      status: 'selecting_character',
    });
  };

  /* ── Secret Character Selection & Dual Readiness Gate ────────────── */
  const handleSelectSecretCard = (cardId: string) => {
    soundFx.playSelect();
    updatePlayerSecretId(cardId);
    setIsMyReady(true);

    const channel = channelRef.current || supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'player_ready', sender: playerName },
    });
  };

  /* ── Host Launches Active Match with Random First Turn ───────────── */
  const handleStartActiveMatch = useCallback(() => {
    const oppName = opponentName || 'Opponent';
    const startingPlayer = Math.random() < 0.5 ? playerName : oppName;
    const now = Date.now();

    setGameStatus('active');
    setCurrentTurnPlayerId(startingPlayer);
    setTurnStartedAt(now);

    const channel = channelRef.current || supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: {
        type: 'game_started',
        startingPlayerId: startingPlayer,
        turnStartedAt: now,
      },
    });

    syncRoomStateToDb({
      status: 'active',
      currentTurnPlayerId: startingPlayer,
      turnStartedAt: now,
    });
  }, [opponentName, playerName, roomCode, supabase, syncRoomStateToDb]);

  /* ── Host Auto-Start Active Match Listener ───────────────────────── */
  useEffect(() => {
    if (isHost && gameStatus === 'selecting_character' && isMyReady && isOpponentReady) {
      queueMicrotask(() => {
        handleStartActiveMatch();
      });
    }
  }, [isHost, gameStatus, isMyReady, isOpponentReady, handleStartActiveMatch]);

  /* ── Toggle Card Elimination ─────────────────────────────────────── */
  const handleToggleFlip = (cardId: string) => {
    setFlippedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  /* ── Final Guess Confirmation ────────────────────────────────────── */
  const handleConfirmGuess = (guessedCard: CharacterCard) => {
    setIsGuessModalOpen(false);
    const isCorrect = opponentSecretCard ? guessedCard.id === opponentSecretCard.id : true;
    const winningPlayer = isCorrect ? playerName : (opponentName || 'Opponent');
    const reason: WinReason = isCorrect ? 'correct_guess' : 'wrong_guess';

    setGameStatus('finished');
    setWinnerId(winningPlayer);
    setWinReason(reason);

    const channel = channelRef.current || supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: {
        type: 'declare_victory',
        winnerId: winningPlayer,
        winReason: reason,
        secretCardId: playerSecretId,
      },
    });

    syncRoomStateToDb({
      status: 'finished',
      winnerId: winningPlayer,
      winReason: reason,
    });
  };

  /* ── Surrender Match Action ──────────────────────────────────────── */
  const handleSurrender = () => {
    setShowSurrenderModal(false);
    const winningPlayer = opponentName || 'Opponent';

    setGameStatus('finished');
    setWinnerId(winningPlayer);
    setWinReason('surrender');

    const channel = channelRef.current || supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: {
        type: 'declare_victory',
        winnerId: winningPlayer,
        winReason: 'surrender',
        secretCardId: playerSecretId,
      },
    });

    syncRoomStateToDb({
      status: 'finished',
      winnerId: winningPlayer,
      winReason: 'surrender',
    });
  };

  /* ── Rematch / Play Again Action ─────────────────────────────────── */
  const handlePlayAgain = () => {
    const nextRound = gameRound + 1;
    setGameStatus('setup'); // Return to lobby for settings / deck changes before starting next match
    updatePlayerSecretId(null);
    setOpponentSecretId(null);
    setIsMyReady(false);
    setIsOpponentReady(false);
    setFlippedCardIds([]);
    setWinnerId(null);
    setWinReason(null);
    setGameRound(nextRound);

    const channel = channelRef.current || supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: {
        type: 'new_round_started',
        gameRound: nextRound,
      },
    });

    syncRoomStateToDb({
      status: 'setup',
      gameRound: nextRound,
      currentTurnPlayerId: null,
      turnStartedAt: null,
      winnerId: null,
      winReason: null,
    });
  };

  /* ── Send Chat Message ────────────────────────────────────────────── */
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

    const channel = channelRef.current || supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'chat_message', item },
    });
  };

  /* ── Clipboard Actions ───────────────────────────────────────────── */
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

  const playerSecretCard = currentTemplate.cards.find((c) => c.id === playerSecretId) || null;
  const opponentSecretCard = currentTemplate.cards.find((c) => c.id === opponentSecretId) || null;
  const standingCardsCount = currentTemplate.cards.length - flippedCardIds.length;
  const isMyTurn = currentTurnPlayerId === playerName;

  /* ── SSR Hydration Loading Guard ────────────────────────────────── */
  if (!isMounted) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold text-slate-400">Loading room…</span>
      </div>
    );
  }

  /* ── Player Identity Setup (Join Gate) ───────────────────────────── */
  if (!hasSetIdentity) {
    const handleJoinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      soundFx.playSelect();

      if (requiredPassword && inputPassword !== requiredPassword) {
        setPassError('Incorrect room passcode.');
        return;
      }

      const nicknameToUse = joinNickname.trim() || generateRandomName();
      const avatarUrl = selectedAvatar.startsWith('https://') ? selectedAvatar : '';
      const localPresenceKey = avatarUrl ? `${avatarUrl} ${nicknameToUse}` : nicknameToUse;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${roomCode}_name`, localPresenceKey);
        if (avatarUrl) sessionStorage.setItem(`room_${roomCode}_avatar`, avatarUrl);
      }

      setPlayerAvatar(avatarUrl);
      setPresenceKey(localPresenceKey);
      setPlayerName(nicknameToUse);
      setPassError(null);
      setIsUnlocked(true);
      setHasSetIdentity(true);
    };

    return (
      <JoinIdentityGate
        joinNickname={joinNickname}
        selectedAvatar={selectedAvatar}
        setJoinNickname={setJoinNickname}
        setSelectedAvatar={setSelectedAvatar}
        requiredPassword={requiredPassword}
        inputPassword={inputPassword}
        setInputPassword={setInputPassword}
        passError={passError}
        onSubmit={handleJoinSubmit}
      />
    );
  }

  /* ── Password Unlock Gate ────────────────────────────────────────── */
  if (!isUnlocked) {
    return (
      <RoomPasswordGate
        roomCode={roomCode}
        inputPassword={inputPassword}
        setInputPassword={setInputPassword}
        passError={passError}
        onSubmit={(e) => {
          e.preventDefault();
          if (inputPassword === requiredPassword) {
            setIsUnlocked(true);
            setPassError(null);
          } else {
            setPassError('Incorrect passcode');
          }
        }}
      />
    );
  }

  /* ── VIEW 1: PRE-GAME ROOM LOBBY (gameStatus === 'setup') ──────────── */
  if (gameStatus === 'setup') {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
        
        {/* Lobby Header Bar */}
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
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span>{copiedCode ? 'Code Copied!' : 'Copy Room Code'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Connected Players */}
          <div className="lg:col-span-6 flex flex-col gap-6">
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
                {/* Your Slot */}
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
                      <span className="text-sm font-bold text-white truncate">{playerName}</span>
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0">You</span>
                    </div>
                  </div>
                  {isHost && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                      HOST
                    </span>
                  )}
                </div>

                {/* Opponent Slot */}
                {opponentName ? (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {opponentAvatar && opponentAvatar.startsWith('http') ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={opponentAvatar} alt="Opponent avatar" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl shrink-0">
                          👾
                        </div>
                      )}
                      <span className="text-sm font-bold text-white truncate">{opponentName}</span>
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
                        <span className="text-sm font-bold text-slate-300 truncate">Waiting for opponent</span>
                        <span className="text-xs text-slate-500 truncate">Share room code with your friend.</span>
                      </div>
                    </div>
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
                    {opponentName ? (
                      <span>Both players connected! Click <span className="text-amber-400 font-bold">Start Match</span> to proceed to character selection.</span>
                    ) : (
                      <span>Waiting for second player. Share code <span className="font-mono text-amber-400 font-bold">#{roomCode}</span> to join.</span>
                    )}
                  </p>
                  {opponentName ? (
                    <button
                      type="button"
                      onClick={handleHostStartGame}
                      className="game-btn-primary w-full py-4 text-base rounded-2xl justify-center shadow-lg shadow-amber-500/20 font-bold flex items-center gap-2 mt-2 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <Play className="w-5 h-5 fill-current shrink-0" />
                      <span>Start Match</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-4 text-xs sm:text-sm font-bold rounded-2xl bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center gap-2 mt-2 cursor-not-allowed opacity-75"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-400/60 animate-ping" />
                      <span>Waiting for second player...</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3 text-cyan-300 text-xs font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>{opponentName ? 'Connected! Waiting for host to start match…' : 'Waiting for host to start match…'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Deck & Host Controls */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="game-panel p-6 rounded-3xl border border-amber-500/30 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-0.5">Selected Deck</span>
                  <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{currentTemplate.title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{currentTemplate.cards.length} Cards</span>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed">{currentTemplate.description || 'Guess Who character deck.'}</p>

              <div className="grid grid-cols-4 gap-2 p-2 rounded-2xl bg-slate-950 border border-white/10 aspect-[3/1] overflow-hidden">
                {currentTemplate.cards.slice(0, 4).map((c) => (
                  <div key={c.id} className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-white/5">
                    <Image src={c.imageUrl} alt={c.name} fill className="object-cover object-top" unoptimized />
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewingTemplate(currentTemplate)}
                  className="py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-200 hover:text-white transition-colors flex-1 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Preview Cards</span>
                </button>
                {isHost && (
                  <button
                    type="button"
                    onClick={() => setIsChangeSetOpen(true)}
                    className="py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors flex-1 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Change Deck</span>
                  </button>
                )}
              </div>
            </div>

            {/* Host Turn Timer Setting Switcher in Lobby */}
            {isHost && (
              <div className="game-panel p-6 rounded-3xl border border-white/10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Turn Timer Setting</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {turnTimerSetting === 0 ? 'Off' : `${turnTimerSetting}s`}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Host can change time limit per turn before starting match:</p>
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {[0, 30, 60, 90, 120].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setTurnTimerSetting(sec);
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem(`room_${roomCode}_timer`, String(sec));
                        }
                        const channel = channelRef.current || supabase.channel(`room:${roomCode}`);
                        channel.send({
                          type: 'broadcast',
                          event: 'game_event',
                          payload: {
                            type: 'shared_state_sync',
                            state: { turnTimerSetting: sec },
                          },
                        });
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        turnTimerSetting === sec
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sec === 0 ? 'Off' : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Set Selector Modal */}
        {isChangeSetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setIsChangeSetOpen(false)}>
            <div className="glass-panel rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col p-6 sm:p-8 animate-slide-in-up shadow-2xl relative" style={{ border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(15, 23, 42, 0.95)' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-white/10 shrink-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Select a Character Deck</h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">Choose a deck for this room. Players will see updates instantly.</p>
                </div>
                <button type="button" onClick={() => setIsChangeSetOpen(false)} className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-3 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search sets by title, tag, or creator..."
                  value={setSearchQuery}
                  onChange={(e) => setSetSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-1 mb-4 min-h-[280px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredTemplates.map((tpl) => {
                    const isSelected = currentTemplate.id === tpl.id;
                    return (
                      <div key={tpl.id} className={`p-4 rounded-2xl transition-all flex flex-col justify-between gap-3 ${isSelected ? 'border-2 border-amber-500 bg-amber-500/10' : 'border border-white/10 bg-slate-900/60'}`}>
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-extrabold text-white text-base truncate">{tpl.title}</h4>
                            {isSelected && <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">Selected</span>}
                          </div>
                          <p className="text-slate-400 text-xs line-clamp-2 mb-3">{tpl.description}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <button type="button" onClick={() => setPreviewingTemplate(tpl)} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/5 border border-white/10 flex-1">Preview</button>
                          {!isSelected && <button type="button" onClick={() => handleHostChangeTemplate(tpl)} className="game-btn-primary px-3 py-2 text-xs font-bold justify-center rounded-xl flex-1">Use This Set</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <SetPreviewModal template={previewingTemplate} isOpen={Boolean(previewingTemplate)} onClose={() => setPreviewingTemplate(null)} />
        {showLeaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="game-panel p-6 rounded-3xl max-w-md w-full border border-white/15 flex flex-col gap-4">
              <h3 className="text-xl font-extrabold text-white">Leave Game Room?</h3>
              <p className="text-slate-300 text-xs">Are you sure you want to leave room #{roomCode}?</p>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setShowLeaveModal(false)} className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-300 bg-white/5">Cancel</button>
                <button type="button" onClick={handleConfirmLeave} className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-rose-600">Leave Room</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── VIEW 2: CHARACTER SELECTION (gameStatus === 'selecting_character') ─── */
  if (gameStatus === 'selecting_character') {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        
        {/* Readiness Header Banner */}
        <div className="game-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
              STEP 1: SECRET SELECTION (ROUND #{gameRound})
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Select Your Secret Character
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Choose the character card your opponent will try to guess!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
              isMyReady ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isMyReady ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
              <span>You: {isMyReady ? 'Ready' : 'Selecting...'}</span>
            </div>

            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
              isOpponentReady ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-white/10'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOpponentReady ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{opponentName || 'Opponent'}: {isOpponentReady ? 'Ready' : 'Selecting...'}</span>
            </div>
          </div>
        </div>

        {/* Character Card Grid for Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {currentTemplate.cards.map((card) => {
            const isSelected = playerSecretId === card.id;
            return (
              <div
                key={card.id}
                onClick={() => handleSelectSecretCard(card.id)}
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all border-2 flex flex-col justify-end p-3 ${
                  isSelected
                    ? 'border-amber-400 ring-4 ring-amber-500/30 scale-[1.03] shadow-xl'
                    : 'border-white/10 hover:border-amber-400/60 hover:scale-[1.01]'
                }`}
              >
                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="relative z-10 text-center">
                  <span className="font-extrabold text-white text-xs block truncate mb-1">{card.name}</span>
                  {isSelected ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                      SECRET CHOICE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold text-[10px] uppercase">
                      SELECT
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isMyReady && !isOpponentReady && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Secret chosen! Waiting for opponent to select their secret character...</span>
          </div>
        )}
      </div>
    );
  }

  /* ── VIEW 3: ACTIVE GAMEPLAY & RESULTS (gameStatus === 'active' | 'finished') */
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4">
      
      {/* HUD Header Bar */}
      <div className="game-panel px-4 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-white/10 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10 transition-colors"
            title="Leave Match"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-widest text-amber-400 font-mono">#{roomCode}</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Round #{gameRound}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Secret Character Modal Trigger */}
        {playerSecretCard && (
          <button
            type="button"
            onClick={() => setShowMobileSecretModal(true)}
            className="lg:hidden px-3 py-1.5 rounded-xl text-amber-300 bg-amber-500/10 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5"
            title="View your secret character"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>My Secret</span>
          </button>
        )}

        {/* Turn Countdown Timer */}
        {turnTimerSetting > 0 && (
          <div className={`px-4 py-1.5 rounded-full text-xs font-mono font-extrabold flex items-center gap-1.5 border transition-all ${
            secondsRemaining <= 10
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* End Turn CTA */}
          {isMyTurn && (
            <button
              type="button"
              onClick={() => handleEndTurn()}
              className="py-1.5 px-3.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md transition-all hover:scale-105"
            >
              End Turn
            </button>
          )}

          {/* Surrender CTA */}
          <button
            type="button"
            onClick={() => setShowSurrenderModal(true)}
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
            title="Surrender Match"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Turn Guidance Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-lg transition-all ${
        isMyTurn
          ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border-amber-500/50 text-amber-300'
          : 'bg-gradient-to-r from-cyan-500/10 via-slate-900 to-cyan-500/10 border-cyan-500/30 text-cyan-300'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'}`} />
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider">
              {isMyTurn ? '⚡ YOUR TURN' : `⏳ OPPONENT'S TURN (${opponentName || 'Opponent'})`}
            </h2>
            <p className="text-xs text-slate-400">
              {isMyTurn ? 'Flip non-matching cards or click Guess on a card!' : 'Waiting for opponent to take their action...'}
            </p>
          </div>
        </div>
        {isMyTurn && (
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-400 text-slate-950">
            ACTIVE
          </span>
        )}
      </div>

      {/* Main Gameplay Grid & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Cards Grid */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400">
              Standing Characters: <span className="text-amber-400 font-extrabold">{standingCardsCount}</span> / {currentTemplate.cards.length}
            </span>
            <button
              type="button"
              onClick={() => setFlippedCardIds([])}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Flips
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {currentTemplate.cards.map((card) => (
              <CardFlip
                key={card.id}
                card={card}
                isFlippingDown={flippedCardIds.includes(card.id)}
                isSecret={card.id === playerSecretId}
                isGuessable={isMyTurn}
                onToggleFlip={handleToggleFlip}
                onMakeGuess={(c) => {
                  setSelectedGuessCard(c);
                  setIsGuessModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Desktop Sidebar Secret Character Widget & Chat */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Secret Character HUD Widget */}
          {playerSecretCard && (
            <div className="game-panel p-5 rounded-3xl border border-amber-500/40 flex flex-col items-center text-center shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">
                YOUR SECRET CHARACTER
              </span>
              <div className="relative w-24 h-32 rounded-2xl overflow-hidden border-2 border-amber-400 mb-3 shadow-lg bg-slate-950">
                <Image src={playerSecretCard.imageUrl} alt={playerSecretCard.name} fill className="object-cover" unoptimized />
              </div>
              <h3 className="text-lg font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {playerSecretCard.name}
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Keep this character safe! Opponent is trying to guess them.
              </p>
            </div>
          )}

          {/* Game Chat Log */}
          <div className="game-panel p-4 rounded-3xl border border-white/10 flex flex-col h-[380px]">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Room Chat Log
            </h4>
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 mb-3">
              {chatMessages.length === 0 ? (
                <p className="text-slate-500 text-xs italic text-center my-auto">No messages yet. Ask questions here!</p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`p-2.5 rounded-xl text-xs ${
                    msg.sender === 'system'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium'
                      : msg.senderName === playerName
                      ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 ml-4'
                      : 'bg-white/5 border border-white/10 text-slate-200 mr-4'
                  }`}>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5 font-mono">
                      <span>{msg.senderName || 'System'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p>{msg.question}</p>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button type="submit" className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Secret Character Modal */}
      {showMobileSecretModal && playerSecretCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowMobileSecretModal(false)}
        >
          <div
            className="game-panel p-6 rounded-3xl max-w-xs w-full border border-amber-500/40 text-center flex flex-col items-center shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">
              YOUR SECRET CHARACTER
            </span>
            <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-amber-400 mb-3 bg-slate-950">
              <Image src={playerSecretCard.imageUrl} alt={playerSecretCard.name} fill className="object-cover" unoptimized />
            </div>
            <h3 className="text-xl font-black text-white mb-1">{playerSecretCard.name}</h3>
            <p className="text-xs text-slate-400 mb-4">Keep this character safe from your opponent!</p>
            <button
              type="button"
              onClick={() => setShowMobileSecretModal(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-white/10 text-white hover:bg-white/20 border border-white/10"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Final Guess Modal */}
      {isGuessModalOpen && selectedGuessCard && (
        <GuessModal
          isOpen={isGuessModalOpen}
          card={selectedGuessCard}
          onConfirm={() => handleConfirmGuess(selectedGuessCard)}
          onCancel={() => setIsGuessModalOpen(false)}
        />
      )}

      {/* Surrender Confirmation Modal */}
      {showSurrenderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="game-panel p-6 rounded-3xl max-w-md w-full border border-rose-500/40 flex flex-col gap-4 text-center">
            <Flag className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-xl font-extrabold text-white">Surrender Match?</h3>
            <p className="text-slate-300 text-xs">Are you sure you want to forfeit this round to {opponentName || 'Opponent'}?</p>
            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={() => setShowSurrenderModal(false)} className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-300 bg-white/5">Cancel</button>
              <button type="button" onClick={handleSurrender} className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-rose-600">Surrender</button>
            </div>
          </div>
        </div>
      )}

      {/* Victory / Defeat Modal */}
      <VictoryModal
        isOpen={gameStatus === 'finished'}
        isWon={winnerId === playerName}
        winReason={winReason}
        winnerName={winnerId}
        guessedCard={selectedGuessCard}
        secretCard={playerSecretCard}
        opponentSecretCard={opponentSecretCard}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
};
