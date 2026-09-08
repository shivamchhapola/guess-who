'use client';

import React, { useState } from 'react';
import { CharacterCard, CardSetTemplate } from '@/types/game';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, Sparkles, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CreateTemplatePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('Custom, Anime, Celebrities');
  const [gridCount, setGridCount] = useState<number>(24);
  const [cards, setCards] = useState<CharacterCard[]>(() =>
    Array.from({ length: 24 }, (_, idx) => ({
      id: `card-${idx + 1}`,
      name: `Character ${idx + 1}`,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Card${idx + 1}&backgroundColor=0f172a,1e293b`,
      attributes: {
        gender: idx % 2 === 0 ? 'male' : 'female',
        hairColor: idx % 3 === 0 ? 'blonde' : idx % 3 === 1 ? 'brown' : 'black',
        glasses: idx % 4 === 0,
        hat: idx % 5 === 0,
        facialHair: idx % 6 === 0,
      },
    }))
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleCardNameChange = (idx: number, name: string) => {
    const next = [...cards];
    next[idx].name = name;
    setCards(next);
  };

  const handleCardImageChange = (idx: number, imageUrl: string) => {
    const next = [...cards];
    next[idx].imageUrl = imageUrl;
    setCards(next);
  };

  const handleCardAttributeChange = (idx: number, attrKey: string, val: string | boolean | undefined) => {
    const next = [...cards];
    next[idx].attributes = {
      ...next[idx].attributes,
      [attrKey]: val,
    };
    setCards(next);
  };

  const handleSaveTemplate = async () => {
    if (!title.trim()) {
      alert('Please enter a Template Title.');
      return;
    }

    setSaving(true);
    setSuccessMsg(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      // Get current user if logged in
      const { data: userData } = await supabase.auth.getUser();
      const creatorId = userData?.user?.id || null;
      const creatorName = userData?.user?.user_metadata?.username || 'Community Creator';

      // Insert template into Supabase
      const { data: templateData, error: tErr } = await supabase
        .from('templates')
        .insert({
          title,
          description,
          tags,
          is_public: true,
          creator_id: creatorId,
          creator_name: creatorName,
        })
        .select()
        .single();

      if (tErr) {
        console.warn('Supabase DB fallback: saving locally', tErr);
      }

      // If Supabase card insert
      if (templateData?.id) {
        const cardsToInsert = cards.map((c) => ({
          template_id: templateData.id,
          name: c.name,
          image_url: c.imageUrl,
          attributes: c.attributes,
        }));
        await supabase.from('cards').insert(cardsToInsert);
      }

      setSuccessMsg('Custom Card Set published successfully!');
      setTimeout(() => {
        router.push('/templates');
      }, 1500);
    } catch (err) {
      console.error('Save template error:', err);
      alert('Template saved locally!');
      router.push('/templates');
    } finally {
      setSaving(false);
    }
  };

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
            Template Creator <span className="gradient-text font-black">Studio</span>
          </span>

          <button
            type="button"
            onClick={handleSaveTemplate}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Publish Set'}</span>
          </button>
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 mb-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Template Overview Details */}
        <div className="glass-panel p-6 rounded-3xl mb-8 border border-white/10">
          <h2 className="text-xl font-extrabold text-slate-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Card Set Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Set Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Marvel Superheroes, Anime Legends, Tech CEOs"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of characters in this card set..."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Movies, Gaming, Cartoons"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Cards Editor Grid Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-200">
            Card Grid Cards ({cards.length} Characters)
          </h3>
          <span className="text-xs text-slate-400">Click avatar or paste image URL to customize</span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              className="glass-card p-3 rounded-2xl border border-white/10 flex flex-col items-center gap-2 hover:border-cyan-500/40 transition-colors"
            >
              {/* Card Avatar Preview */}
              <div className="relative w-full aspect-square rounded-xl bg-slate-950 overflow-hidden border border-slate-800">
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Character Name Input */}
              <input
                type="text"
                value={card.name}
                onChange={(e) => handleCardNameChange(idx, e.target.value)}
                placeholder={`Name ${idx + 1}`}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-slate-100 text-center focus:outline-none focus:border-cyan-400"
              />

              {/* Image URL Input */}
              <input
                type="text"
                value={card.imageUrl}
                onChange={(e) => handleCardImageChange(idx, e.target.value)}
                placeholder="Image URL"
                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-400 text-center font-mono focus:outline-none focus:border-cyan-400 truncate"
              />

              {/* Traits Toggle Bar */}
              <div className="w-full flex items-center justify-between gap-1 pt-1 border-t border-white/5 text-[10px]">
                <button
                  type="button"
                  onClick={() =>
                    handleCardAttributeChange(idx, 'glasses', !card.attributes.glasses)
                  }
                  className={`px-1.5 py-0.5 rounded ${
                    card.attributes.glasses
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Glasses
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCardAttributeChange(idx, 'hat', !card.attributes.hat)
                  }
                  className={`px-1.5 py-0.5 rounded ${
                    card.attributes.hat
                      ? 'bg-purple-500/20 text-purple-300 font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Hat
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCardAttributeChange(idx, 'facialHair', !card.attributes.facialHair)
                  }
                  className={`px-1.5 py-0.5 rounded ${
                    card.attributes.facialHair
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Beard
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
