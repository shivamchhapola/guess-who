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

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

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

-- Anyone can view public templates (No login required to play!)
CREATE POLICY "Public templates are viewable by everyone" 
  ON public.templates FOR SELECT 
  USING (is_public = true OR (auth.role() = 'authenticated' AND auth.uid() = creator_id));

-- Logged-in users can create templates
CREATE POLICY "Authenticated users can create templates" 
  ON public.templates FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = creator_id);

-- Creators can update their own templates
CREATE POLICY "Creators can update own templates" 
  ON public.templates FOR UPDATE 
  USING (auth.uid() = creator_id);

-- Creators can delete their own templates
CREATE POLICY "Creators can delete own templates" 
  ON public.templates FOR DELETE 
  USING (auth.uid() = creator_id);

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

-- Anyone can view cards of accessible templates
CREATE POLICY "Cards of public templates are viewable by everyone" 
  ON public.cards FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.templates t 
      WHERE t.id = cards.template_id 
      AND (t.is_public = true OR (auth.role() = 'authenticated' AND t.creator_id = auth.uid()))
    )
  );

-- Creators can insert cards into their templates
CREATE POLICY "Creators can insert cards into own templates" 
  ON public.cards FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.templates t 
      WHERE t.id = cards.template_id AND t.creator_id = auth.uid()
    )
  );

-- Creators can update cards in their templates
CREATE POLICY "Creators can update cards in own templates" 
  ON public.cards FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.templates t 
      WHERE t.id = cards.template_id AND t.creator_id = auth.uid()
    )
  );

-- Creators can delete cards from their templates
CREATE POLICY "Creators can delete cards from own templates" 
  ON public.cards FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.templates t 
      WHERE t.id = cards.template_id AND t.creator_id = auth.uid()
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

CREATE POLICY "Game rooms viewable by everyone" 
  ON public.game_rooms FOR SELECT USING (true);

CREATE POLICY "Anyone can create or update game rooms" 
  ON public.game_rooms FOR ALL USING (true);

-- 5. Storage Bucket Policies for Custom Card Images
-- Execute in Supabase SQL Editor to create the bucket and grant public read access:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Card Images Bucket Viewable" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'card-images');

CREATE POLICY "Authenticated Users Can Upload Card Images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'card-images' AND auth.role() = 'authenticated');
