'use client';

import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { CharacterCard } from '@/types/game';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Play, Sparkles, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NavHeader } from '@/components/NavHeader';
import { BulkImageUploader } from '@/components/create/BulkImageUploader';
import { TagSelectorBar } from '@/components/create/TagSelectorBar';
import { CardGridEditor } from '@/components/create/CardGridEditor';

function formatFilenameToName(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  return nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Resize & compress image data URLs client-side using HTML5 Canvas
 * Reduces 2MB–5MB raw photo Data URLs to ~30KB (max 400x400 JPEG at 82% quality)
 */
async function compressImageDataUrl(
  dataUrl: string,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.82
): Promise<string> {
  if (typeof window === 'undefined') return dataUrl;
  if (!dataUrl.startsWith('data:image/') || dataUrl.includes('image/svg+xml')) {
    return dataUrl;
  }

  return new Promise<string>((resolve) => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
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
  const handleBulkImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadStatus(`Compressing and processing ${files.length} selected images...`);
    const fileArray = Array.from(files);

    try {
      const readPromises = fileArray.map(
        (file) =>
          new Promise<{ name: string; dataUrl: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({
                name: formatFilenameToName(file.name),
                dataUrl: (event.target?.result as string) || '',
              });
            };
            reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
            reader.readAsDataURL(file);
          })
      );

      const readResults = await Promise.all(readPromises);
      const compressedResults = await Promise.all(
        readResults.map(async (res) => ({
          name: res.name,
          dataUrl: await compressImageDataUrl(res.dataUrl),
        }))
      );

      const newCards: CharacterCard[] = compressedResults.map((res, index) => ({
        id: `card-${Date.now()}-${index + 1}`,
        name: res.name,
        imageUrl: res.dataUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=Card${index + 1}`,
        attributes: {},
      }));

      setCards(newCards);
      setUploadStatus(`Successfully created ${newCards.length}-card set from photos!`);
      if (!title) {
        setTitle('Custom Photo Game Set');
      }
    } catch (err) {
      console.error('Error processing bulk images:', err);
      alert('Could not process all selected images.');
      setUploadStatus(null);
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
        const basename = zipEntry.name.split('/').pop() || zipEntry.name;
        const isHiddenOrSystem = zipEntry.name.includes('__MACOSX') || basename.startsWith('.');
        if (!zipEntry.dir && !isHiddenOrSystem && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(zipEntry.name)) {
          imageFiles.push({ name: basename, zipEntry });
        }
      });

      if (imageFiles.length === 0) {
        alert('No valid image files (.jpg, .png, .webp) found inside ZIP archive.');
        setUploadStatus(null);
        return;
      }

      setUploadStatus(`Extracting & compressing ${imageFiles.length} photos from ZIP...`);
      const extractedCards: CharacterCard[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const item = imageFiles[i];
        const blob = await item.zipEntry.async('blob');
        const rawDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve((ev.target?.result as string) || '');
          reader.readAsDataURL(blob);
        });

        const dataUrl = await compressImageDataUrl(rawDataUrl);

        extractedCards.push({
          id: `card-${Date.now()}-${i + 1}`,
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
    reader.onload = async (ev) => {
      if (ev.target?.result) {
        const rawDataUrl = ev.target.result as string;
        const compressedUrl = await compressImageDataUrl(rawDataUrl);
        const next = [...cards];
        next[idx].imageUrl = compressedUrl;
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
      const creatorName =
        userData?.user?.user_metadata?.username ||
        userData?.user?.user_metadata?.full_name ||
        'Community Creator';

      const { data: templateData, error: templateError } = await supabase
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

      if (templateError || !templateData?.id) {
        console.error('Template insertion error:', templateError);
        alert(`Failed to save game set: ${templateError?.message || 'Database permissions error'}`);
        setSaving(false);
        return;
      }

      const cardsToInsert = cards.map((c) => ({
        template_id: templateData.id,
        name: c.name,
        image_url: c.imageUrl,
        attributes: c.attributes,
      }));

      const { error: cardsError } = await supabase.from('cards').insert(cardsToInsert);
      if (cardsError) {
        console.error('Cards insertion error:', cardsError);
        alert(`Failed to save deck cards: ${cardsError.message}`);
        setSaving(false);
        return;
      }

      setSuccessMsg('Game Set Published! Redirecting...');
      const targetUrl =
        destination === 'host'
          ? `/host?template=${templateData.id}`
          : `/play/practice?template=${templateData.id}`;

      setTimeout(() => {
        router.push(targetUrl);
      }, 1000);
    } catch (err) {
      console.error('Save template error:', err);
      alert('An unexpected error occurred while publishing your game set.');
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

        {/* BULK PHOTO & ZIP UPLOADER COMPONENT */}
        <BulkImageUploader
          fileInputRef={fileInputRef}
          zipInputRef={zipInputRef}
          uploadStatus={uploadStatus}
          onBulkImageSelect={handleBulkImageSelect}
          onZipFileSelect={handleZipFileSelect}
        />

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

          {/* Tags Selector Component */}
          <TagSelectorBar
            selectedTags={selectedTags}
            customTagInput={customTagInput}
            onCustomTagInputChange={setCustomTagInput}
            onToggleTag={toggleTag}
            onAddCustomTag={handleAddCustomTag}
          />
        </div>

        {/* Card Grid Editor Component */}
        <CardGridEditor
          cards={cards}
          onSetCardInputRef={(idx, el) => {
            if (cardFileInputRefs.current) {
              cardFileInputRefs.current[idx] = el;
            }
          }}
          onCardImageClick={(idx) => {
            const input = cardFileInputRefs.current?.[idx];
            if (input) input.click();
          }}
          onUpdateCardName={handleCardNameChange}
          onSingleCardImageSelect={handleSingleCardFileSelect}
          onRemoveCard={handleRemoveCard}
          onAddCard={handleAddCard}
        />
      </main>
    </div>
  );
}
