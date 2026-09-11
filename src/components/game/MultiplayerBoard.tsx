'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CardSetTemplate, CharacterCard, QuestionLogItem, WinReason } from '@/types/game';
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
  RotateCcw, WifiOff,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SetPreviewModal } from '../SetPreviewModal';
import { matchesSearch } from '@/lib/setUtils';
import { generateRandomName, generateRandomAvatar } from '@/lib/randomIdentity';

import { useMultiplayerRoom } from '@/hooks/useMultiplayerRoom';
import { PreGameLobbyView } from './PreGameLobbyView';
import { GameChatLog } from './GameChatLog';
import { GameHeaderBar } from './GameHeaderBar';
import { CharacterSelectionBanner } from './CharacterSelectionBanner';
import { DeckChangeModal } from './DeckChangeModal';

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

  /* ── Modals & UI Controls ───────────────────────────────────────── */
  const [selectedGuessCard, setSelectedGuessCard] = useState<CharacterCard | null>(null);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState<boolean>(false);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [showSurrenderModal, setShowSurrenderModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.getMutedState());

  const hasLaunchedRef = useRef<boolean>(false);

  /* ── Room WebSocket & State Management Custom Hook ─────────────── */
  const room = useMultiplayerRoom({
    roomCode,
    isUnlocked,
    hasSetIdentity,
    presenceKey,
    playerName,
    playerAvatar,
    isHost,
    initialTemplate: currentTemplate,
  });

  const {
    opponentName,
    opponentAvatar,
    disconnectSeconds,
    gameStatus,
    setGameStatus,
    turnTimerSetting,
    setTurnTimerSetting,
    currentTurnPlayerId,
    setCurrentTurnPlayerId,
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
    updatePlayerSecretId,
    opponentSecretId,
    setOpponentSecretId,
    flippedCardIds,
    updateFlippedCardIds,
    chatMessages,
    setChatMessages,
    channelRef,
    localTurnStartAnchorRef,
    syncRoomStateToDb,
  } = room;

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
          updatePlayerSecretId(savedSecret);
          setIsMyReady(true);
        }

        const savedFlips = sessionStorage.getItem(`room_${roomCode}_flips`);
        if (savedFlips) {
          try {
            const parsed = JSON.parse(savedFlips);
            if (Array.isArray(parsed)) {
              updateFlippedCardIds(parsed);
            }
          } catch {
            // Ignore parse errors
          }
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
  }, [roomCode, setTurnTimerSetting, updateFlippedCardIds, updatePlayerSecretId, setIsMyReady]);

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

  /* ── Turn Timer Real-time Countdown ─────────────────────────────── */
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  const handleEndTurn = useCallback((reason?: 'timeout') => {
    if (currentTurnPlayerId !== playerName && reason !== 'timeout') return;

    soundFx.playSelect();
    const nextPlayer = opponentName || 'Opponent';
    const now = Date.now();

    setCurrentTurnPlayerId(nextPlayer);
    setTurnStartedAt(now);
    localTurnStartAnchorRef.current = now;

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
  }, [currentTurnPlayerId, opponentName, playerName, roomCode, supabase, syncRoomStateToDb, setCurrentTurnPlayerId, setTurnStartedAt, channelRef, localTurnStartAnchorRef]);

  useEffect(() => {
    if (gameStatus !== 'active' || !turnTimerSetting || turnTimerSetting === 0) {
      return;
    }

    if (localTurnStartAnchorRef.current === 0) {
      localTurnStartAnchorRef.current = Date.now();
    }

    const interval = setInterval(() => {
      const anchor = localTurnStartAnchorRef.current || Date.now();
      const elapsed = Math.floor((Date.now() - anchor) / 1000);
      const remaining = Math.max(0, turnTimerSetting - elapsed);
      setSecondsRemaining(remaining);

      if (remaining === 0 && currentTurnPlayerId === playerName) {
        handleEndTurn('timeout');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStatus, turnTimerSetting, currentTurnPlayerId, playerName, handleEndTurn, localTurnStartAnchorRef]);

  /* ── Host Launch Active Match ────────────────────────────────────── */
  const handleStartActiveMatch = useCallback(() => {
    if (hasLaunchedRef.current) return;
    hasLaunchedRef.current = true;

    const oppName = opponentName || 'Opponent';
    const startingPlayer = Math.random() < 0.5 ? playerName : oppName;
    const now = Date.now();

    setGameStatus('active');
    setCurrentTurnPlayerId(startingPlayer);
    setTurnStartedAt(now);
    localTurnStartAnchorRef.current = now;

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
  }, [opponentName, playerName, roomCode, supabase, syncRoomStateToDb, setGameStatus, setCurrentTurnPlayerId, setTurnStartedAt, channelRef, localTurnStartAnchorRef]);

  useEffect(() => {
    if (isHost && gameStatus === 'selecting_character' && isMyReady && isOpponentReady) {
      queueMicrotask(() => {
        handleStartActiveMatch();
      });
    }
  }, [isHost, gameStatus, isMyReady, isOpponentReady, handleStartActiveMatch]);

  /* ── Host Deck Switcher ─────────────────────────────────────────── */
  const handleHostChangeTemplate = async (newTemplate: CardSetTemplate) => {
    soundFx.playSelect();
    setCurrentTemplate(newTemplate);
    setIsChangeSetOpen(false);
    updatePlayerSecretId(null);
    setIsMyReady(false);
    setIsOpponentReady(false);
    updateFlippedCardIds([]);
    hasLaunchedRef.current = false;

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

  /* ── Secret Character Selection ─────────────────────────────────── */
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

  /* ── Toggle Card Elimination ─────────────────────────────────────── */
  const handleToggleFlip = (cardId: string) => {
    updateFlippedCardIds((prev) =>
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
    setGameStatus('setup');
    updatePlayerSecretId(null);
    setOpponentSecretId(null);
    setIsMyReady(false);
    setIsOpponentReady(false);
    updateFlippedCardIds([]);
    hasLaunchedRef.current = false;
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

  /* ── Send Chat Message Handler ───────────────────────────────────── */
  const handleSendChatMessage = (messageText: string) => {
    const item: QuestionLogItem = {
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'player',
      senderName: playerName,
      senderId: playerName,
      question: messageText,
    };

    setChatMessages((prev) => [...prev, item]);

    const channel = channelRef.current || supabase.channel(`room:${roomCode}`);
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { type: 'chat_message', item },
    });
  };

  /* ── Clipboard & Leave Actions ───────────────────────────────────── */
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

  /* ── SSR Hydration Guard ────────────────────────────────────────── */
  if (!isMounted) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-400 font-bold text-sm">Entering room...</p>
      </div>
    );
  }

  /* ── Room Password Gate ─────────────────────────────────────────── */
  if (!isUnlocked && requiredPassword) {
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
            setPassError('Incorrect passcode.');
          }
        }}
      />
    );
  }

  /* ── Guest Player Setup Gate ────────────────────────────────────── */
  if (!hasSetIdentity) {
    return (
      <JoinIdentityGate
        joinNickname={joinNickname}
        setJoinNickname={setJoinNickname}
        selectedAvatar={selectedAvatar}
        setSelectedAvatar={setSelectedAvatar}
        requiredPassword={requiredPassword}
        inputPassword={inputPassword}
        setInputPassword={setInputPassword}
        passError={passError}
        onSubmit={(e) => {
          e.preventDefault();
          if (requiredPassword && inputPassword !== requiredPassword) {
            setPassError('Incorrect passcode.');
            return;
          }
          const fullPresenceKey = selectedAvatar.startsWith('https://')
            ? `${selectedAvatar} ${joinNickname.trim()}`
            : joinNickname.trim();

          sessionStorage.setItem(`room_${roomCode}_name`, fullPresenceKey);
          sessionStorage.setItem(`room_${roomCode}_avatar`, selectedAvatar);
          sessionStorage.setItem(`room_${roomCode}_role`, 'guest');

          setPresenceKey(fullPresenceKey);
          setPlayerName(joinNickname.trim());
          setPlayerAvatar(selectedAvatar);
          setHasSetIdentity(true);
          setIsUnlocked(true);
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col min-h-[calc(100vh-80px)]">

      {/* Disconnect Alert Banner (AUD-P1-02) */}
      {disconnectSeconds !== null && (
        <div className="w-full p-4 mb-4 rounded-2xl bg-rose-950/90 border border-rose-500/60 text-white flex items-center justify-between shadow-xl animate-bounce">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-rose-400" />
            <div>
              <div className="font-bold text-sm">Opponent Disconnected!</div>
              <div className="text-xs text-rose-200">
                Waiting for opponent to reconnect... Granting victory in {disconnectSeconds}s
              </div>
            </div>
          </div>
          <span className="font-mono font-black text-lg bg-rose-900/80 px-3 py-1 rounded-xl border border-rose-500/40">
            {disconnectSeconds}s
          </span>
        </div>
      )}

      {/* ── 1. Pre-Game Match Lobby Phase ──────────────────────────── */}
      {gameStatus === 'setup' && (
        <PreGameLobbyView
          roomCode={roomCode}
          isHost={isHost}
          playerName={playerName}
          playerAvatar={playerAvatar}
          opponentName={opponentName}
          opponentAvatar={opponentAvatar}
          currentTemplate={currentTemplate}
          turnTimerSetting={turnTimerSetting}
          copiedCode={copiedCode}
          onCopyRoomCode={handleCopyRoomCode}
          onChangeTimer={(sec) => {
            setTurnTimerSetting(sec);
            sessionStorage.setItem(`room_${roomCode}_timer`, String(sec));
            syncRoomStateToDb({ turnTimerSetting: sec });
          }}
          onOpenChangeSetModal={() => setIsChangeSetOpen(true)}
          onStartActiveMatch={handleHostStartGame}
        />
      )}

      {/* ── 2. Character Selection Phase ───────────────────────────── */}
      {gameStatus === 'selecting_character' && (
        <CharacterSelectionBanner
          cards={currentTemplate.cards}
          isMyReady={isMyReady}
          isOpponentReady={isOpponentReady}
          playerSecretId={playerSecretId}
          onSelectSecretCard={handleSelectSecretCard}
        />
      )}

      {/* ── 3. Active Gameplay & Finished Match Layout ─────────────── */}
      {(gameStatus === 'active' || gameStatus === 'finished') && (
        <>
          {/* Header Bar */}
          <GameHeaderBar
            roomCode={roomCode}
            currentTemplate={currentTemplate}
            playerSecretCard={playerSecretCard}
            currentTurnPlayerId={currentTurnPlayerId}
            presenceKey={playerName}
            secondsRemaining={secondsRemaining}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(soundFx.toggleMute())}
            onOpenSurrenderModal={() => setShowSurrenderModal(true)}
            onOpenLeaveModal={() => setShowLeaveModal(true)}
          />

          {/* Cards Grid & Chat Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full flex-1">
            {/* Left: 24-Card Elimination Grid (3 Cols on lg) */}
            <div className="lg:col-span-3 flex flex-col">
              {/* Standing Counter */}
              <div className="px-4 py-2 rounded-xl mb-3 bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400">
                  {standingCardsCount} / {currentTemplate.cards.length} Cards Standing
                </span>
                <button
                  type="button"
                  onClick={() => updateFlippedCardIds([])}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Board</span>
                </button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3 w-full">
                {currentTemplate.cards.map((card) => (
                  <CardFlip
                    key={card.id}
                    card={card}
                    isFlippingDown={flippedCardIds.includes(card.id)}
                    isSecret={card.id === playerSecretId}
                    isGuessable={gameStatus === 'active' && currentTurnPlayerId === playerName}
                    onToggleFlip={handleToggleFlip}
                    onMakeGuess={(c) => {
                      setSelectedGuessCard(c);
                      setIsGuessModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right: Match Chat & Question Log (1 Col on lg) */}
            <div className="lg:col-span-1">
              <GameChatLog
                chatMessages={chatMessages}
                presenceKey={playerName}
                onSendChatMessage={handleSendChatMessage}
                disabled={gameStatus === 'finished'}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Modals & Overlays ──────────────────────────────────────── */}
      <DeckChangeModal
        isOpen={isChangeSetOpen}
        onClose={() => setIsChangeSetOpen(false)}
        availableTemplates={filteredTemplates}
        searchQuery={setSearchQuery}
        onSearchChange={setSetSearchQuery}
        onSelectTemplate={handleHostChangeTemplate}
        onPreviewTemplate={(tpl) => setPreviewingTemplate(tpl)}
      />

      <SetPreviewModal
        template={previewingTemplate}
        isOpen={previewingTemplate !== null}
        onClose={() => setPreviewingTemplate(null)}
      />

      <GuessModal
        card={selectedGuessCard}
        isOpen={isGuessModalOpen}
        onClose={() => setIsGuessModalOpen(false)}
        onConfirmGuess={handleConfirmGuess}
      />

      <VictoryModal
        isOpen={winReason !== null || gameStatus === 'finished'}
        isWon={winnerId === playerName}
        secretCard={opponentSecretCard}
        onPlayAgain={handlePlayAgain}
      />

      {/* Surrender Confirmation Modal */}
      {showSurrenderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="game-panel w-full max-w-sm rounded-3xl p-6 text-center border border-rose-500/40 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-2">Surrender Match?</h3>
            <p className="text-slate-400 text-xs mb-6">Your opponent will be declared the match winner immediately.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowSurrenderModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSurrender}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30"
              >
                Confirm Surrender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Room Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="game-panel w-full max-w-sm rounded-3xl p-6 text-center border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-2">Leave Match?</h3>
            <p className="text-slate-400 text-xs mb-6">Are you sure you want to exit to the main menu?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Stay in Match
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20"
              >
                Leave Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
