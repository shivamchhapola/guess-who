'use client';

import React, { useState, useEffect } from 'react';
import { CardSetTemplate, CharacterCard, QuestionLogItem } from '@/types/game';
import { CardFlip } from './CardFlip';
import { QuestionAssistant } from './QuestionAssistant';
import { GuessModal } from './GuessModal';
import { VictoryModal } from './VictoryModal';
import { soundFx } from '@/lib/audio';
import { Eye, HelpCircle, RotateCcw, Volume2, VolumeX, Shield, ArrowLeft } from 'lucide-react';
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

  // Initialize random opponent secret on template load
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

  const handleAutoFlipCards = (cardIdsToFlip: string[]) => {
    setFlippedCardIds((prev) => Array.from(new Set([...prev, ...cardIdsToFlip])));
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

    // Pick new random opponent secret
    if (template.cards.length > 0) {
      const randomIndex = Math.floor(Math.random() * template.cards.length);
      setOpponentSecretId(template.cards[randomIndex].id);
    }
  };

  const playerSecretCard = template.cards.find((c) => c.id === playerSecretId) || null;
  const opponentSecretCard = template.cards.find((c) => c.id === opponentSecretId) || null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center">
      {/* Top Header Controls Bar */}
      <div className="w-full glass-panel p-4 rounded-2xl mb-6 flex items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="font-extrabold text-slate-100 text-lg sm:text-xl truncate tracking-tight">
              {template.title}
            </h2>
            <p className="text-slate-400 text-xs hidden sm:block">Practice Game Board • {template.cards.length} Cards</p>
          </div>
        </div>

        {/* Audio Mute Toggle & Secret Card Preview */}
        <div className="flex items-center gap-3">
          {playerSecretCard && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Your Secret:</span>
              <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-amber-400/50">
                <Image
                  src={playerSecretCard.imageUrl}
                  alt={playerSecretCard.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-xs font-bold text-slate-200">{playerSecretCard.name}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMuted(soundFx.toggleMute())}
            className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Secret Card Pick Overlay (If Secret Not Selected Yet) */}
      {!isSecretSelected ? (
        <div className="w-full glass-panel p-8 rounded-3xl mb-8 text-center flex flex-col items-center border border-amber-500/30 shadow-xl shadow-amber-500/5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
            <Eye className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-100 mb-2">
            Select Your Secret Character Card
          </h3>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            Click on any card below to pick the secret character your opponent will try to guess!
          </p>

          {/* Cards Selection Grid */}
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
        <>
          {/* Tactical Assistant Bar */}
          <QuestionAssistant
            cards={template.cards}
            flippedCardIds={flippedCardIds}
            onAutoFlipCards={handleAutoFlipCards}
            onResetFlips={handleResetFlips}
          />

          {/* Game Board Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 w-full">
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

      {/* Confirm Guess Modal */}
      <GuessModal
        card={selectedGuessCard}
        isOpen={isGuessModalOpen}
        onClose={() => setIsGuessModalOpen(false)}
        onConfirmGuess={handleConfirmGuess}
      />

      {/* Victory / Defeat Modal */}
      <VictoryModal
        isOpen={gameResult !== null}
        isWon={gameResult === 'won'}
        secretCard={opponentSecretCard}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
};
