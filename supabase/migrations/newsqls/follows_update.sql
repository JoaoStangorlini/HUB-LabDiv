-- 1. Reformular tabela follows para usar IDs de perfis reais
-- Primeiro, vamos garantir que a tabela suporte UUIDs em vez de texto
ALTER TABLE public.follows DROP COLUMN IF EXISTS following_author;
ALTER TABLE public.follows ADD COLUMN IF NOT EXISTS following_id UUID REFERENCES public.profiles(id);

-- 2. Adicionar restrição de unicidade para evitar seguidores duplicados
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follow_uniqueness;
ALTER TABLE public.follows ADD CONSTRAINT follow_uniqueness UNIQUE (follower_id, following_id);

-- 3. Atualizar Políticas de RLS para follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own follows" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;

-- Qualquer um autenticado pode ver quem segue quem
CREATE POLICY "Public follows visibility" 
ON public.follows FOR SELECT 
TO authenticated 
USING (true);

-- Usuários podem seguir outros (inserir registro com seu follower_id)
CREATE POLICY "Users can follow others" 
ON public.follows FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = follower_id);

-- Usuários podem deixar de seguir (deletar seu próprio registro)
CREATE POLICY "Users can unfollow" 
ON public.follows FOR DELETE 
TO authenticated 
USING (auth.uid() = follower_id);
