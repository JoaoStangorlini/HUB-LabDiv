-- ==========================================================
-- 🛡️ HUB DE COMUNICAÇÃO CIENTÍFICA - GOD SQL V3 (CONSOLIDATED)
-- Versão: V3.2.0 "O Grande Colisor"
-- Data: 2026-02-26
-- Contém a fundação (V2) e TODAS as migrações (V3.1.0 -> V3.2.0)
-- Script 100% IDEMPOTENTE.
-- ==========================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║ BLOCO 1: FUNDAÇÃO (GOD SQL V2.3.5)                      ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado', 'deleted');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('image', 'video', 'pdf', 'text', 'link', 'zip', 'sdocx');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    media_type media_type NOT NULL,
    media_url TEXT NOT NULL,
    status submission_status DEFAULT 'pendente' NOT NULL,
    admin_feedback TEXT,
    whatsapp TEXT,
    external_link TEXT,
    technical_details TEXT,
    alt_text TEXT,
    testimonial TEXT,
    is_featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    reading_time INTEGER DEFAULT 0,
    co_author_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    inline_paragraph_id TEXT,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.curtidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fingerprint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT curtidas_submission_fingerprint_unique UNIQUE (submission_id, fingerprint)
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        auth.jwt() ->> 'role' = 'admin' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ╔══════════════════════════════════════════════════════════╗
-- ║ BLOCO 2: CONSOLIDAÇÃO V3.0 (GOD SQL V2)                  ║
-- ╚══════════════════════════════════════════════════════════╝

-- Pseudonyms
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS use_pseudonym BOOLEAN DEFAULT FALSE;

-- Discovery & Maps
CREATE TABLE IF NOT EXISTS public.reading_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

-- Engagement (Collections, Kudos, Notifications)
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL,
    UNIQUE(submission_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intelligence (AI Fields)
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ocr_content TEXT;

-- ╔══════════════════════════════════════════════════════════╗
-- ║ BLOCO 3: V3.1+ (SHADOW SYSTEM & FEEDBACK)                ║
-- ╚══════════════════════════════════════════════════════════╝

-- Profile Refactor (Shadow System V4.3)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_review_status') THEN
        CREATE TYPE profile_review_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS institute TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS review_status profile_review_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS bio_draft TEXT,
ADD COLUMN IF NOT EXISTS artistic_interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interest_help_comm BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS interest_learn_prod BOOLEAN DEFAULT FALSE;

-- Feedback System (Panic Button)
CREATE TABLE IF NOT EXISTS public.feedback_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'visual')),
    description TEXT NOT NULL,
    screenshot_url TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ╔══════════════════════════════════════════════════════════╗
-- ║ BLOCO 4: V3.2.0 THE BIG COLLIDER (Technical Infra)       ║
-- ╚══════════════════════════════════════════════════════════╝

-- O Grande Colisor (Wiki Graph)
CREATE TABLE IF NOT EXISTS public.wiki_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    technical_metadata JSONB DEFAULT '{ "equipment_id": null, "lab_room": null, "safety_level": 1 }'::jsonb,
    is_stable BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wiki_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_article_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    target_article_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    citation_type TEXT DEFAULT 'reference',
    UNIQUE(source_article_id, target_article_id)
);

-- Energia Atômica & Decaimento Lazy
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS atomic_excitation DOUBLE PRECISION DEFAULT 100.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS half_life_rate DOUBLE PRECISION DEFAULT 0.05;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_energy_update TIMESTAMPTZ DEFAULT NOW();

-- Emaranhamento (Chat)
CREATE TABLE IF NOT EXISTS public.entanglement_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_particle_id UUID,
    attachment_type TEXT CHECK (attachment_type IN ('particle', 'article')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ╔══════════════════════════════════════════════════════════╗
-- ║ BLOCO 5: RLS & INDICES FINAIZADOS                        ║
-- ╚══════════════════════════════════════════════════════════╝

ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entanglement_messages ENABLE ROW LEVEL SECURITY;

-- Manutenção de Índices
CREATE INDEX IF NOT EXISTS idx_submissions_main_search ON public.submissions (created_at DESC) INCLUDE (title, authors, media_type, category);
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard ON public.profiles (xp DESC) INCLUDE (full_name, avatar_url, level);
CREATE INDEX IF NOT EXISTS idx_wiki_slug ON public.wiki_articles (slug);
CREATE INDEX IF NOT EXISTS idx_entanglement_pair ON public.entanglement_messages (sender_id, receiver_id);

-- GIN Index para busca rápida em metadados técnicos
CREATE INDEX IF NOT EXISTS idx_wiki_technical_metadata_gin ON public.wiki_articles USING GIN (technical_metadata);

-- Trigger para atualizar timestamp de última interação (Física Lazy)
CREATE OR REPLACE FUNCTION public.update_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET last_energy_update = NOW() 
    WHERE id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_interaction_decay_trigger
    AFTER INSERT OR UPDATE ON public.submissions
    FOR EACH ROW EXECUTE FUNCTION public.update_last_interaction();

-- Seed Minimal
INSERT INTO public.badges (name, icon, description)
VALUES ('Pioneiro', 'auto_awesome', 'Membro fundador do Grande Colisor.')
ON CONFLICT (name) DO NOTHING;
