'use client';

import React, { useState, useEffect } from 'react';
import { CardSetTemplate } from '@/types/game';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES, THE_OFFICE_TEMPLATE } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import { Zap, Lock, Globe, RefreshCw, Play, Sparkles, Check, Users } from 'lucide-react';
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
    THE_OFFICE_TEMPLATE,
    ...ALL_POPULAR_TEMPLATES.filter(t => t.id !== THE_OFFICE_TEMPLATE.id),
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

    // Fetch user public custom templates if any
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

          setTemplates((prev) => [
            ...prev,
            ...formatted.filter(ft => !prev.some(pt => pt.id === ft.id)),
          ]);
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

    const upperCode = roomCode.toUpperCase();

    try {
      const roomPayload = {
        code: upperCode,
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
        console.warn('Supabase DB room insert note:', error);
      }

      // Store local host session metadata
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${upperCode}_role`, 'host');
        sessionStorage.setItem(`room_${upperCode}_name`, hostName);
        sessionStorage.setItem(`room_${upperCode}_template`, selectedTemplateId);
      }

      router.push(`/play/${upperCode}?template=${selectedTemplateId}`);
    } catch (err) {
      console.error('Error creating room:', err);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_${upperCode}_role`, 'host');
        sessionStorage.setItem(`room_${upperCode}_name`, hostName);
        sessionStorage.setItem(`room_${upperCode}_template`, selectedTemplateId);
      }
      router.push(`/play/${upperCode}?template=${selectedTemplateId}`);
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
          <div className="game-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white whitespace-nowrap">Host Multiplayer Room</h1>
                <p className="text-slate-400 text-xs font-medium">Set room options, display name, and select character card set.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Host Display Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 whitespace-nowrap">Your Display Name</label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. HostPlayer"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Room Code */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 whitespace-nowrap">Generated Room Code</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={roomCode}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-mono font-black tracking-widest text-amber-400 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    className="absolute right-2 p-2 text-slate-400 hover:text-white transition-colors"
                    title="Regenerate Code"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Room Options: Password & Public Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              {/* Password Protection */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200 whitespace-nowrap">Password Protection</span>
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
                    placeholder="Enter Passcode"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 mt-2"
                  />
                )}
              </div>

              {/* Public Lobby Finder Toggle */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200 whitespace-nowrap">Public Lobby Listing</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isPublic ? 'Listed in public matches.' : 'Private link/code only.'}
                </p>
              </div>
            </div>
          </div>

          {/* Template Selection Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 whitespace-nowrap">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Select Game Set Template</span>
              </h2>
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                {templates.length} Sets Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`game-panel p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                        : 'border-white/10 hover:border-slate-600'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>SELECTED</span>
                      </div>
                    )}

                    <div>
                      {/* Thumbnail Card Preview */}
                      <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-950/80 mb-3 aspect-[2.5/1] overflow-hidden border border-white/5">
                        {tpl.cards.slice(0, 4).map((c) => (
                          <div key={c.id} className="relative w-full h-full rounded bg-slate-900 overflow-hidden">
                            <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                          </div>
                        ))}
                      </div>

                      <h3 className="font-extrabold text-white text-base mb-1">{tpl.title}</h3>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-3">{tpl.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/5">
                      <span className="font-bold text-slate-300">{tpl.cards.length} Character Cards</span>
                      <span className="text-amber-400 font-semibold">{tpl.creatorName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Launch Room Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-black text-slate-950 text-base sm:text-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <Play className="w-5 h-5 fill-current shrink-0" />
            <span className="whitespace-nowrap">{loading ? 'Creating Room...' : 'Launch Game Room'}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
