'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStatus, WinReason, QuestionLogItem, CardSetTemplate } from '@/types/game';
import { createClient } from '@/lib/supabase/client';

interface UseMultiplayerRoomParams {
  roomCode: string;
  isUnlocked: boolean;
  hasSetIdentity: boolean;
  presenceKey: string;
  playerName: string;
  playerAvatar: string;
  isHost: boolean;
  initialTemplate: CardSetTemplate;
}

export function useMultiplayerRoom({
  roomCode,
  isUnlocked,
  hasSetIdentity,
  presenceKey,
  playerName,
  playerAvatar,
  isHost,
  initialTemplate,
}: UseMultiplayerRoomParams) {
  const supabase = createClient();

  /* ── Room Identity & Players ───────────────────────────────────── */
  const [connectedPlayers, setConnectedPlayers] = useState<string[]>([]);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [opponentAvatar, setOpponentAvatar] = useState<string | null>(null);
  const [disconnectSeconds, setDisconnectSeconds] = useState<number | null>(null);

  /* ── Authoritative Shared Game Room State ─────────────────────── */
  const [gameStatus, setGameStatus] = useState<GameStatus>('setup');
  const [turnTimerSetting, setTurnTimerSetting] = useState<number>(60);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);
  const [turnStartedAt, setTurnStartedAt] = useState<number | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [winReason, setWinReason] = useState<WinReason | null>(null);
  const [gameRound, setGameRound] = useState<number>(1);
  const [isMyReady, setIsMyReady] = useState<boolean>(false);
  const [isOpponentReady, setIsOpponentReady] = useState<boolean>(false);

  /* ── Card Secret & Flips State ───────────────────────────────── */
  const [playerSecretId, setPlayerSecretId] = useState<string | null>(null);
  const [opponentSecretId, setOpponentSecretId] = useState<string | null>(null);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<QuestionLogItem[]>([]);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const gameStatusRef = useRef<GameStatus>(gameStatus);
  const localTurnStartAnchorRef = useRef<number>(0);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  /* ── Secret Card Persistence Helper (AUD-P1-01) ───────────────── */
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

  /* ── Flipped Cards Persistence Helper (AUD-P1-04) ──────────────── */
  const updateFlippedCardIds = useCallback(
    (action: string[] | ((prev: string[]) => string[])) => {
      setFlippedCardIds((prev) => {
        const next = typeof action === 'function' ? action(prev) : action;
        if (typeof window !== 'undefined') {
          if (next.length > 0) {
            sessionStorage.setItem(`room_${roomCode}_flips`, JSON.stringify(next));
          } else {
            sessionStorage.removeItem(`room_${roomCode}_flips`);
          }
        }
        return next;
      });
    },
    [roomCode]
  );

  /* ── DB Room State Synchronization Helper ─────────────────────── */
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
          selectedSetId: stateUpdate.selectedSetId || initialTemplate.id,
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
    [initialTemplate.id, currentTurnPlayerId, gameRound, gameStatus, roomCode, supabase, turnStartedAt, turnTimerSetting, winReason, winnerId]
  );

  /* ── Initial Room State Rehydration on Connect/Refresh ────────── */
  useEffect(() => {
    if (!isUnlocked || !hasSetIdentity) return;

    async function rehydrateRoomState() {
      try {
        const { data: roomData } = await supabase
          .from('game_rooms')
          .select('status, state, template_id, updated_at')
          .eq('code', roomCode)
          .maybeSingle();

        if (roomData && roomData.state) {
          const s = roomData.state as Record<string, unknown>;
          queueMicrotask(() => {
            if (roomData.updated_at) {
              const serverTime = Date.parse(roomData.updated_at);
              if (!isNaN(serverTime)) {
                const elapsedSinceDbUpdate = Math.max(0, Math.floor((Date.now() - serverTime) / 1000));
                localTurnStartAnchorRef.current = Date.now() - (elapsedSinceDbUpdate * 1000);
              }
            }
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

  /* ── Realtime Supabase Channel Subscriptions ─────────────────── */
  useEffect(() => {
    if (!isUnlocked || !hasSetIdentity || !presenceKey) return;

    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: { key: presenceKey },
      },
    });
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<{
        playerName?: string;
        playerAvatar?: string;
        isHost?: boolean;
      }>();
      const presenceKeys = Object.keys(state);
      setConnectedPlayers(presenceKeys);

      const otherPresenceKey = presenceKeys.find((k) => k !== presenceKey);
      if (otherPresenceKey && state[otherPresenceKey]?.length > 0) {
        const oppData = state[otherPresenceKey][0];
        const oppName =
          oppData.playerName ||
          (otherPresenceKey.includes(' ')
            ? otherPresenceKey.slice(otherPresenceKey.indexOf(' ') + 1)
            : otherPresenceKey);
        const oppAvatar =
          oppData.playerAvatar ||
          (otherPresenceKey.startsWith('https://')
            ? otherPresenceKey.slice(0, otherPresenceKey.indexOf(' '))
            : null);

        setOpponentName(oppName);
        setOpponentAvatar(oppAvatar || null);

        setDisconnectSeconds((prev) => {
          if (prev !== null) {
            setChatMessages((c) => [
              ...c,
              {
                id: Math.random().toString(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: 'system',
                question: 'Opponent reconnected!',
              },
            ]);
          }
          return null;
        });
      } else {
        setOpponentName(null);
        setOpponentAvatar(null);
        setIsOpponentReady(false);
        const currentStatus = gameStatusRef.current;
        if (currentStatus === 'active' || currentStatus === 'selecting_character') {
          setDisconnectSeconds((prev) => (prev === null ? 30 : prev));
        }
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          playerName,
          playerAvatar,
          isHost,
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isUnlocked, hasSetIdentity, presenceKey, roomCode, supabase, playerName, playerAvatar, isHost]);

  /* ── 30-Second Disconnect Countdown (AUD-P1-02) ───────────────── */
  useEffect(() => {
    if (disconnectSeconds === null) return;

    if (disconnectSeconds <= 0) {
      queueMicrotask(() => {
        setWinnerId(presenceKey);
        setWinReason('disconnect');
        setGameStatus('finished');
        setDisconnectSeconds(null);
      });
      return;
    }

    const timer = setInterval(() => {
      setDisconnectSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [disconnectSeconds, presenceKey]);

  return {
    supabase,
    connectedPlayers,
    opponentName,
    setOpponentName,
    opponentAvatar,
    setOpponentAvatar,
    disconnectSeconds,
    setDisconnectSeconds,
    gameStatus,
    setGameStatus,
    turnTimerSetting,
    setTurnTimerSetting,
    currentTurnPlayerId,
    setCurrentTurnPlayerId,
    turnStartedAt,
    setTurnStartedAt,
    winnerId,
    setWinnerId,
    winReason,
    setWinReason,
    gameRound,
    setGameRound,
    isMyReady,
    setIsMyReady,
    isOpponentReady,
    setIsOpponentReady,
    playerSecretId,
    setPlayerSecretId,
    updatePlayerSecretId,
    opponentSecretId,
    setOpponentSecretId,
    flippedCardIds,
    setFlippedCardIds,
    updateFlippedCardIds,
    chatMessages,
    setChatMessages,
    channelRef,
    localTurnStartAnchorRef,
    syncRoomStateToDb,
  };
}
