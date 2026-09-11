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
    queueMicrotask(() => {
      setCurrentTemplate(initialTemplate);
      setFlippedCardIds([]);
      setPlayerSecretId(null);
      setIsSecretSelected(false);

      if (initialTemplate.cards.length > 0) {
        const randomIndex = Math.floor(Math.random() * initialTemplate.cards.length);
        setOpponentSecretId(initialTemplate.cards[randomIndex].id);
      }
    });
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

  const handleResetFlips = () => setFlippedCardIds([]);

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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col">

      {/* ── Top Header Bar ──────────────────────────────────── */}
      <div className="game-panel px-4 py-3 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-3"
        style={{ border: '1px solid rgba(255,255,255,0.09)' }}>

        {/* Left: back + template info */}
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
              <h2 className="font-black text-white text-sm sm:text-base tracking-tight truncate">{currentTemplate.title}</h2>
              <span className="hidden sm:inline-flex text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(6,182,212,0.12)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.25)' }}>
                Practice
              </span>
            </div>
            <p className="text-slate-500 text-[11px] font-semibold">{currentTemplate.cards.length} cards</p>
          </div>
        </div>

        {/* Right: template switcher + secret card + mute */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Template Switcher */}
          {availableTemplates.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={currentTemplate.id}
                onChange={(e) => {
                  if (onSelectTemplate) onSelectTemplate(e.target.value);
                }}
                className="bg-transparent text-slate-100 font-bold text-xs focus:outline-none cursor-pointer max-w-[120px]"
              >
                {availableTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id} className="bg-slate-900 text-slate-100">
                    {tpl.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Secret Card Widget */}
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
        </div>
      </div>

      {/* ── Secret Card Selection ─────────────────────────── */}
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
          <p className="text-slate-400 text-sm max-w-md mb-6">
            Click any card — the computer will try to guess which one you picked!
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 w-full">
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
          {/* ── Game Status Bar ─────────────────────────────── */}
          <div className="game-panel px-4 py-2.5 rounded-xl mb-4 flex items-center justify-between gap-3"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs font-black px-3 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
              {standingCardsCount} / {currentTemplate.cards.length} Standing
            </span>

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
              <span>Reset</span>
            </button>
          </div>

          {/* ── Cards Grid ──────────────────────────────────── */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 w-full">
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
