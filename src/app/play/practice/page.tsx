'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES, THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';
import { CardSetTemplate } from '@/types/game';

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get('template');

  const allTemplatesList: CardSetTemplate[] = [
    THE_OFFICE_TEMPLATE,
    ...ALL_POPULAR_TEMPLATES.filter(t => t.id !== THE_OFFICE_TEMPLATE.id),
    CLASSIC_GUESS_WHO_TEMPLATE,
  ];

  let activeTemplate: CardSetTemplate = THE_OFFICE_TEMPLATE;

  if (templateId) {
    const found = allTemplatesList.find(t => t.id === templateId);
    if (found) activeTemplate = found;
  }

  const handleSelectTemplate = (newTemplateId: string) => {
    router.push(`/play/practice?template=${newTemplateId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full">
        <GameBoard
          template={activeTemplate}
          availableTemplates={allTemplatesList}
          onSelectTemplate={handleSelectTemplate}
        />
      </main>
    </div>
  );
}

export default function PracticeGamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-slate-400 text-lg font-bold animate-pulse">Loading game board...</div>
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
