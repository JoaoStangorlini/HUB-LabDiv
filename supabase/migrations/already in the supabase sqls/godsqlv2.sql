-- ==========================================================
-- 🛡️ HUB DE COMUNICAÇÃO CIENTÍFICA - GOD SQL V2 (CONSOLIDATED)
-- Data: 2026-02-25
-- Contém todas as migrações desde V2.4 até V4.3 (Profile Refactor)
-- ==========================================================

-- [PART 1] 20240524_add_use_pseudonym.sql
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS use_pseudonym BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN public.submissions.use_pseudonym IS 'Flag to indicate if the author name is a pseudonym (limited to 2 per user).';

-- [PART 2] v26_final_trigger.sql (Consolidated Pseudonym Logic V3.9)
CREATE OR REPLACE FUNCTION public.check_pseudonym_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    IF (NEW.use_pseudonym = true AND NEW.status IN ('pendente', 'aprovado')) THEN
        SELECT count(id) INTO v_count 
        FROM public.submissions 
        WHERE user_id = NEW.user_id 
          AND use_pseudonym = true 
          AND status IN ('pendente', 'aprovado')
          AND (NEW.id IS NULL OR id <> NEW.id);
        IF v_count >= 2 THEN
            RAISE EXCEPTION 'LIMITE_PSEUDONIMO_ATINGIDO';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_pseudonym_limit ON public.submissions;
CREATE TRIGGER tr_check_pseudonym_limit
    BEFORE INSERT OR UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.check_pseudonym_limit();

-- [PART 3] 20260222_v24_discovery.sql (Timeline + Maps)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS location_lat DECIMAL(9,6);
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS location_lng DECIMAL(9,6);
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS location_name TEXT;

CREATE TABLE IF NOT EXISTS public.reading_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_event_date ON public.submissions (event_date DESC) WHERE status = 'aprovado' AND event_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_geo ON public.submissions (location_lat, location_lng) WHERE location_lat IS NOT NULL AND status = 'aprovado';
CREATE INDEX IF NOT EXISTS idx_submissions_tags_gin ON public.submissions USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_submissions_authors_fuzzy ON public.submissions USING GIST (authors gist_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_lookup ON public.reading_history (user_id, last_accessed_at DESC);

ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own reading history" ON public.reading_history;
CREATE POLICY "Users can manage their own reading history" ON public.reading_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.search_autocomplete(search_term TEXT)
RETURNS TABLE (suggestion TEXT, type TEXT) AS $$
BEGIN
    RETURN QUERY
    (SELECT DISTINCT s.tag, 'tag' as type FROM (SELECT UNNEST(tags) as tag FROM public.submissions WHERE status = 'aprovado') s WHERE s.tag ILIKE search_term || '%' LIMIT 4)
    UNION ALL
    (SELECT title as suggestion, 'title' as type FROM public.submissions WHERE status = 'aprovado' AND title ILIKE '%' || search_term || '%' ORDER BY views DESC LIMIT 4);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- [PART 4] 20260223_v25_engagement.sql (Collections + Kudos + Notifications)
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS reactions_summary JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS kudos_total INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collection_items (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (collection_id, submission_id)
);

CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kudos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tag_follows (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, tag_name)
);

-- [PART 5] 20260223_v26_intelligence.sql (AI Fields)
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS ocr_content TEXT,
ADD COLUMN IF NOT EXISTS ai_suggested_tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_suggested_alt TEXT,
ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT 'pending' CHECK (ai_status IN ('pending', 'processing', 'completed', 'error')),
ADD COLUMN IF NOT EXISTS ai_last_processed TIMESTAMPTZ;

-- [PART 6] 20260224_v30_monolith_consolidation.sql (Engine V3.0)
CREATE TABLE IF NOT EXISTS public.kudos_quota_logs (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL,
    action_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kudos_quota_profile_time ON public.kudos_quota_logs (profile_id, action_at);

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
    ELSIF (TG_TABLE_NAME = 'reactions' AND TG_OP = 'INSERT') THEN
        points := 5;
    ELSIF (TG_TABLE_NAME = 'kudos' AND TG_OP = 'INSERT') THEN
        SELECT COUNT(*) INTO v_recent_quota_count FROM public.kudos_quota_logs WHERE profile_id = v_profile_id AND action_at > NOW() - INTERVAL '1 hour';
        IF v_recent_quota_count < 10 THEN
            points := 10;
            INSERT INTO public.kudos_quota_logs (profile_id) VALUES (v_profile_id);
        ELSE
            points := 0;
        END IF;
    END IF;
    IF points > 0 THEN
        UPDATE public.profiles SET xp = xp + points, level = floor((xp + points) / 100) + 1 WHERE id = v_profile_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- [PART 7] 20260225_profile_refactor_v31.sql (Shadow System V4.3)
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
ADD COLUMN IF NOT EXISTS completion_year NUMERIC,
ADD COLUMN IF NOT EXISTS major TEXT,
ADD COLUMN IF NOT EXISTS usp_status TEXT,
ADD COLUMN IF NOT EXISTS has_scholarship BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS seeking_scholarship BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS interest_in_team BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS artistic_interests TEXT[] DEFAULT '{}';

CREATE OR REPLACE FUNCTION handle_profile_update_review() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.bio_draft IS DISTINCT FROM OLD.bio_draft THEN
        NEW.review_status := 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_bio_edit ON profiles;
CREATE TRIGGER on_profile_bio_edit BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_profile_update_review();

UPDATE profiles SET is_public = true, review_status = 'approved'
WHERE bio IS NOT NULL AND institute IS NOT NULL AND is_public = false;

DROP POLICY IF EXISTS "Profiles are read-only for review_status" ON profiles;
CREATE POLICY "Profiles are read-only for review_status" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) 
WITH CHECK ((SELECT review_status FROM profiles WHERE id = auth.uid()) = review_status);

-- Indices de Performance
CREATE INDEX IF NOT EXISTS idx_submissions_main_search ON public.submissions (created_at DESC) INCLUDE (title, authors, media_type, category);
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard ON public.profiles (xp DESC) INCLUDE (full_name, avatar_url, level);
