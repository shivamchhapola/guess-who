'use client';

import React, { useState, useEffect } from 'react';
import { CardSetTemplate, CharacterCard } from '@/types/game';
import { CardFlip } from './CardFlip';
import { GuessModal } from './GuessModal';
import { VictoryModal } from './VictoryModal';
import { soundFx } from '@/lib/audio';
import { Eye, Volume2, VolumeX, RotateCcw, ArrowLeft, Layers } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface GameBoardProps {
  template: CardSetTemplate;
  availableTemplates?: CardSetTemplate[];
  onSelectTemplate?: (templateId: string) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  template: initialTemplate,
  availableTemplates = [],
  onSelectTemplate,
}) => {
  const [currentTemplate, setCurrentTemplate] = useState<CardSetTemplate>(initialTemplate);
  const [playerSecretId, setPlayerSecretId] = useState<string | null>(null);
  const [opponentSecretId, setOpponentSecretId] = useState<string | null>(null);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [isSecretSelected, setIsSecretSelected] = useState<boolean>(false);

  const [selectedGuessCard, setSelectedGuessCard] = useState<CharacterCard | null>(null);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    setCurrentTemplate(initialTemplate);
    setFlippedCardIds([]);
    setPlayerSecretId(null);
    setIsSecretSelected(false);

    if (initialTemplate.cards.length > 0) {
      const randomIndex = Math.floor(Math.random() * initialTemplate.cards.length);
      setOpponentSecretId(initialTemplate.cards[randomIndex].id);
    }
  }, [initialTemplate]);

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

    if (currentTemplate.cards.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentTemplate.cards.length);
      setOpponentSecretId(currentTemplate.cards[randomIndex].id);
    }
  };

  const playerSecretCard = currentTemplate.cards.find((c) => c.id === playerSecretId) || null;
  const opponentSecretCard = currentTemplate.cards.find((c) => c.id === opponentSecretId) || null;
  const standingCardsCount = currentTemplate.cards.length - flippedCardIds.length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center">
      {/* Top Header Bar & Template Selector */}
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
              <h2 className="font-black text-white text-base sm:text-xl tracking-tight whitespace-nowrap">
                {currentTemplate.title}
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 whitespace-nowrap hidden sm:inline">
                Practice Mode
              </span>
            </div>
            <p className="text-slate-400 text-xs font-semibold whitespace-nowrap">
              {currentTemplate.cards.length} Cards Set
            </p>
          </div>
        </div>

        {/* Template Switching Control & Secret Card Widget */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Template Switcher Dropdown */}
          {availableTemplates.length > 0 && (
            <div className="relative flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-2xl px-3 py-2 text-xs">
              <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
              <select
                value={currentTemplate.id}
                onChange={(e) => {
                  if (onSelectTemplate) {
                    onSelectTemplate(e.target.value);
                  }
                }}
                className="bg-transparent text-slate-100 font-bold text-xs focus:outline-none cursor-pointer pr-1"
              >
                {availableTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id} className="bg-slate-900 text-slate-100">
                    Set: {tpl.title} ({tpl.cards.length} cards)
                  </option>
                ))}
              </select>
            </div>
          )}

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

      {/* Secret Card Pick Overlay */}
      {!isSecretSelected ? (
        <div className="w-full game-panel p-6 sm:p-8 rounded-3xl mb-8 text-center flex flex-col items-center border border-amber-500/40 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mb-1 whitespace-nowrap">
            Select Your Secret Character Card
          </h3>
          <p className="text-slate-300 text-xs max-w-md mb-6 whitespace-nowrap">
            Click on any card below to choose your secret character.
          </p>

          {/* Cards Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 w-full">
            {currentTemplate.cards.map((card) => (
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
          {/* Game Board Action & Status Bar */}
          <div className="w-full game-panel p-3.5 sm:p-4 rounded-2xl mb-6 flex items-center justify-between gap-4 border border-white/10">
            <span className="text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
              {standingCardsCount} / {currentTemplate.cards.length} Remaining
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
              <span>Reset Eliminated Cards</span>
            </button>
          </div>

          {/* Game Board Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 w-full">
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
