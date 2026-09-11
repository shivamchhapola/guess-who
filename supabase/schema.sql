-- Supabase Database Schema for Guess Who Maker Clone

-- 1. Create Profiles Table (Linked to Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  TO authenticated 
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING ((select auth.uid()) = id) 
  WITH CHECK ((select auth.uid()) = id);

-- 2. Create Custom Card Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL DEFAULT 'Anonymous Creator',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public templates are viewable by everyone" ON public.templates;
CREATE POLICY "Public templates are viewable by everyone" 
  ON public.templates FOR SELECT 
  USING (is_public = true OR (select auth.uid()) = creator_id);

DROP POLICY IF EXISTS "Authenticated users can create templates" ON public.templates;
DROP POLICY IF EXISTS "Anyone can create templates" ON public.templates;
CREATE POLICY "Anyone can create templates" 
  ON public.templates FOR INSERT 
  WITH CHECK (
    ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = creator_id)
    OR
    ((select auth.uid()) IS NULL AND creator_id IS NULL)
  );

DROP POLICY IF EXISTS "Creators can update own templates" ON public.templates;
CREATE POLICY "Creators can update own templates" 
  ON public.templates FOR UPDATE 
  TO authenticated 
  USING ((select auth.uid()) = creator_id) 
  WITH CHECK ((select auth.uid()) = creator_id);

DROP POLICY IF EXISTS "Creators can delete own templates" ON public.templates;
CREATE POLICY "Creators can delete own templates" 
  ON public.templates FOR DELETE 
  TO authenticated 
  USING ((select auth.uid()) = creator_id);

-- 3. Create Template Cards Table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  attributes JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS for Cards
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cards of public templates are viewable by everyone" ON public.cards;
CREATE POLICY "Cards of public templates are viewable by everyone" 
  ON public.cards FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.templates t 
      WHERE t.id = cards.template_id 
      AND (t.is_public = true OR t.creator_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Creators can insert cards into own templates" ON public.cards;
DROP POLICY IF EXISTS "Anyone can insert cards into templates" ON public.cards;
CREATE POLICY "Anyone can insert cards into templates" 
  ON public.cards FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.templates t 
      WHERE t.id = cards.template_id 
      AND (
        (t.creator_id IS NOT NULL AND t.creator_id = (select auth.uid()))
        OR
        (t.creator_id IS NULL)
      )
    )
  );

DROP POLICY IF EXISTS "Creators can update cards in own templates" ON public.cards;
CREATE POLICY "Creators can update cards in own templates" 
  ON public.cards FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.templates t 
      WHERE t.id = cards.template_id AND t.creator_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.templates t 
      WHERE t.id = cards.template_id AND t.creator_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Creators can delete cards from own templates" ON public.cards;
CREATE POLICY "Creators can delete cards from own templates" 
  ON public.cards FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.templates t 
      WHERE t.id = cards.template_id AND t.creator_id = (select auth.uid())
    )
  );

-- 4. Create Game Rooms Table (Serverless Room Matchmaking & Persistence)
CREATE TABLE IF NOT EXISTS public.game_rooms (
  code TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
  password_hash TEXT,
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'waiting',
  state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Game Rooms (Publicly joinable via code)
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Game rooms viewable by everyone" ON public.game_rooms;
CREATE POLICY "Game rooms viewable by everyone" 
  ON public.game_rooms FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Anyone can create or update game rooms" ON public.game_rooms;

DROP POLICY IF EXISTS "Anyone can create game rooms" ON public.game_rooms;
CREATE POLICY "Anyone can create game rooms" 
  ON public.game_rooms FOR INSERT 
  WITH CHECK (code IS NOT NULL AND host_id IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can update existing game rooms" ON public.game_rooms;
CREATE POLICY "Anyone can update existing game rooms" 
  ON public.game_rooms FOR UPDATE 
  USING (true) 
  WITH CHECK (
    code IS NOT NULL 
    AND host_id IS NOT NULL 
    AND status IN ('waiting', 'setup', 'selecting_character', 'active', 'finished')
  );

-- 5. Foreign Key Performance & Compound Partial Indexes
CREATE INDEX IF NOT EXISTS idx_cards_template_id ON public.cards(template_id);
CREATE INDEX IF NOT EXISTS idx_templates_creator_id ON public.templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON public.templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_templates_public_created ON public.templates(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_game_rooms_template_id ON public.game_rooms(template_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_is_public ON public.game_rooms(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_game_rooms_public_status_created ON public.game_rooms(is_public, status, created_at DESC) WHERE is_public = true;

-- 6. Storage Bucket Policies for Custom Card Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Card Images Bucket Viewable" ON storage.objects;
CREATE POLICY "Public Card Images Bucket Viewable" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'card-images');

DROP POLICY IF EXISTS "Authenticated Users Can Upload Card Images" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Upload Card Images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone Can Upload Card Images" ON storage.objects;
CREATE POLICY "Anyone Can Upload Card Images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'card-images');
