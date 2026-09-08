'use client';

import React, { useState, useEffect } from 'react';
import { CardSetTemplate } from '@/types/game';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES, THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import { Zap, Lock, Globe, RefreshCw, ArrowLeft, Play, Sparkles, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { NavHeader } from '@/components/NavHeader';

function generateRoomCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function HostRoomPage() {
  const [roomCode, setRoomCode] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(THE_OFFICE_TEMPLATE.id);
  const [templates, setTemplates] = useState<CardSetTemplate[]>([
    ...ALL_POPULAR_TEMPLATES,
    CLASSIC_GUESS_WHO_TEMPLATE,
  ]);
  
  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [hostName, setHostName] = useState<string>('Player 1');
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setRoomCode(generateRoomCode());

    // Fetch user public templates
    async function fetchTemplates() {
      try {
        const { data: dbTemplates } = await supabase
          .from('templates')
          .select('*, cards(*)')
          .eq('is_public', true);

        if (dbTemplates && dbTemplates.length > 0) {
          const formatted: CardSetTemplate[] = dbTemplates.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            creatorName: t.creator_name || 'Community Creator',
            isPublic: t.is_public,
            tags: t.tags || ['Custom'],
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            cards: (t.cards || []).map((c: { id: string; name: string; image_url: string; attributes: Record<string, unknown> }) => ({
              id: c.id,
              name: c.name,
              imageUrl: c.image_url,
              attributes: c.attributes || {},
            })),
          }));
          setTemplates([CLASSIC_GUESS_WHO_TEMPLATE, ...formatted]);
        }
      } catch (err) {
        console.warn('Could not fetch custom templates:', err);
      }
    }
    fetchTemplates();
  }, []);

  const handleRegenerateCode = () => {
    setRoomCode(generateRoomCode());
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roomPayload = {
        code: roomCode.toUpperCase(),
        host_id: hostName || 'Player 1',
        template_id: selectedTemplateId,
        password_hash: hasPassword ? password : null,
        is_public: isPublic,
        status: 'waiting',
        state: {
          hostName,
          selectedTemplateId,
        },
      };

      const { error } = await supabase.from('game_rooms').insert(roomPayload);

      if (error && error.code !== '23505') {
        console.warn('Supabase DB error, redirecting with local session:', error);
      }

      // Store local host session metadata
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${roomCode.toUpperCase()}_role`, 'host');
        sessionStorage.setItem(`room_${roomCode.toUpperCase()}_name`, hostName);
      }

      router.push(`/play/${roomCode.toUpperCase()}`);
    } catch (err) {
      console.error('Error creating room:', err);
      router.push(`/play/${roomCode.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <NavHeader activePage="host" />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleCreateRoom} className="flex flex-col gap-8">
          {/* Room Configuration Settings Card */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-100">Configure Game Room</h1>
                <p className="text-slate-400 text-xs">Set up room rules, passcode, and select a card set template.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Host Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Display Name</label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. MasterGuesser"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Room Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Generated Room Code</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={roomCode}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-cyan-400 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    className="absolute right-2 p-2 text-slate-400 hover:text-white transition-colors"
                    title="Regenerate Room Code"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Room Security & Privacy Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
              {/* Password Protection */}
              <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-slate-200">Password Protection</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasPassword}
                    onChange={(e) => setHasPassword(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                {hasPassword && (
                  <input
                    type="password"
                    required={hasPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Room Passcode"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                )}
              </div>

              {/* Public Matchmaking Toggle */}
              <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold text-slate-200">Public Lobby Finder</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {isPublic ? 'Visible to everyone in public match lobby.' : 'Private room (join via direct link/code only).'}
                </p>
              </div>
            </div>
          </div>

          {/* Template Selection Cards */}
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Select Card Set Template</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedTemplateId === tpl.id
                      ? 'border-purple-400 ring-2 ring-purple-400/40 bg-purple-500/10'
                      : 'border-white/10 hover:border-slate-600'
                  }`}
                >
                  <div>
                    {/* Thumbnail preview */}
                    <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-950/80 mb-3 aspect-[2.5/1] overflow-hidden">
                      {tpl.cards.slice(0, 4).map((c) => (
                        <div key={c.id} className="relative w-full h-full rounded bg-slate-900">
                          <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                        </div>
                      ))}
                    </div>

                    <h3 className="font-bold text-slate-100 text-base mb-1">{tpl.title}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-3">{tpl.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/5">
                    <span>{tpl.cards.length} Cards</span>
                    <span className="text-purple-300 font-semibold">{tpl.creatorName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Launch Room CTA Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-black text-white text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{loading ? 'Creating Room...' : 'Launch Game Room'}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
