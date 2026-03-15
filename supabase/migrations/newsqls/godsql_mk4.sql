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

CREATE POLICY "Public can view micro-article likes" 
ON public.micro_article_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can toggle micro-article likes" 
ON public.micro_article_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert anonymous likes via fingerprint" 
ON public.micro_article_likes FOR INSERT WITH CHECK (true);

-- 3. Função RPC para alternar Like (Toggle)
-- Esta função é SECURITY DEFINER para permitir atualização do cache de likes na tabela micro_articles
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
    -- Prioridade para usuário logado
    IF p_user_id IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM micro_article_likes WHERE article_id = p_article_id AND user_id = p_user_id) THEN
            DELETE FROM micro_article_likes WHERE article_id = p_article_id AND user_id = p_user_id;
            was_liked := false;
        ELSE
            INSERT INTO micro_article_likes (article_id, user_id) VALUES (p_article_id, p_user_id);
            was_liked := true;
        END IF;
    -- Fallback para fingerprint (anônimos)
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

    -- Sincronizar cache de likes na tabela principal
    SELECT COUNT(*) INTO current_count FROM micro_article_likes WHERE article_id = p_article_id;
    UPDATE micro_articles SET likes_count = current_count WHERE id = p_article_id;

    RETURN jsonb_build_object(
      'liked', was_liked,
      'count', current_count
    );
END;
$$;

COMMENT ON COLUMN public.micro_articles.likes_count IS 'Cache atomico de curtidas sincronizado via RPC.';
