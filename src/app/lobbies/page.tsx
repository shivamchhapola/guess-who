'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Lock, Globe, Search, RefreshCw, ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PublicRoom {
  code: string;
  host_id: string;
  template_id: string;
  password_hash: string | null;
  created_at: string;
}

export default function PublicLobbiesPage() {
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const supabase = createClient();

  const fetchPublicRooms = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (data) {
        setRooms(data as PublicRoom[]);
      }
    } catch (err) {
      console.warn('Could not load public rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicRooms();
  }, []);

  const filteredRooms = rooms.filter((r) =>
    r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.host_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="w-full border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Back to Home</span>
          </Link>

          <span className="text-sm font-extrabold tracking-tight">
            Public Game <span className="gradient-text font-black">Lobbies</span>
          </span>

          <button
            type="button"
            onClick={fetchPublicRooms}
            className="p-2 rounded-xl glass-card text-slate-300 hover:text-white transition-colors"
            title="Refresh Room List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-100 mb-1">
              Active Public Game Rooms
            </h1>
            <p className="text-slate-400 text-sm">
              Find an open match to play online right now without signing up.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by room code or host..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Lobbies List Grid */}
        {filteredRooms.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center border border-white/10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">No Active Public Lobbies Found</h3>
            <p className="text-slate-400 text-xs max-w-md mb-6">
              Be the first to host a game room or launch a practice match!
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/host"
                className="py-3 px-6 text-sm font-bold text-white gradient-btn rounded-xl shadow-lg"
              >
                Host New Game
              </Link>
              <Link
                href="/play/practice"
                className="py-3 px-6 text-sm font-semibold text-slate-300 glass-card rounded-xl hover:text-white"
              >
                Play Practice Board
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.code}
                className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono tracking-widest text-cyan-400">
                      {room.code}
                    </span>
                    {room.password_hash ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                        <Lock className="w-3 h-3" />
                        <span>Passcode Required</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        <Globe className="w-3 h-3" />
                        <span>Open Join</span>
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 text-sm font-semibold mb-1">
                    Host: <span className="text-slate-100">{room.host_id}</span>
                  </p>
                  <p className="text-slate-500 text-xs mb-6">
                    Created {new Date(room.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <Link
                  href={`/play/${room.code}`}
                  className="w-full py-3 font-bold text-white gradient-btn rounded-xl flex items-center justify-center gap-2 shadow-md"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Join Room</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
