-- =============================================
-- SPRINT 4 MIGRATION SCRIPT
-- =============================================

-- 1. Adicionar coluna 'status' na tabela 'comments'
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente' NOT NULL;

-- 2. Adicionar coluna 'status' na tabela 'contatos'
ALTER TABLE public.contatos ADD COLUMN IF NOT EXISTS status text DEFAULT 'nova' NOT NULL;

-- 3. Atualizar Row Level Security (RLS) para Comentários
-- Remover política antiga se houver e criar uma que filtre por status aprovado para o público
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Public can view approved comments" ON public.comments 
  FOR SELECT USING (status = 'aprovado');

-- 4. Criar política de leitura para admins em Contatos (se não existir)
-- Nota: A tabela contatos já possui políticas básicas, mas garantimos que admins vejam tudo.
DROP POLICY IF EXISTS "Only admins can view contatos" ON public.contatos;
CREATE POLICY "Only admins can view contatos" ON public.contatos 
  FOR SELECT USING (auth.role() = 'authenticated');

-- 5. Garantir que Admins podem atualizar status de comentários e contatos
CREATE POLICY "Admins can update comments" ON public.comments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update contatos" ON public.contatos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete comments" ON public.comments
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete contatos" ON public.contatos
  FOR DELETE USING (auth.role() = 'authenticated');
