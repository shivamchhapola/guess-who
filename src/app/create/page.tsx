'use client';

import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { CharacterCard, CardSetTemplate } from '@/types/game';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, FileArchive, Save, ArrowLeft, Sparkles, CheckCircle, Image as ImageIcon, Play, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function formatFilenameToName(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  return nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function CreateTemplatePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('Photos, Custom, Party');

  // Dynamic initial card list (starts with 16 placeholder cards, completely flexible!)
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

  const router = useRouter();
  const supabase = createClient();

  // Handle Bulk Image Select (Dynamic count - supports any number of photos!)
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

  // Handle ZIP File Unpacking (Dynamic count - extracts all images in ZIP!)
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

  const handleCardImageChange = (idx: number, imageUrl: string) => {
    const next = [...cards];
    next[idx].imageUrl = imageUrl;
    setCards(next);
  };

  const handleSaveTemplate = async () => {
    if (!title.trim()) {
      alert('Please enter a Game Set Title.');
      return;
    }

    setSaving(true);
    setSuccessMsg(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const creatorId = userData?.user?.id || null;
      const creatorName = userData?.user?.user_metadata?.username || 'Photo Creator';

      const { data: templateData } = await supabase
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

      if (templateData?.id) {
        const cardsToInsert = cards.map((c) => ({
          template_id: templateData.id,
          name: c.name,
          image_url: c.imageUrl,
          attributes: c.attributes,
        }));
        await supabase.from('cards').insert(cardsToInsert);
      }

      setSuccessMsg('Game Set Created! Launching Practice Match...');
      setTimeout(() => {
        router.push('/play/practice');
      }, 1200);
    } catch (err) {
      console.error('Save template error:', err);
      router.push('/play/practice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* Header */}
      <header className="w-full border-b border-white/10 game-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-bold text-sm">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          <span className="text-base font-black tracking-tight text-white">
            Photo Game <span className="text-amber-400">Creator Studio</span> 📸
          </span>

          <button
            type="button"
            onClick={handleSaveTemplate}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-slate-950 game-btn-primary rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{saving ? 'Creating Game...' : 'Publish & Play Set'}</span>
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

        {/* BULK PHOTO & ZIP FILE UPLOADER HERO SECTION */}
        <div className="game-panel p-8 rounded-3xl mb-8 border border-amber-500/40 shadow-2xl text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h2 className="text-3xl font-black text-white mb-2">
            Bulk Upload Photos or Drop a ZIP File!
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mb-6">
            Upload any number of photos from your folder or a ZIP archive. Filenames automatically become character names!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-lg mb-4">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleBulkImageSelect}
              className="hidden"
            />
            <input
              type="file"
              ref={zipInputRef}
              accept=".zip"
              onChange={handleZipFileSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-4 px-6 font-black text-slate-950 game-btn-primary rounded-2xl flex items-center justify-center gap-2 text-sm cursor-pointer shadow-xl"
            >
              <ImageIcon className="w-5 h-5" />
              <span>Select Photos</span>
            </button>

            <button
              type="button"
              onClick={() => zipInputRef.current?.click()}
              className="flex-1 py-4 px-6 font-bold text-white game-btn-purple rounded-2xl flex items-center justify-center gap-2 text-sm cursor-pointer shadow-xl"
            >
              <FileArchive className="w-5 h-5" />
              <span>Upload ZIP File</span>
            </button>
          </div>

          {uploadStatus && (
            <div className="text-xs font-bold text-amber-300 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Set Details Form */}
        <div className="game-panel p-6 rounded-3xl mb-8 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Game Set Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Office, Friends Group, Marvel Heroes"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of characters in this set..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Category Tags</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Photos, Movies, Party"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Cards Grid Preview Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Character Cards ({cards.length} Cards)</span>
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
              {/* Delete Card Button */}
              <button
                type="button"
                onClick={() => handleRemoveCard(idx)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove Card"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Card Image Preview */}
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
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-white text-center focus:outline-none focus:border-amber-400"
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
