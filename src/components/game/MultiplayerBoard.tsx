'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CardSetTemplate, CharacterCard } from '@/types/game';
import { ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { GuessModal } from './GuessModal';
import { VictoryModal } from './VictoryModal';
import { RoomPasswordGate } from './RoomPasswordGate';
import { JoinIdentityGate } from './JoinIdentityGate';
import { soundFx } from '@/lib/audio';
import { WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SetPreviewModal } from '../SetPreviewModal';
import { matchesSearch } from '@/lib/setUtils';
import { generateRandomName, generateRandomAvatar } from '@/lib/randomIdentity';

import { useMultiplayerRoom } from '@/hooks/useMultiplayerRoom';
import { PreGameLobbyView } from './PreGameLobbyView';
import { CharacterSelectionBanner } from './CharacterSelectionBanner';
import { ActiveGameView } from './ActiveGameView';
import { DeckChangeModal } from './DeckChangeModal';
import { SurrenderModal } from './SurrenderModal';
import { LeaveRoomModal } from './LeaveRoomModal';

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

  /* ── Identity & Security Gate State ────────────────────────────── */
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [presenceKey, setPresenceKey] = useState<string>('');
  const [hasSetIdentity, setHasSetIdentity] = useState<boolean>(false);
  const [joinNickname, setJoinNickname] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🎮');
  const [playerAvatar, setPlayerAvatar] = useState<string>('');

  const [isUnlocked, setIsUnlocked] = useState<boolean>(!requiredPassword);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [passError, setPassError] = useState<string | null>(null);

  /* ── Template & UI State ────────────────────────────────────────── */
  const [currentTemplate, setCurrentTemplate] = useState<CardSetTemplate>(template);
  const [isChangeSetOpen, setIsChangeSetOpen] = useState<boolean>(false);
  const [setSearchQuery, setSetSearchQuery] = useState<string>('');
  const [previewingTemplate, setPreviewingTemplate] = useState<CardSetTemplate | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<CardSetTemplate[]>([
    ...ALL_POPULAR_TEMPLATES,
    CLASSIC_GUESS_WHO_TEMPLATE,
  ]);

  const [selectedGuessCard, setSelectedGuessCard] = useState<CharacterCard | null>(null);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState<boolean>(false);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [showSurrenderModal, setShowSurrenderModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.getMutedState());

  /* ── Room Custom Hook ────────────────────────────────────────────── */
  const room = useMultiplayerRoom({
    roomCode,
    isUnlocked,
    hasSetIdentity,
    presenceKey,
    playerName,
    playerAvatar,
    isHost,
    initialTemplate: currentTemplate,
    onTemplateChangedByHost: (newTpl) => setCurrentTemplate(newTpl),
  });

  const {
    supabase,
    opponentName,
    opponentAvatar,
    disconnectSeconds,
    gameStatus,
    turnTimerSetting,
    setTurnTimerSetting,
    currentTurnPlayerId,
    setCurrentTurnPlayerId,
    setTurnStartedAt,
    winnerId,
    winReason,
    isMyReady,
    setIsMyReady,
    isOpponentReady,
    playerSecretId,
    updatePlayerSecretId,
    opponentSecretId,
    flippedCardIds,
    updateFlippedCardIds,
    chatMessages,
    localTurnStartAnchorRef,
    syncRoomStateToDb,
    handleStartActiveMatch,
    handleHostChangeTemplate,
    handleHostStartGame,
    handleSelectSecretCard,
    handleToggleFlip,
    handleConfirmGuess,
    handleSurrender,
    handlePlayAgain,
    handleSendChatMessage,
  } = room;

  /* ── Filtered Templates ─────────────────────────────────────────── */
  const filteredTemplates = useMemo(() => {
    return availableTemplates.filter((t) => matchesSearch(t, setSearchQuery));
  }, [availableTemplates, setSearchQuery]);

  /* ── Hydration & Session Identity Setup ──────────────────────────── */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      queueMicrotask(() => {
        setIsHost(sessionStorage.getItem(`room_${roomCode}_role`) === 'host');
        const rawName = sessionStorage.getItem(`room_${roomCode}_name`) || '';
        setPresenceKey(rawName);

        const savedTimer = sessionStorage.getItem(`room_${roomCode}_timer`);
        if (savedTimer) setTurnTimerSetting(Number(savedTimer));

        const savedSecret = sessionStorage.getItem(`room_${roomCode}_secret`);
        if (savedSecret) {
          updatePlayerSecretId(savedSecret);
          setIsMyReady(true);
        }

        const savedFlips = sessionStorage.getItem(`room_${roomCode}_flips`);
        if (savedFlips) {
          try {
            const parsed = JSON.parse(savedFlips);
            if (Array.isArray(parsed)) updateFlippedCardIds(parsed);
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

  /* ── Fetch Remote DB Templates for Lobby Selection ───────────────── */
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

  /* ── Turn Timer Countdown Clock ─────────────────────────────────── */
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  const handleEndTurn = useCallback((reason?: 'timeout') => {
    if (currentTurnPlayerId !== playerName && reason !== 'timeout') return;

    soundFx.playSelect();
    const nextPlayer = opponentName || 'Opponent';
    const now = Date.now();

    setCurrentTurnPlayerId(nextPlayer);
    setTurnStartedAt(now);
    localTurnStartAnchorRef.current = now;

    syncRoomStateToDb({
      status: 'active',
      currentTurnPlayerId: nextPlayer,
      turnStartedAt: now,
    });
  }, [currentTurnPlayerId, opponentName, playerName, syncRoomStateToDb, setCurrentTurnPlayerId, setTurnStartedAt, localTurnStartAnchorRef]);

  useEffect(() => {
    if (gameStatus !== 'active' || !turnTimerSetting || turnTimerSetting === 0) return;

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

  /* ── Auto-Start Active Match When Both Ready ─────────────────────── */
  useEffect(() => {
    if (isHost && gameStatus === 'selecting_character' && isMyReady && isOpponentReady) {
      queueMicrotask(() => {
        handleStartActiveMatch();
      });
    }
  }, [isHost, gameStatus, isMyReady, isOpponentReady, handleStartActiveMatch]);

  /* ── Clipboard & Navigation Handlers ────────────────────────────── */
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
        <ActiveGameView
          roomCode={roomCode}
          currentTemplate={currentTemplate}
          playerSecretCard={playerSecretCard}
          currentTurnPlayerId={currentTurnPlayerId}
          presenceKey={playerName}
          secondsRemaining={secondsRemaining}
          isMuted={isMuted}
          flippedCardIds={flippedCardIds}
          chatMessages={chatMessages}
          gameStatus={gameStatus}
          onToggleMute={() => setIsMuted(soundFx.toggleMute())}
          onOpenSurrenderModal={() => setShowSurrenderModal(true)}
          onOpenLeaveModal={() => setShowLeaveModal(true)}
          onResetFlips={() => updateFlippedCardIds([])}
          onToggleFlip={handleToggleFlip}
          onMakeGuess={(c) => {
            setSelectedGuessCard(c);
            setIsGuessModalOpen(true);
          }}
          onSendChatMessage={handleSendChatMessage}
        />
      )}

      {/* ── Modals & Overlays ──────────────────────────────────────── */}
      <DeckChangeModal
        isOpen={isChangeSetOpen}
        onClose={() => setIsChangeSetOpen(false)}
        availableTemplates={filteredTemplates}
        searchQuery={setSearchQuery}
        onSearchChange={setSetSearchQuery}
        onSelectTemplate={(newTpl) => {
          setCurrentTemplate(newTpl);
          handleHostChangeTemplate(newTpl);
          setIsChangeSetOpen(false);
        }}
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

      <SurrenderModal
        isOpen={showSurrenderModal}
        onClose={() => setShowSurrenderModal(false)}
        onConfirmSurrender={handleSurrender}
      />

      <LeaveRoomModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirmLeave={handleConfirmLeave}
      />
    </div>
  );
};
