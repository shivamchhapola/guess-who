'use client';

import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { CharacterCard } from '@/types/game';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NavHeader } from '@/components/NavHeader';
import { HomeFooter } from '@/components/home/HomeFooter';
import { AuthLockedStudio } from '@/components/create/AuthLockedStudio';
import { CreateStudioHeader } from '@/components/create/CreateStudioHeader';
import { DeckIdentityStep } from '@/components/create/DeckIdentityStep';
import { CharacterWorkshopStep } from '@/components/create/CharacterWorkshopStep';
import { DeckBoardPreviewStep } from '@/components/create/DeckBoardPreviewStep';

function formatFilenameToName(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  return nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Custom', 'Party']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Initial card list (starts clean so creators can upload or load starters)
  const [cards, setCards] = useState<CharacterCard[]>([]);

  const handleClearAllCards = () => {
    setCards([]);
  };

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const router = useRouter();
  const supabase = createClient();

  // Supabase Auth Guard Listener (Gated feature)
  useEffect(() => {
    async function checkAuthSession() {
      try {
        const { data } = await supabase.auth.getUser();
        setIsAuthenticated(!!data?.user);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuthSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

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
          is_public: isPublic,
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
    <div className="min-h-screen flex flex-col justify-between">
      <NavHeader activePage="create" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Loading Auth State */}
        {isAuthenticated === null && (
          <div className="game-panel p-16 rounded-3xl text-center min-h-[360px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-9 h-9 text-amber-400 animate-spin" />
            <p className="text-slate-300 text-sm font-bold">Checking studio access...</p>
          </div>
        )}

        {/* Auth Locked View (Unauthenticated Users) */}
        {isAuthenticated === false && <AuthLockedStudio />}

        {/* Authenticated Deck Creator Studio */}
        {isAuthenticated === true && (
          <div>
            <CreateStudioHeader
              currentStep={currentStep}
              totalCards={cards.length}
              title={title}
              onSelectStep={setCurrentStep}
            />

            {currentStep === 1 && (
              <DeckIdentityStep
                title={title}
                description={description}
                isPublic={isPublic}
                selectedTags={selectedTags}
                customTagInput={customTagInput}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onIsPublicChange={setIsPublic}
                onCustomTagInputChange={setCustomTagInput}
                onToggleTag={toggleTag}
                onAddCustomTag={handleAddCustomTag}
                onNextStep={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <CharacterWorkshopStep
                cards={cards}
                fileInputRef={fileInputRef}
                zipInputRef={zipInputRef}
                uploadStatus={uploadStatus}
                onSetCardInputRef={(idx, el) => {
                  if (cardFileInputRefs.current) {
                    cardFileInputRefs.current[idx] = el;
                  }
                }}
                onCardImageClick={(idx) => {
                  const input = cardFileInputRefs.current?.[idx];
                  if (input) input.click();
                }}
                onBulkImageSelect={handleBulkImageSelect}
                onZipFileSelect={handleZipFileSelect}
                onCardNameChange={handleCardNameChange}
                onSingleCardFileSelect={handleSingleCardFileSelect}
                onRemoveCard={handleRemoveCard}
                onClearAllCards={handleClearAllCards}
                onPrevStep={() => setCurrentStep(1)}
                onNextStep={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 3 && (
              <DeckBoardPreviewStep
                title={title}
                description={description}
                isPublic={isPublic}
                selectedTags={selectedTags}
                cards={cards}
                saving={saving}
                successMsg={successMsg}
                onPrevStep={() => setCurrentStep(2)}
                onSaveTemplate={handleSaveTemplate}
              />
            )}
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}
