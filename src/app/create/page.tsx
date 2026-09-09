'use client';

import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { CharacterCard } from '@/types/game';
import { createClient } from '@/lib/supabase/client';
import {
  UploadCloud, FileArchive, CheckCircle, Image as ImageIcon,
  Play, Plus, Trash2, Tag, Sparkles, Layers, Users, X
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { NavHeader } from '@/components/NavHeader';

const SUGGESTED_TAGS = ['Custom', 'Photos', 'Friends', 'Party', 'TV Show', 'Comedy', 'Movies', 'Gaming', 'Anime', 'Celebrities'];

function formatFilenameToName(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  return nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function CreateTemplatePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Custom', 'Party']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Initial card list (starts with 16 placeholder cards)
  const [cards, setCards] = useState<CharacterCard[]>(() =>
    Array.from({ length: 16 }, (_, idx) => ({
      id: `card-${idx + 1}`,
      name: `Person ${idx + 1}`,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Photo${idx + 1}&backgroundColor=0f172a,1e293b`,
      attributes: {},
    }))
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const router = useRouter();
  const supabase = createClient();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customTagInput.trim().replace(/^#/, '');
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setCustomTagInput('');
    }
  };

  // Handle Bulk Image Select
  const handleBulkImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadStatus(`Processing ${files.length} selected images...`);
    const fileArray = Array.from(files);

    const newCards: CharacterCard[] = fileArray.map((file, index) => ({
      id: `card-${index + 1}`,
      name: formatFilenameToName(file.name),
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Card${index + 1}`,
      attributes: {},
    }));

    fileArray.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          newCards[index].imageUrl = dataUrl;
          setCards([...newCards]);
        }
      };
      reader.readAsDataURL(file);
    });

    setUploadStatus(`Successfully created ${fileArray.length}-card set from photos!`);
    if (!title) {
      setTitle('Custom Photo Game Set');
    }
  };

  // Handle ZIP File Unpacking
  const handleZipFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Unpacking ZIP archive...');
    try {
      const zip = await JSZip.loadAsync(file);
      const imageFiles: { name: string; zipEntry: JSZip.JSZipObject }[] = [];

      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(zipEntry.name)) {
          imageFiles.push({ name: zipEntry.name.split('/').pop() || zipEntry.name, zipEntry });
        }
      });

      if (imageFiles.length === 0) {
        alert('No image files (.jpg, .png, .webp) found inside ZIP archive.');
        setUploadStatus(null);
        return;
      }

      setUploadStatus(`Extracting ${imageFiles.length} photos from ZIP...`);
      const extractedCards: CharacterCard[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const item = imageFiles[i];
        const blob = await item.zipEntry.async('blob');
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(blob);
        });

        extractedCards.push({
          id: `card-${i + 1}`,
          name: formatFilenameToName(item.name),
          imageUrl: dataUrl,
          attributes: {},
        });
      }

      setCards(extractedCards);
      setUploadStatus(`Successfully created ${extractedCards.length}-card set from ZIP!`);
      if (!title) {
        setTitle(formatFilenameToName(file.name) || 'Custom Photo Set');
      }
    } catch (err) {
      console.error('Error unpacking ZIP file:', err);
      alert('Could not process ZIP file.');
      setUploadStatus(null);
    }
  };

  const handleAddCard = () => {
    const nextId = cards.length + 1;
    setCards([
      ...cards,
      {
        id: `card-${nextId}`,
        name: `Person ${nextId}`,
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Card${nextId}&backgroundColor=0f172a`,
        attributes: {},
      },
    ]);
  };

  const handleRemoveCard = (idx: number) => {
    if (cards.length <= 4) {
      alert('A game set needs at least 4 character cards.');
      return;
    }
    setCards(cards.filter((_, i) => i !== idx));
  };

  const handleCardNameChange = (idx: number, name: string) => {
    const next = [...cards];
    next[idx].name = name;
    setCards(next);
  };

  const handleSingleCardFileSelect = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        const next = [...cards];
        next[idx].imageUrl = ev.target.result as string;
        setCards(next);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTemplate = async (destination: 'host' | 'practice') => {
    if (!title.trim()) {
      alert('Please enter a Game Set Title.');
      return;
    }
    if (cards.length < 4) {
      alert('A game set must have at least 4 character cards.');
      return;
    }

    setSaving(true);
    setSuccessMsg(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const creatorId = userData?.user?.id || null;
      const creatorName = userData?.user?.user_metadata?.username || 'Community Creator';

      const { data: templateData } = await supabase
        .from('templates')
        .insert({
          title: title.trim(),
          description: description.trim(),
          tags: selectedTags.length > 0 ? selectedTags : ['Custom'],
          is_public: true,
          creator_id: creatorId,
          creator_name: creatorName,
        })
        .select()
        .single();

      if (templateData?.id) {
        const cardsToInsert = cards.map((c) => ({
          template_id: templateData.id,
          name: c.name,
          image_url: c.imageUrl,
          attributes: c.attributes,
        }));
        await supabase.from('cards').insert(cardsToInsert);
      }

      setSuccessMsg('Game Set Published! Redirecting...');
      const targetUrl =
        destination === 'host'
          ? `/host?template=${templateData?.id || 'custom'}`
          : `/play/practice?template=${templateData?.id || 'custom'}`;

      setTimeout(() => {
        router.push(targetUrl);
      }, 1000);
    } catch (err) {
      console.error('Save template error:', err);
      const targetUrl = destination === 'host' ? '/host' : '/play/practice';
      router.push(targetUrl);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader activePage="create" />

      {/* Main Studio Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Create Custom Set 📸
              </h1>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-400"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                {cards.length} Cards
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Upload photos or a ZIP archive to generate a custom Guess Who set instantly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleSaveTemplate('practice')}
              disabled={saving}
              className="game-btn-secondary py-2.5 px-4 text-xs font-bold disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Solo Practice</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveTemplate('host')}
              disabled={saving}
              className="game-btn-primary py-2.5 px-5 text-sm font-black disabled:opacity-50"
              style={{ borderRadius: '0.75rem' }}
            >
              <Users className="w-4 h-4" />
              <span>{saving ? 'Publishing...' : 'Host Room with Set'}</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 mb-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* BULK PHOTO & ZIP UPLOADER HERO SECTION */}
        <div className="game-panel p-8 rounded-3xl mb-8 border border-amber-500/30 shadow-2xl text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Bulk Photo Upload or Drop ZIP Archive
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mb-6">
            Upload multiple photos or a ZIP folder. Image filenames are automatically formatted into character names!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-lg mb-4">
            <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleBulkImageSelect} className="hidden" />
            <input type="file" ref={zipInputRef} accept=".zip" onChange={handleZipFileSelect} className="hidden" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="game-btn-primary flex-1 py-3.5 px-5 text-sm cursor-pointer"
              style={{ borderRadius: '1rem' }}
            >
              <ImageIcon className="w-5 h-5" />
              <span>Select Photos</span>
            </button>

            <button
              type="button"
              onClick={() => zipInputRef.current?.click()}
              className="game-btn-purple flex-1 py-3.5 px-5 text-sm cursor-pointer"
              style={{ borderRadius: '1rem' }}
            >
              <FileArchive className="w-5 h-5" />
              <span>Upload ZIP Archive</span>
            </button>
          </div>

          {uploadStatus && (
            <div className="text-xs font-bold text-amber-300 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Set Details Form & Tag Selection */}
        <div className="game-panel p-6 rounded-3xl mb-8 border border-white/10">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Set Details & Tags</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Game Set Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dunder Mifflin Scranton, Movie Stars, Friends Group"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of characters in this set..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Tags Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Category Tags</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                    style={{
                      background: isSelected ? '#f59e0b' : 'rgba(30,41,59,0.7)',
                      color: isSelected ? '#0a0f1a' : '#94a3b8',
                      border: '1px solid ' + (isSelected ? 'transparent' : 'rgba(71,85,105,0.4)'),
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}

              {selectedTags
                .filter((t) => !SUGGESTED_TAGS.includes(t))
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1"
                    style={{
                      background: '#f59e0b',
                      color: '#0a0f1a',
                    }}
                  >
                    <span>#{tag}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder="Add custom tag (e.g. #Office)..."
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>

        {/* Cards Header & Add Button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Character Cards ({cards.length})</span>
          </h3>

          <button
            type="button"
            onClick={handleAddCard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-300 bg-slate-900 border border-amber-500/30 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Card</span>
          </button>
        </div>

        {/* Dynamic Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              className="game-card p-3 rounded-2xl border border-white/10 flex flex-col items-center gap-2 hover:border-amber-400/60 relative group"
            >
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveCard(idx)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove Card"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Hidden File Input for Single Card Photo Swap */}
              <input
                type="file"
                accept="image/*"
                ref={(el) => {
                  cardFileInputRefs.current[idx] = el;
                }}
                onChange={(e) => handleSingleCardFileSelect(idx, e)}
                className="hidden"
              />

              {/* Card Image Preview */}
              <div
                onClick={() => cardFileInputRefs.current[idx]?.click()}
                className="relative w-full aspect-square rounded-xl bg-slate-950 overflow-hidden border border-slate-800 cursor-pointer group/img"
              >
                <Image src={card.imageUrl} alt={card.name} fill className="object-cover group-hover/img:scale-105 transition-transform" unoptimized />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white">
                  Change Photo
                </div>
              </div>

              {/* Character Name Input */}
              <input
                type="text"
                value={card.name}
                onChange={(e) => handleCardNameChange(idx, e.target.value)}
                placeholder={`Name ${idx + 1}`}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-white text-center focus:outline-none focus:border-amber-400"
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
