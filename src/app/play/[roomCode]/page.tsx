import { MultiplayerBoard } from '@/components/game/MultiplayerBoard';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES, THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CardSetTemplate } from '@/types/game';

interface RoomPageProps {
  params: Promise<{ roomCode: string }>;
  searchParams: Promise<{ template?: string }>;
}

export async function generateMetadata({ params }: RoomPageProps) {
  const { roomCode } = await params;
  return {
    title: `Room #${roomCode.toUpperCase()} - Guess Who Maker`,
    description: `Play online Guess Who in room #${roomCode.toUpperCase()} with zero login required.`,
  };
}

export default async function OnlineRoomPage({ params, searchParams }: RoomPageProps) {
  const { roomCode } = await params;
  const { template: queryTemplateId } = await searchParams;
  const upperCode = roomCode.toUpperCase();

  const allAvailableTemplates = [
    THE_OFFICE_TEMPLATE,
    ...ALL_POPULAR_TEMPLATES.filter((t) => t.id !== THE_OFFICE_TEMPLATE.id),
    CLASSIC_GUESS_WHO_TEMPLATE,
  ];

  let activeTemplate: CardSetTemplate = THE_OFFICE_TEMPLATE;

  if (queryTemplateId) {
    const foundByQuery = allAvailableTemplates.find((t) => t.id === queryTemplateId);
    if (foundByQuery) {
      activeTemplate = foundByQuery;
    }
  }

  let requiredPassword: string | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: roomData } = await supabase
      .from('game_rooms')
      .select('*, templates(*, cards(*))')
      .eq('code', upperCode)
      .single();

    if (roomData) {
      requiredPassword = roomData.password_hash || null;
      const targetTemplateId = roomData.template_id || roomData.state?.selectedTemplateId || queryTemplateId;

      if (roomData.templates && roomData.templates.cards && roomData.templates.cards.length > 0) {
        activeTemplate = {
          id: roomData.templates.id,
          title: roomData.templates.title,
          description: roomData.templates.description || '',
          creatorName: roomData.templates.creator_name || 'Community Creator',
          isPublic: roomData.templates.is_public,
          tags: roomData.templates.tags || ['Custom'],
          createdAt: roomData.templates.created_at,
          updatedAt: roomData.templates.updated_at,
          cards: roomData.templates.cards.map((c: { id: string; name: string; image_url: string; attributes: Record<string, unknown> }) => ({
            id: c.id,
            name: c.name,
            imageUrl: c.image_url,
            attributes: c.attributes || {},
          })),
        };
      } else if (targetTemplateId) {
        const foundStatic = allAvailableTemplates.find((t) => t.id === targetTemplateId);
        if (foundStatic) {
          activeTemplate = foundStatic;
        } else {
          // Check if targetTemplateId is a custom template in DB
          const { data: customTpl } = await supabase
            .from('templates')
            .select('*, cards(*)')
            .eq('id', targetTemplateId)
            .maybeSingle();

          if (customTpl && customTpl.cards && customTpl.cards.length > 0) {
            activeTemplate = {
              id: customTpl.id,
              title: customTpl.title,
              description: customTpl.description || '',
              creatorName: customTpl.creator_name || 'Community Creator',
              isPublic: customTpl.is_public,
              tags: customTpl.tags || ['Custom'],
              createdAt: customTpl.created_at,
              updatedAt: customTpl.updated_at,
              cards: customTpl.cards.map((c: { id: string; name: string; image_url: string; attributes: Record<string, unknown> }) => ({
                id: c.id,
                name: c.name,
                imageUrl: c.image_url,
                attributes: c.attributes || {},
              })),
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not load server room data:', err);
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <main className="flex-1 w-full">
        <MultiplayerBoard
          roomCode={upperCode}
          template={activeTemplate}
          requiredPassword={requiredPassword}
        />
      </main>
    </div>
  );
}
