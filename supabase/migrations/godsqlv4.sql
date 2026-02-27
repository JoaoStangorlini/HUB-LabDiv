-- ==========================================================
-- THE GOD SQL v4.0.0 — HUB DE COMUNICAÇÃO CIENTÍFICA (IFUSP)
-- ==========================================================
-- Script 100% IDEMPOTENTE. Consolida todas as migrações (v2.4 a v3.2).
-- ==========================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado', 'deleted');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('image', 'video', 'pdf', 'text', 'link', 'zip', 'sdocx');
    END IF;
END $$;

-- 3. TABELAS DE NÚCLEO (PROFILES & SUBMISSIONS)

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    atomic_excitation DOUBLE PRECISION DEFAULT 100.0,
    half_life_rate DOUBLE PRECISION DEFAULT 0.05,
    last_energy_update TIMESTAMPTZ DEFAULT NOW(),
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
    event_date TIMESTAMPTZ,
    location_lat DECIMAL(9,6),
    location_lng DECIMAL(9,6),
    location_name TEXT,
    use_pseudonym BOOLEAN DEFAULT false,
    energy_reactions JSONB DEFAULT '{}'::jsonb,
    atomic_excitation DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELAS DE ENGAJAMENTO & FEEDBACK

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

CREATE TABLE IF NOT EXISTS public.reproductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    text_content TEXT,
    media_url TEXT,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.curtidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fingerprint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT curtidas_submission_fingerprint_unique UNIQUE (submission_id, fingerprint)
);

CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    reporter_id UUID REFERENCES auth.users(id) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'analisado', 'ignorado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GAMIFICAÇÃO & ANALYTICS

CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_svg TEXT,
    requirement_type TEXT, -- 'submissions', 'xp', 'reactions'
    requirement_threshold INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profile_badges (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (profile_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.kudos_quota_logs (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL,
    action_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reading_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

-- 6. O GRANDE COLISOR (WIKI) & EMARANHAMENTO (CHAT)

CREATE TABLE IF NOT EXISTS public.wiki_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    technical_metadata JSONB DEFAULT '{ "equipment_id": null, "lab_room": null, "safety_level": 1 }'::jsonb,
    is_stable BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wiki_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_article_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    target_article_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    citation_type TEXT DEFAULT 'reference',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_article_id, target_article_id)
);

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

-- 7. FUNÇÕES DE SUPORTE

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        auth.jwt() ->> 'role' = 'admin' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_pseudonym_limit()
RETURNS TRIGGER AS $$
DECLARE v_count INTEGER;
BEGIN
    IF (NEW.use_pseudonym = true) THEN
        SELECT count(id) INTO v_count FROM public.submissions 
        WHERE user_id = NEW.user_id AND use_pseudonym = true AND status IN ('pendente', 'aprovado')
        AND (NEW.id IS NULL OR id <> NEW.id);
        IF v_count >= 2 THEN RAISE EXCEPTION 'LIMITE_PSEUDONIMO_ATINGIDO'; END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.calculate_profile_xp()
RETURNS TRIGGER AS $$
DECLARE
    points INTEGER := 0;
    v_profile_id UUID;
    v_recent_quota_count INTEGER;
BEGIN
    v_profile_id := COALESCE(NEW.user_id, NEW.profile_id);
    IF (TG_TABLE_NAME = 'submissions' AND NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status <> 'aprovado')) THEN
        points := 50;
    ELSIF (TG_TABLE_NAME = 'kudos' AND TG_OP = 'INSERT') THEN
        SELECT COUNT(*) INTO v_recent_quota_count FROM public.kudos_quota_logs WHERE profile_id = v_profile_id AND action_at > NOW() - INTERVAL '1 hour';
        IF v_recent_quota_count < 10 THEN points := 10; INSERT INTO public.kudos_quota_logs (profile_id) VALUES (v_profile_id); END IF;
    END IF;
    IF points > 0 THEN UPDATE public.profiles SET xp = xp + points, level = floor((xp + points) / 100) + 1 WHERE id = v_profile_id; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGERS

DROP TRIGGER IF EXISTS tr_check_pseudonym_limit ON public.submissions;
CREATE TRIGGER tr_check_pseudonym_limit BEFORE INSERT OR UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.check_pseudonym_limit();

DROP TRIGGER IF EXISTS tr_xp_on_submission_approved ON public.submissions;
CREATE TRIGGER tr_xp_on_submission_approved AFTER UPDATE OF status ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.calculate_profile_xp();

-- 9. RLS & POLÍTICAS

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entanglement_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved submissions" ON public.submissions;
CREATE POLICY "Public can view approved submissions" ON public.submissions FOR SELECT USING ((status = 'aprovado') OR public.is_admin() OR (auth.uid() = user_id));

DROP POLICY IF EXISTS "Authenticated users can submitt" ON public.submissions;
CREATE POLICY "Authenticated users can submitt" ON public.submissions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 10. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_subs_tags_gin ON public.submissions USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_subs_event_date ON public.submissions (event_date DESC) WHERE status = 'aprovado';
CREATE INDEX IF NOT EXISTS idx_profiles_xp_leaderboard ON public.profiles (xp DESC);
