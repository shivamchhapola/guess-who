'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardSetTemplate } from '@/types/game';
import { NavHeader } from '@/components/NavHeader';
import { SetPreviewModal } from '@/components/SetPreviewModal';
import { HeroHeader } from '@/components/home/HeroHeader';
import { JoinGameSegment } from '@/components/home/JoinGameSegment';
import { GameModeCards } from '@/components/home/GameModeCards';
import { PopularDecksSection } from '@/components/home/PopularDecksSection';
import { HomeFooter } from '@/components/home/HomeFooter';

/* ─── Redesigned Landing Page Orchestrator ───────────────────────────────────────────── */
export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<CardSetTemplate | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader activePage="home" />

      <main className="flex-1">
        {/* ── Hero & Entry Section ─────────────────────────────────── */}
        <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-16">
          {/* Background Glows */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div
              style={{
                position: 'absolute',
                top: '-10%',
                left: '15%',
                width: '45%',
                height: '70%',
                background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '10%',
                right: '15%',
                width: '40%',
                height: '60%',
                background: 'radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)',
                borderRadius: '50%',
              }}
            />
          </div>

          {/* 1. Hero Title & Description */}
          <HeroHeader />

          {/* 2. Inline Join Game Segment (Right below heading and description) */}
          <JoinGameSegment />

          {/* 3. Host a Game & Public Lobbies Cards */}
          <GameModeCards />
        </section>

        {/* 4. Featured Decks Section */}
        <PopularDecksSection onSelectTemplate={setSelectedTemplate} />
      </main>

      {/* 5. Footer */}
      <HomeFooter />

      {/* 6. Template Deck Inspector Modal */}
      <SetPreviewModal
        template={selectedTemplate}
        isOpen={selectedTemplate !== null}
        onClose={() => setSelectedTemplate(null)}
        primaryActionLabel="Host Multiplayer Room"
        onSelectSet={(tpl) => router.push(`/host?template=${tpl.id}`)}
        secondaryActionLabel="Play Solo Practice"
        onSecondaryAction={(tpl) => router.push(`/play/practice?template=${tpl.id}`)}
      />
    </div>
  );
}
