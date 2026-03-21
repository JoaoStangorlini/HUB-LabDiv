-- Migration: 20260321_granular_reset.sql
-- Description: Funções para resets granulares na Zona de Perigo.

-- 1. Reset de Perfis (Mantém as trilhas, mas reseta usuários)
CREATE OR REPLACE FUNCTION public.reset_only_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Truncar profiles (isso cascateia para submissions, etc. se houver FK)
  TRUNCATE TABLE public.profiles CASCADE;
  
  -- Remover todos os usuários do auth
  DELETE FROM auth.users;
END;
$$;

-- 2. Reset de Conteúdo (Mantém usuários e trilhas, apaga posts/perguntas/logs)
CREATE OR REPLACE FUNCTION public.reset_only_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  TRUNCATE TABLE public.submissions CASCADE;
  TRUNCATE TABLE public.perguntas CASCADE;
  TRUNCATE TABLE public.comments CASCADE;
  TRUNCATE TABLE public.micro_articles CASCADE;
  TRUNCATE TABLE public.messages CASCADE;
  TRUNCATE TABLE public.entanglement_messages CASCADE;
  TRUNCATE TABLE public.reports CASCADE;
  TRUNCATE TABLE public.feedback_reports CASCADE;
  TRUNCATE TABLE public.notifications CASCADE;
  TRUNCATE TABLE public.quiz_attempts CASCADE;
  TRUNCATE TABLE public.reading_history CASCADE;
  TRUNCATE TABLE public.analytics_plays CASCADE;
  TRUNCATE TABLE public.challenge_submissions CASCADE;
  TRUNCATE TABLE public.adoption_validations CASCADE;
END;
$$;

-- 3. Busca e Destruição (Deleta tudo de um usuário específico)
CREATE OR REPLACE FUNCTION public.delete_specific_user(target_uid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- O delete em auth.users cascateia para public.profiles (via FK ON DELETE CASCADE)
  -- e do profiles para submissions, etc.
  DELETE FROM auth.users WHERE id = target_uid;
END;
$$;

-- 4. Re-granting permissions if needed
GRANT EXECUTE ON FUNCTION public.reset_only_profiles() TO postgres;
GRANT EXECUTE ON FUNCTION public.reset_only_content() TO postgres;
GRANT EXECUTE ON FUNCTION public.delete_specific_user(UUID) TO postgres;
