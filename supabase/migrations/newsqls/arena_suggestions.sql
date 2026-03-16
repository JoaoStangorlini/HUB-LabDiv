-- Migration: Create arena_suggestions table
-- Path: ./supabase/migrations/newsqls/arena_suggestions.sql

CREATE TABLE IF NOT EXISTS public.arena_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    researcher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.arena_suggestions ENABLE ROW LEVEL SECURITY;

-- Policies
-- Researcher can create their own suggestions
CREATE POLICY "Researchers can insert their own suggestions" 
ON public.arena_suggestions FOR INSERT 
WITH CHECK (auth.uid() = researcher_id);

-- Researcher can view their own suggestions
CREATE POLICY "Researchers can view their own suggestions" 
ON public.arena_suggestions FOR SELECT 
USING (auth.uid() = researcher_id);

-- Admins can view all suggestions
CREATE POLICY "Admins can view all suggestions" 
ON public.arena_suggestions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Admins can update suggestions (status)
CREATE POLICY "Admins can update suggestions" 
ON public.arena_suggestions FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
