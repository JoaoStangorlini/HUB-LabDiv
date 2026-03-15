-- Migration: Micro-articles
-- Description: Creates the micro_articles table with 260-char constraint and RLS.

CREATE TABLE IF NOT EXISTS public.micro_articles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    likes_count int DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT content_length_check CHECK (char_length(content) <= 260)
);

-- Enable RLS
ALTER TABLE public.micro_articles ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'micro_articles' AND policyname = 'Public can read micro-articles'
    ) THEN
        CREATE POLICY "Public can read micro-articles" ON public.micro_articles
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'micro_articles' AND policyname = 'Authenticated users can create articles'
    ) THEN
        CREATE POLICY "Authenticated users can create articles" ON public.micro_articles
            FOR INSERT WITH CHECK (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'micro_articles' AND policyname = 'Authors can update their own articles'
    ) THEN
        CREATE POLICY "Authors can update their own articles" ON public.micro_articles
            FOR UPDATE USING (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'micro_articles' AND policyname = 'Authors can delete their own articles'
    ) THEN
        CREATE POLICY "Authors can delete their own articles" ON public.micro_articles
            FOR DELETE USING (auth.uid() = author_id);
    END IF;
END $$;

COMMENT TABLE public.micro_articles IS 'Stores micro-posts limited to 260 characters.';
