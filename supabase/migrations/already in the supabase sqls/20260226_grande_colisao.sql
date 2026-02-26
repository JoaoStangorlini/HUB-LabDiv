-- ==========================================================
-- V3.2.0 THE BIG COLLIDER: INFRAESTRUTURA TÉCNICA
-- Local: supabase/migrations/newsqls/20260226_grande_colisao.sql
-- ==========================================================

-- 1. O GRANDE COLISOR (WIKI GRAPH)
CREATE TABLE IF NOT EXISTS public.wiki_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    technical_metadata JSONB DEFAULT '{ "equipment_id": null, "lab_room": null, "safety_level": 1 }'::jsonb,
    is_stable BOOLEAN DEFAULT false, -- Se true, não sofre decaimento de energia (meia-vida infinita)
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wiki_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_article_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    target_article_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    citation_type TEXT DEFAULT 'reference', -- 'equipment', 'lab', 'theory'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_article_id, target_article_id)
);

-- 2. ENERGIA ATÔMICA & DECAIMENTO LAZY (PERSISTÊNCIA)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS atomic_excitation DOUBLE PRECISION DEFAULT 100.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS half_life_rate DOUBLE PRECISION DEFAULT 0.05; -- Lambda do decaimento
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_energy_update TIMESTAMPTZ DEFAULT NOW();

-- 3. EMARANHAMENTO (CHAT DE DADOS)
CREATE TABLE IF NOT EXISTS public.entanglement_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_particle_id UUID, -- ID de um item do Fluxo ou do Colisor
    attachment_type TEXT CHECK (attachment_type IN ('particle', 'article')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ÍNDICES DE BUSCA TÉCNICA
CREATE INDEX IF NOT EXISTS idx_wiki_slug ON public.wiki_articles (slug);
CREATE INDEX IF NOT EXISTS idx_wiki_parent ON public.wiki_articles (parent_id);
CREATE INDEX IF NOT EXISTS idx_entanglement_pair ON public.entanglement_messages (sender_id, receiver_id);

-- 5. RLS (SEGURANÇA ACADÊMICA)
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entanglement_messages ENABLE ROW LEVEL SECURITY;

-- Wiki: Leitura pública, Escrita apenas por Admins ou Pesquisadores (role 'admin' ou meta 'scientist')
CREATE POLICY "Leitura pública do Colisor" ON public.wiki_articles FOR SELECT USING (true);
CREATE POLICY "Apenas admins/cientistas escrevem no Colisor" ON public.wiki_articles 
FOR ALL USING (public.is_admin());

-- Emaranhamento: Apenas participantes leem
CREATE POLICY "Privacidade do Emaranhamento" ON public.entanglement_messages 
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Envio de Partículas" ON public.entanglement_messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);
