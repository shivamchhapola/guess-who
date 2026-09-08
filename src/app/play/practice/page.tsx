import { GameBoard } from '@/components/game/GameBoard';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';

export const metadata = {
  title: 'Solo Practice Game Board - Guess Who Maker',
  description: 'Practice Guess Who offline with 3D card flips, tactical question assistants, and instant sound effects.',
};

export default function PracticeGamePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <main className="flex-1 w-full">
        <GameBoard template={CLASSIC_GUESS_WHO_TEMPLATE} />
      </main>
    </div>
  );
}
