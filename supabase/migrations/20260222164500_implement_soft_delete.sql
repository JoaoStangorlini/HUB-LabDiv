-- ==========================================================
-- FEATURE #2: Implement Soft Delete
-- Created at: 2026-02-22
-- ==========================================================

-- 1. Adicionar 'deleted' ao enum submission_status
-- O PostgreSQL não permite que ADD VALUE seja executado dentro de um bloco de transação com outros comandos que usam o tipo.
-- No entanto, em migrations do Supabase/Postgres, podemos rodar separadamente.
ALTER TYPE public.submission_status ADD VALUE IF NOT EXISTS 'deleted';

-- 2. Atualizar Políticas de RLS para filtrar 'deleted' automaticamente em SELECTs
-- Nota: 'aprovado' já é diferente de 'deleted', mas reforçamos a exclusão lógica.

-- Submissions
DROP POLICY IF EXISTS "Public can view approved submissions" ON public.submissions;
CREATE POLICY "Public can view approved submissions" 
    ON public.submissions FOR SELECT 
    USING ((status = 'aprovado' AND status <> 'deleted') OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Comments
DROP POLICY IF EXISTS "Anyone can read all comments" ON public.comments;
CREATE POLICY "Anyone can read all comments" 
    ON public.comments FOR SELECT 
    USING (status <> 'deleted' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Reproductions
DROP POLICY IF EXISTS "Anyone can read all reproductions" ON public.reproductions;
CREATE POLICY "Anyone can read all reproductions" 
    ON public.reproductions FOR SELECT 
    USING (status <> 'deleted' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Testimonials
DROP POLICY IF EXISTS "Testemunhos aprovados são públicos" ON public.testimonials;
CREATE POLICY "Testemunhos aprovados são públicos" 
    ON public.testimonials FOR SELECT 
    USING ((status = 'aprovado' AND status <> 'deleted') OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
