'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES, THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';
import { CardSetTemplate } from '@/types/game';
import { createClient } from '@/lib/supabase/client';

const BUILT_IN_TEMPLATES: CardSetTemplate[] = [
  THE_OFFICE_TEMPLATE,
  ...ALL_POPULAR_TEMPLATES.filter(t => t.id !== THE_OFFICE_TEMPLATE.id),
  CLASSIC_GUESS_WHO_TEMPLATE,
];

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get('template');

  const supabase = createClient();

  const [availableTemplates, setAvailableTemplates] = useState<CardSetTemplate[]>(BUILT_IN_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<CardSetTemplate>(() => {
    if (templateId) {
      const found = BUILT_IN_TEMPLATES.find((t) => t.id === templateId);
      if (found) return found;
    }
    return THE_OFFICE_TEMPLATE;
  });
  const [isLoadingCustom, setIsLoadingCustom] = useState<boolean>(false);

  useEffect(() => {
    if (!templateId) {
      queueMicrotask(() => setActiveTemplate(THE_OFFICE_TEMPLATE));
      return;
    }

    const staticFound = BUILT_IN_TEMPLATES.find((t) => t.id === templateId);
    if (staticFound) {
      queueMicrotask(() => setActiveTemplate(staticFound));
      return;
    }

    // Fetch custom Supabase template deck by UUID
    let isSubscribed = true;
    async function fetchCustomTemplate() {
      setIsLoadingCustom(true);
      try {
        const { data: dbTemplate, error } = await supabase
          .from('templates')
          .select('*, cards(*)')
          .eq('id', templateId)
          .maybeSingle();

        if (isSubscribed && dbTemplate && !error) {
          const formatted: CardSetTemplate = {
            id: dbTemplate.id,
            title: dbTemplate.title,
            description: dbTemplate.description || '',
            creatorName: dbTemplate.creator_name || 'Community Creator',
            isPublic: dbTemplate.is_public ?? true,
            tags: dbTemplate.tags || ['Custom'],
            createdAt: dbTemplate.created_at,
            updatedAt: dbTemplate.updated_at,
            cards: (dbTemplate.cards || []).map((c: { id: string; name: string; image_url: string; attributes?: Record<string, unknown> }) => ({
              id: c.id,
              name: c.name,
              imageUrl: c.image_url,
              attributes: c.attributes || {},
            })),
          };

          setAvailableTemplates((prev) => {
            if (prev.some((t) => t.id === formatted.id)) return prev;
            return [formatted, ...prev];
          });
          setActiveTemplate(formatted);
        }
      } catch (err) {
        console.warn('Failed to load custom practice template:', err);
      } finally {
        if (isSubscribed) setIsLoadingCustom(false);
      }
    }

    fetchCustomTemplate();

    return () => {
      isSubscribed = false;
    };
  }, [templateId, supabase]);

  const handleSelectTemplate = (newTemplateId: string) => {
    router.push(`/play/practice?template=${newTemplateId}`);
  };

  if (isLoadingCustom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyan-400 text-lg font-bold animate-pulse">Loading custom deck...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full">
        <GameBoard
          template={activeTemplate}
          availableTemplates={availableTemplates}
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
