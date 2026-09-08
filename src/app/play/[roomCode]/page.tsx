import { MultiplayerBoard } from '@/components/game/MultiplayerBoard';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CardSetTemplate } from '@/types/game';

interface RoomPageProps {
  params: Promise<{ roomCode: string }>;
}

export async function generateMetadata({ params }: RoomPageProps) {
  const { roomCode } = await params;
  return {
    title: `Room #${roomCode.toUpperCase()} - Guess Who Maker`,
    description: `Play online Guess Who in room #${roomCode.toUpperCase()} with zero login required.`,
  };
}

export default async function OnlineRoomPage({ params }: RoomPageProps) {
  const { roomCode } = await params;
  const upperCode = roomCode.toUpperCase();

  let activeTemplate: CardSetTemplate = CLASSIC_GUESS_WHO_TEMPLATE;
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

      if (roomData.templates && roomData.templates.cards) {
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
