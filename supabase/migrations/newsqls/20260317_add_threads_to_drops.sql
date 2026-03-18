-- [MK11] DROPS THREADS: SISTEMA DE FIOS
-- Criado em: 2026-03-17

DO $$ 
BEGIN
    -- 1. parent_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_articles' AND column_name = 'parent_id') THEN
        ALTER TABLE public.micro_articles ADD COLUMN parent_id UUID REFERENCES public.micro_articles(id) ON DELETE CASCADE;
    END IF;

    -- 2. status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_articles' AND column_name = 'status') THEN
        ALTER TABLE public.micro_articles ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    -- 3. is_featured
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_articles' AND column_name = 'is_featured') THEN
        ALTER TABLE public.micro_articles ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_micro_articles_parent ON public.micro_articles(parent_id);

COMMENT ON COLUMN public.micro_articles.parent_id IS 'ID do log pai, permitindo a criação de fios (threads).';
