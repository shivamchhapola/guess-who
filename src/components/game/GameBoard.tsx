'use client';

import React, { useState, useEffect } from 'react';
import { CardSetTemplate, CharacterCard } from '@/types/game';
import { CardFlip } from './CardFlip';
import { GuessModal } from './GuessModal';
import { VictoryModal } from './VictoryModal';
import { soundFx } from '@/lib/audio';
import { Eye, Volume2, VolumeX, RotateCcw, ArrowLeft, Mic, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface GameBoardProps {
  template: CardSetTemplate;
}

export const GameBoard: React.FC<GameBoardProps> = ({ template }) => {
  const [playerSecretId, setPlayerSecretId] = useState<string | null>(null);
  const [opponentSecretId, setOpponentSecretId] = useState<string | null>(null);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [isSecretSelected, setIsSecretSelected] = useState<boolean>(false);
  
  const [selectedGuessCard, setSelectedGuessCard] = useState<CharacterCard | null>(null);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (template.cards.length > 0) {
      const randomIndex = Math.floor(Math.random() * template.cards.length);
      setOpponentSecretId(template.cards[randomIndex].id);
    }
  }, [template]);

  const handleSelectSecret = (cardId: string) => {
    setPlayerSecretId(cardId);
    setIsSecretSelected(true);
    soundFx.playSelect();
  };

  const handleToggleFlip = (cardId: string) => {
    setFlippedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleResetFlips = () => {
    setFlippedCardIds([]);
  };

  const handleOpenGuessModal = (card: CharacterCard) => {
    setSelectedGuessCard(card);
    setIsGuessModalOpen(true);
  };

  const handleConfirmGuess = (card: CharacterCard) => {
    setIsGuessModalOpen(false);
    if (card.id === opponentSecretId) {
      setGameResult('won');
    } else {
      setGameResult('lost');
    }
  };

  const handlePlayAgain = () => {
    setFlippedCardIds([]);
    setPlayerSecretId(null);
    setIsSecretSelected(false);
    setGameResult(null);
    setSelectedGuessCard(null);

    if (template.cards.length > 0) {
      const randomIndex = Math.floor(Math.random() * template.cards.length);
      setOpponentSecretId(template.cards[randomIndex].id);
    }
  };

  const playerSecretCard = template.cards.find((c) => c.id === playerSecretId) || null;
  const opponentSecretCard = template.cards.find((c) => c.id === opponentSecretId) || null;

  const standingCardsCount = template.cards.length - flippedCardIds.length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center">
      {/* Top Header Navigation & Controls */}
      <div className="w-full game-panel p-4 sm:p-5 rounded-3xl mb-6 flex flex-wrap items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="font-black text-white text-lg sm:text-2xl truncate tracking-tight">
              {template.title}
            </h2>
            <p className="text-slate-400 text-xs font-semibold">
              Practice Board • {template.cards.length} Cards
            </p>
          </div>
        </div>

        {/* Audio Mute & Secret Card Indicator */}
        <div className="flex items-center gap-3">
          {playerSecretCard && (
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-950 border border-amber-400/40 shadow-lg">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">Secret:</span>
              <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-amber-400">
                <Image
                  src={playerSecretCard.imageUrl}
                  alt={playerSecretCard.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-xs font-extrabold text-white">{playerSecretCard.name}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMuted(soundFx.toggleMute())}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Secret Card Pick Overlay */}
      {!isSecretSelected ? (
        <div className="w-full game-panel p-8 rounded-3xl mb-8 text-center flex flex-col items-center border border-amber-500/40 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
            <Eye className="w-7 h-7" />
          </div>
          <h3 className="text-3xl font-black text-white mb-2">
            Select Your Secret Character Card
          </h3>
          <p className="text-slate-300 text-sm max-w-md mb-8">
            Click on any card below to pick the secret character your opponent will try to guess!
          </p>

          {/* Cards Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 w-full">
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
        <>
          {/* Game Board Action Bar */}
          <div className="w-full game-panel p-4 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-4 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full uppercase tracking-wider">
                {standingCardsCount} / {template.cards.length} Standing
              </span>
              <span className="text-xs font-semibold text-slate-300 hidden sm:inline flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-amber-400 inline" /> Ask questions freely on Discord call or voice!
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playCardFlip(false);
                handleResetFlips();
              }}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Eliminated Cards</span>
            </button>
          </div>

          {/* Game Board Dynamic Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 w-full">
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
        </>
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
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
};
