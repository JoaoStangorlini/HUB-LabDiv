-- ==========================================
-- GODSQL MK4: CONSOLIDAÇÃO TOTAL (HUB LAB-DIV)
-- Data: 2026-03-19
-- Descrição: Unifica todas as migrações de Perfis, Drops, e Grafo de Conhecimento.
-- ==========================================

-- 1. EXTENSÕES DE PERFIS (PROFILES)
-- ------------------------------------------

-- Social Links
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS github_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255) DEFAULT '';

-- Portfolio & Hobbies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'portfolio_url') THEN
        ALTER TABLE public.profiles ADD COLUMN portfolio_url TEXT;
    END IF;
END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hobbies_gallery JSONB DEFAULT '[]'::jsonb;

-- 2. DROPS THREADS (MICRO_ARTICLES)
-- ------------------------------------------

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_articles' AND column_name = 'parent_id') THEN
        ALTER TABLE public.micro_articles ADD COLUMN parent_id UUID REFERENCES public.micro_articles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_articles' AND column_name = 'status') THEN
        ALTER TABLE public.micro_articles ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_articles' AND column_name = 'is_featured') THEN
        ALTER TABLE public.micro_articles ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_micro_articles_parent ON public.micro_articles(parent_id);

-- 3. GRAFO DE CONHECIMENTO: ENTIDADES
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    sigla TEXT UNIQUE NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'laboratory_status') THEN
        CREATE TYPE public.laboratory_status AS ENUM ('ativo', 'inativo');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.laboratories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    status laboratory_status DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'researcher_status') THEN
        CREATE TYPE public.researcher_status AS ENUM ('ativo', 'emerito', 'inativo');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.researchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    avatar_url TEXT,
    lattes_url TEXT,
    status researcher_status DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.research_lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. GRAFO DE CONHECIMENTO: JUNÇÕES (N-N)
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.department_laboratories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    laboratory_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(department_id, laboratory_id)
);

CREATE TABLE IF NOT EXISTS public.department_researchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    researcher_id UUID REFERENCES public.researchers(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(department_id, researcher_id)
);

CREATE TABLE IF NOT EXISTS public.laboratory_researchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    laboratory_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE NOT NULL,
    researcher_id UUID REFERENCES public.researchers(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(laboratory_id, researcher_id)
);

-- 5. GRAFO DE CONHECIMENTO: INTEGRAÇÃO COM SUBMISSIONS
-- ------------------------------------------

ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_golden_standard BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS public.submission_departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(submission_id, department_id)
);

CREATE TABLE IF NOT EXISTS public.submission_laboratories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    laboratory_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(submission_id, laboratory_id)
);

CREATE TABLE IF NOT EXISTS public.submission_researchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    researcher_id UUID REFERENCES public.researchers(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(submission_id, researcher_id)
);

CREATE TABLE IF NOT EXISTS public.submission_research_lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    research_line_id UUID REFERENCES public.research_lines(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(submission_id, research_line_id)
);

-- 6. SUGESTÕES (KNOWLEDGE & ARENA)
-- ------------------------------------------

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'suggestion_type') THEN
        CREATE TYPE public.suggestion_type AS ENUM ('novo_laboratorio', 'atualizar_pesquisador', 'alterar_linha', 'outro');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'suggestion_status') THEN
        CREATE TYPE public.suggestion_status AS ENUM ('pendente', 'analisado', 'recusado');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.knowledge_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    tipo suggestion_type NOT NULL,
    conteudo TEXT NOT NULL,
    status suggestion_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.arena_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    researcher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SEGURANÇA (RLS POLICIES)
-- ------------------------------------------

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura Pública Departments" ON public.departments;
CREATE POLICY "Leitura Pública Departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Restrição Lab-Div Categoria" ON public.submissions;
CREATE POLICY "Restrição Lab-Div Categoria" ON public.submissions AS RESTRICTIVE FOR INSERT
WITH CHECK (category != 'Lab-Div' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'labdiv', 'moderator', 'labdiv adm')));

DROP POLICY IF EXISTS "Qualquer usuário logado pode inserir sugestões" ON public.knowledge_suggestions;
CREATE POLICY "Qualquer usuário logado pode inserir sugestões" ON public.knowledge_suggestions FOR INSERT WITH CHECK ( auth.uid() = user_id );

-- Arena Policies
DROP POLICY IF EXISTS "Researchers can view their own suggestions" ON public.arena_suggestions;
CREATE POLICY "Researchers can view their own suggestions" ON public.arena_suggestions FOR SELECT USING (auth.uid() = researcher_id);

-- 8. MOCK DATA (SEED)
-- ------------------------------------------

INSERT INTO public.departments (id, nome, sigla, descricao) VALUES
('d1000000-0000-0000-0000-000000000000', 'Física Aplicada', 'FAP', 'Tecnologias a partir de princípios físicos.'),
('d2000000-0000-0000-0000-000000000000', 'Física dos Materiais', 'FMT', 'Estrutura e propriedades macroscópicas.'),
('d3000000-0000-0000-0000-000000000000', 'Física Experimental', 'FEP', 'Investigação empírica.'),
('d4000000-0000-0000-0000-000000000000', 'Física Geral', 'FGE', 'Fundamentos e ensino.'),
('d5000000-0000-0000-0000-000000000000', 'Física Matemática', 'FMA', 'Métodos matemáticos na física.'),
('d6000000-0000-0000-0000-000000000000', 'Física Nuclear', 'FNC', 'Núcleos atômicos.')
ON CONFLICT (sigla) DO NOTHING;

-- RELOAD CACHE
NOTIFY pgrst, 'reload schema';
