-- [MK4] EXPANSAO DOS LOGS: ATOMIC LIKES
-- Criado em: 2026-03-15
-- Descricao: Implementa o sistema de curtidas atômicas e infraestrutura para o temporizador.

-- 1. Criar tabela de curtidas para micro-artigos (Drops)
CREATE TABLE IF NOT EXISTS public.micro_article_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES public.micro_articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    fingerprint TEXT, -- Para curtidas anônimas/visitantes
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Um usuário ou digital só pode curtir uma vez por post
    CONSTRAINT micro_article_likes_user_unique UNIQUE(article_id, user_id),
    CONSTRAINT micro_article_likes_fingerprint_unique UNIQUE(article_id, fingerprint)
);

-- 2. Segurança RLS
ALTER TABLE public.micro_article_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view micro-article likes" ON public.micro_article_likes;
CREATE POLICY "Public can view micro-article likes" 
ON public.micro_article_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can toggle micro-article likes" ON public.micro_article_likes;
CREATE POLICY "Authenticated users can toggle micro-article likes" 
ON public.micro_article_likes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert anonymous likes via fingerprint" ON public.micro_article_likes;
CREATE POLICY "Anyone can insert anonymous likes via fingerprint" 
ON public.micro_article_likes FOR INSERT WITH CHECK (true);

-- 3. Função RPC para alternar Like (Toggle)
CREATE OR REPLACE FUNCTION public.toggle_micro_article_like(p_article_id UUID, p_user_id UUID, p_fingerprint TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_count INT;
    was_liked BOOLEAN;
BEGIN
    IF p_user_id IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM micro_article_likes WHERE article_id = p_article_id AND user_id = p_user_id) THEN
            DELETE FROM micro_article_likes WHERE article_id = p_article_id AND user_id = p_user_id;
            was_liked := false;
        ELSE
            INSERT INTO micro_article_likes (article_id, user_id) VALUES (p_article_id, p_user_id);
            was_liked := true;
        END IF;
    ELSIF p_fingerprint IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM micro_article_likes WHERE article_id = p_article_id AND fingerprint = p_fingerprint) THEN
            DELETE FROM micro_article_likes WHERE article_id = p_article_id AND fingerprint = p_fingerprint;
            was_liked := false;
        ELSE
            INSERT INTO micro_article_likes (article_id, fingerprint) VALUES (p_article_id, p_fingerprint);
            was_liked := true;
        END IF;
    ELSE
        RETURN jsonb_build_object('error', 'Carga de identidade ausente');
    END IF;

    SELECT COUNT(*) INTO current_count FROM micro_article_likes WHERE article_id = p_article_id;
    UPDATE micro_articles SET likes_count = current_count WHERE id = p_article_id;

    RETURN jsonb_build_object(
      'liked', was_liked,
      'count', current_count
    );
END;
$$;

COMMENT ON COLUMN public.micro_articles.likes_count IS 'Cache atomico de curtidas sincronizado via RPC.';

-- =========================================
-- [MK5] PROFILE REFACTOR: RESEARCHER FIELDS
-- =========================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS research_line TEXT,
ADD COLUMN IF NOT EXISTS office_room TEXT,
ADD COLUMN IF NOT EXISTS laboratory_name TEXT,
ADD COLUMN IF NOT EXISTS department TEXT;

COMMENT ON COLUMN public.profiles.research_line IS 'The specific research line/area of the researcher';
COMMENT ON COLUMN public.profiles.office_room IS 'The office room number or location';
COMMENT ON COLUMN public.profiles.laboratory_name IS 'The name of the laboratory the researcher is part of';
COMMENT ON COLUMN public.profiles.department IS 'The department alias or full name (e.g., DFMA, FNC)';

-- =========================================
-- [MK6] ENTANGLED GROUPS
-- =========================================

CREATE TABLE IF NOT EXISTS public.entangled_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Grupo Emaranhado',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.entangled_group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.entangled_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.entangled_groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.entangled_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entangled_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their groups" ON public.entangled_groups;
CREATE POLICY "Users can view their groups"
    ON public.entangled_groups FOR SELECT
    USING (id IN (SELECT group_id FROM public.entangled_group_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create groups" ON public.entangled_groups;
CREATE POLICY "Users can create groups"
    ON public.entangled_groups FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view group members" ON public.entangled_group_members;
CREATE POLICY "Users can view group members"
    ON public.entangled_group_members FOR SELECT
    USING (group_id IN (SELECT group_id FROM public.entangled_group_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can add members to their groups" ON public.entangled_group_members;
CREATE POLICY "Users can add members to their groups"
    ON public.entangled_group_members FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Group members can view messages" ON public.group_messages;
CREATE POLICY "Group members can view messages"
    ON public.group_messages FOR SELECT
    USING (group_id IN (SELECT group_id FROM public.entangled_group_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Group members can send messages" ON public.group_messages;
CREATE POLICY "Group members can send messages"
    ON public.group_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        group_id IN (SELECT group_id FROM public.entangled_group_members WHERE user_id = auth.uid())
    );

-- Enable realtime for group messages (safe to re-run)
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.entangled_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.entangled_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON public.group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created ON public.group_messages(created_at);

-- =========================================
-- [MK7] DATA FIX: MOJIBAKE CLEANUP
-- =========================================

-- Corrige problemas de acentuação (UTF-8 moibake) na tabela de trilhas
UPDATE public.learning_trails
SET title = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(title, 
    'Ã¡', 'á'), 
    'Ã§', 'ç'), 
    'Ãµ', 'õ'), 
    'Ã©', 'é'), 
    'Ã­', 'í'), 
    'Ã³', 'ó'), 
    'Ãº', 'ú'), 
    'Ã¢', 'â'), 
    'Ãª', 'ê'), 
    'Ã´', 'ô'), 
    'Ã£', 'ã'), 
    'Ã ', 'à')
WHERE title LIKE '%Ã%';

COMMENT ON TABLE public.learning_trails IS 'Fixed mojibake encoding in titles on 2026-03-15';

-- ========================================================
-- [MK8] CALENDAR & CUSTOM BLOCKS
-- ========================================================

-- 1. Table for Custom Blocks (the "templates" in the top list)
CREATE TABLE IF NOT EXISTS public.user_custom_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration FLOAT NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_custom_blocks ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage own custom blocks" ON public.user_custom_blocks;
CREATE POLICY "Users can manage own custom blocks" ON public.user_custom_blocks
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Table for Calendar Events (the actual schedule)
CREATE TABLE IF NOT EXISTS public.user_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trail_id UUID REFERENCES public.learning_trails(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    type TEXT DEFAULT 'aula', -- 'aula', 'estudo', 'custom'
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_calendar_events ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage own calendar events" ON public.user_calendar_events;
CREATE POLICY "Users can manage own calendar events" ON public.user_calendar_events
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Indices
CREATE INDEX IF NOT EXISTS idx_calendar_events_user ON public.user_calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_blocks_user ON public.user_custom_blocks(user_id);

