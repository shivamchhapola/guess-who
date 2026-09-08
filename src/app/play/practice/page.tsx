'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';
import { CardSetTemplate } from '@/types/game';

function PracticeContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  let activeTemplate: CardSetTemplate = CLASSIC_GUESS_WHO_TEMPLATE;

  if (templateId) {
    const found = ALL_POPULAR_TEMPLATES.find(t => t.id === templateId);
    if (found) activeTemplate = found;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full">
        <GameBoard template={activeTemplate} />
      </main>
    </div>
  );
}

export default function PracticeGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-lg font-bold animate-pulse">Loading game board...</div>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}
