'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Users, Lock, Globe, Search, RefreshCw, Play, AlertCircle, Loader2, Layers } from 'lucide-react';
import { NavHeader } from '@/components/NavHeader';
import { HomeFooter } from '@/components/home/HomeFooter';
import { soundFx } from '@/lib/audio';
import { CardSetTemplate, CharacterCard } from '@/types/game';
import { THE_OFFICE_TEMPLATE, ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';

const BUILT_IN_TEMPLATES: CardSetTemplate[] = [
  THE_OFFICE_TEMPLATE,
  ...ALL_POPULAR_TEMPLATES.filter((t) => t.id !== THE_OFFICE_TEMPLATE.id),
  CLASSIC_GUESS_WHO_TEMPLATE,
];

interface PublicRoomRow {
  code: string;
  host_id: string;
  template_id: string;
  password_hash: string | null;
  created_at: string;
  status?: string;
  state?: {
    hostName?: string;
    selectedAvatar?: string;
    selectedTemplateId?: string;
    deckTitle?: string;
  };
  templates?: {
    id: string;
    title: string;
    description: string;
    creator_name?: string;
    is_public?: boolean;
    tags?: string[];
    created_at?: string;
    updated_at?: string;
    cards?: { id: string; name: string; image_url: string; attributes: Record<string, unknown> }[];
  } | null;
}

interface ProcessedRoom {
  code: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  passwordHash: string | null;
  createdAt: string;
  status: string;
  template: CardSetTemplate;
}

function parseHostDisplayName(hostId: string, stateHostName?: string): string {
  if (stateHostName && stateHostName.trim()) return stateHostName.trim();
  if (!hostId) return 'Anonymous Host';
  if (hostId.startsWith('http://') || hostId.startsWith('https://')) {
    const spaceIdx = hostId.indexOf(' ');
    if (spaceIdx !== -1) {
      return hostId.substring(spaceIdx + 1).trim();
    }
  }
  return hostId;
}

function resolveRoomTemplate(row: PublicRoomRow): CardSetTemplate {
  // 1. If DB joined templates with cards exists
  if (row.templates && row.templates.cards && row.templates.cards.length > 0) {
    return {
      id: row.templates.id,
      title: row.templates.title,
      description: row.templates.description || '',
      creatorName: row.templates.creator_name || 'Community Creator',
      isPublic: row.templates.is_public ?? true,
      tags: row.templates.tags || ['Custom'],
      createdAt: row.templates.created_at || new Date().toISOString(),
      updatedAt: row.templates.updated_at || new Date().toISOString(),
      cards: row.templates.cards.map((c) => ({
        id: c.id,
        name: c.name,
        imageUrl: c.image_url,
        attributes: (c.attributes as CharacterCard['attributes']) || {},
      })),
    };
  }

  // 2. Check by template_id or state.selectedTemplateId in built-in templates
  const targetId = row.template_id || row.state?.selectedTemplateId;
  if (targetId) {
    const foundStatic = BUILT_IN_TEMPLATES.find((t) => t.id === targetId);
    if (foundStatic) return foundStatic;
  }

  // 3. Fallback to The Office
  return THE_OFFICE_TEMPLATE;
}

export default function PublicLobbiesPage() {
  const [rooms, setRooms] = useState<ProcessedRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  // Silent background fetch support to eliminate UI layout morphing during auto-sync
  const fetchPublicRooms = useCallback(
    async (isSilent = false) => {
      if (!isSilent) {
        setLoading(true);
      }
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('game_rooms')
          .select('*, templates(*, cards(*))')
          .eq('is_public', true)
          .in('status', ['waiting', 'in_progress'])
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Supabase error:', fetchError);
          setError('Could not load lobbies. Please try again.');
        } else {
          const processed: ProcessedRoom[] = (data ?? []).map((row: PublicRoomRow) => {
            const hostName = parseHostDisplayName(row.host_id, row.state?.hostName);
            const template = resolveRoomTemplate(row);
            let hostAvatar = row.state?.selectedAvatar;
            if (!hostAvatar && row.host_id.startsWith('https://')) {
              const spaceIdx = row.host_id.indexOf(' ');
              if (spaceIdx !== -1) {
                hostAvatar = row.host_id.substring(0, spaceIdx);
              }
            }

            return {
              code: row.code,
              hostId: row.host_id,
              hostName,
              hostAvatar,
              passwordHash: row.password_hash,
              createdAt: row.created_at,
              status: row.status || 'waiting',
              template,
            };
          });

          setRooms(processed);
        }
      } catch (err) {
        console.warn('Could not load public rooms:', err);
        setError('Network error. Please check your connection.');
      } finally {
        if (!isSilent) {
          setLoading(false);
        }
      }
    },
    [supabase]
  );

  useEffect(() => {
    queueMicrotask(() => {
      fetchPublicRooms(false);
    });
  }, [fetchPublicRooms]);

  // Realtime subscription + 15s silent background auto-sync
  useEffect(() => {
    const channel = supabase
      .channel('public_lobbies_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_rooms' },
        () => {
          fetchPublicRooms(true);
        }
      )
      .subscribe();

    const interval = setInterval(() => fetchPublicRooms(true), 15_000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [supabase, fetchPublicRooms]);

  // Search filter across room code, host name, or deck title
  const filteredRooms = rooms.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.code.toLowerCase().includes(q) ||
      r.hostName.toLowerCase().includes(q) ||
      r.template.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <NavHeader activePage="lobbies" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Clean Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Public <span className="text-cyan-400">Lobbies</span>
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30">
                {filteredRooms.length} {filteredRooms.length === 1 ? 'Lobby' : 'Lobbies'}
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Browse active public rooms hosted by other players.
            </p>
          </div>

          {/* Search + Manual Refresh Bar */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code, host, or deck..."
                className="w-full h-11 pl-9 pr-4 rounded-2xl text-xs sm:text-sm font-medium bg-slate-950/90 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                style={{ caretColor: '#22d3ee' }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                fetchPublicRooms(false);
              }}
              disabled={loading}
              className="h-11 w-11 rounded-2xl text-slate-300 hover:text-white bg-slate-950/90 border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 shrink-0"
              title="Refresh lobbies"
              aria-label="Refresh lobbies"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stable Height Container (Prevents UI morphing during fetch/refresh) */}
        <div className="min-h-[380px]">
          {/* Loading Initial State */}
          {loading && rooms.length === 0 && (
            <div className="game-panel p-12 rounded-3xl text-center min-h-[320px] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-9 h-9 text-cyan-400 animate-spin" />
              <p className="text-slate-300 text-sm font-bold">Checking open lobbies…</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="game-panel p-8 rounded-3xl text-center min-h-[320px] flex flex-col items-center justify-center gap-4 mb-6 border-red-500/30">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}
              >
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Failed to Sync Lobbies</h3>
                <p className="text-slate-400 text-xs mb-4">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    fetchPublicRooms(false);
                  }}
                  className="game-btn-primary text-xs px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Stable Empty State (Constrained inside container) */}
          {!loading && !error && filteredRooms.length === 0 && (
            <div className="game-panel p-10 rounded-3xl text-center min-h-[320px] flex flex-col items-center justify-center max-w-md mx-auto my-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: '#22d3ee' }}
              >
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {searchQuery ? 'No Lobbies Match Search' : 'No Public Lobbies Online'}
              </h3>
              <p className="text-slate-300 text-xs max-w-sm mb-5 leading-relaxed">
                {searchQuery
                  ? 'Try a different room code, host nickname, or deck title.'
                  : 'Be the first to host a game room and invite players!'}
              </p>
              <div>
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="py-2 px-4 text-xs font-extrabold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    Clear Search
                  </button>
                ) : (
                  <Link
                    href="/host"
                    onClick={() => soundFx.playSelect()}
                    className="game-btn-primary py-2.5 px-5 text-xs font-extrabold rounded-xl inline-flex items-center gap-2"
                  >
                    <span>Host Game</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Lobbies Grid */}
          {!loading && !error && filteredRooms.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.map((room) => {
                const cardPreviews = room.template.cards.slice(0, 4);

                return (
                  <div
                    key={room.code}
                    className="game-panel p-5 sm:p-6 rounded-3xl flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
                    style={{ border: '1px solid rgba(6, 182, 212, 0.25)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.25)')}
                  >
                    <div>
                      {/* Header: Room Code & Access Badge */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black font-mono tracking-widest text-cyan-400">
                            {room.code}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {room.status === 'in_progress' ? (
                            <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                              In Match
                            </span>
                          ) : room.passwordHash ? (
                            <span className="flex items-center gap-1 text-[10px] font-extrabold text-slate-400 bg-slate-500/10 px-2.5 py-1 rounded-full border border-slate-600/30">
                              <Lock className="w-3 h-3" />
                              Private
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                              <Globe className="w-3 h-3" />
                              Open
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Host Profile Bar */}
                      <div className="flex items-center gap-2.5 mb-4 p-2 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                        {room.hostAvatar ? (
                          <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                            <Image src={room.hostAvatar} alt={room.hostName} fill className="object-cover" unoptimized />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-black flex items-center justify-center text-xs shrink-0">
                            {room.hostName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 block leading-none mb-0.5">Host</span>
                          <p className="text-xs font-bold text-white truncate">{room.hostName}</p>
                        </div>
                      </div>

                      {/* Deck Metadata & Card Previews */}
                      <div className="mb-5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-extrabold text-cyan-400 flex items-center gap-1 truncate">
                            <Layers className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{room.template.title}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 shrink-0">
                            {room.template.cards.length} Cards
                          </span>
                        </div>

                        {/* Card Avatars Row */}
                        <div className="flex -space-x-2.5 overflow-hidden pt-1">
                          {cardPreviews.map((c, idx) => (
                            <div
                              key={c.id || idx}
                              className="relative w-7 h-7 rounded-lg overflow-hidden border border-slate-900 bg-slate-950 shrink-0"
                            >
                              <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Join Room CTA */}
                    <Link
                      href={`/play/${room.code}?template=${room.template.id}`}
                      onClick={() => soundFx.playSelect()}
                      className="w-full h-11 rounded-2xl text-xs font-extrabold text-slate-950 game-btn-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <Play className="w-4 h-4 fill-current shrink-0" />
                      <span>Join Room</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
