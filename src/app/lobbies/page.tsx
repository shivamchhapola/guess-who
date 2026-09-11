'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Lock, Globe, Search, RefreshCw, Play, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { NavHeader } from '@/components/NavHeader';

interface PublicRoom {
  code: string;
  host_id: string;
  template_id: string;
  password_hash: string | null;
  created_at: string;
  status?: string;
}

export default function PublicLobbiesPage() {
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchPublicRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('is_public', true)
        .in('status', ['waiting', 'in_progress'])
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        setError('Could not load lobbies. Please try again.');
      } else {
        setRooms((data ?? []) as PublicRoom[]);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn('Could not load public rooms:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchPublicRooms();
    });
  }, [fetchPublicRooms]);

  // Auto-refresh every 20 seconds
  useEffect(() => {
    const interval = setInterval(fetchPublicRooms, 20_000);
    return () => clearInterval(interval);
  }, [fetchPublicRooms]);

  const filteredRooms = rooms.filter((r) =>
    r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.host_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader activePage="lobbies" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Active Public Lobbies
            </h1>
            <p className="text-slate-400 text-sm">
              {lastRefreshed
                ? `Last updated ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : 'Find an open match to play right now — no sign-up needed.'}
            </p>
          </div>

          {/* Search + Refresh */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by code or host..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
                style={{
                  background: 'rgba(13,19,36,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(6,182,212,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
            <button
              type="button"
              onClick={fetchPublicRooms}
              disabled={loading}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-all disabled:opacity-50"
              style={{ background: 'rgba(13,19,36,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
              title="Refresh lobbies"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && rooms.length === 0 && (
          <div className="glass-panel p-16 rounded-3xl text-center flex flex-col items-center gap-4"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">Loading lobbies…</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center gap-4 mb-6"
            style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200 mb-1">Failed to Load Lobbies</h3>
              <p className="text-slate-400 text-xs mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchPublicRooms}
                className="game-btn-primary text-sm px-5 py-2.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRooms.length === 0 && (
          <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', color: '#22d3ee' }}>
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">
              {searchQuery ? 'No Lobbies Match Your Search' : 'No Active Public Lobbies'}
            </h3>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              {searchQuery
                ? 'Try a different search term or clear it to see all lobbies.'
                : 'Be the first to host a game room and let others join!'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="py-2.5 px-5 text-sm font-bold text-cyan-300 rounded-xl"
                  style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
                >
                  Clear Search
                </button>
              ) : (
                <Link href="/host" className="game-btn-primary py-3 px-6 text-sm">
                  Host New Game
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Lobbies Grid */}
        {!loading && !error && filteredRooms.length > 0 && (
          <>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              {filteredRooms.length} {filteredRooms.length === 1 ? 'Room' : 'Rooms'} Open
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.map((room) => (
                <div
                  key={room.code}
                  className="glass-panel p-6 rounded-3xl flex flex-col justify-between group transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(6,182,212,0.35)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black font-mono tracking-widest text-cyan-400">
                        {room.code}
                      </span>
                      <div className="flex items-center gap-2">
                        {room.status === 'in_progress' && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            In Progress
                          </span>
                        )}
                        {room.password_hash ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-500/10 px-2.5 py-1 rounded-full border border-slate-600/30">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                            <Globe className="w-3 h-3" />
                            Open
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs font-semibold mb-1">
                      Hosted by <span className="text-slate-200 font-bold">{room.host_id}</span>
                    </p>
                    <p className="text-slate-600 text-xs mb-6">
                      Created at {new Date(room.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <Link
                    href={`/play/${room.code}`}
                    className="w-full py-3 font-bold text-slate-950 game-btn-primary rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Join Room</span>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
