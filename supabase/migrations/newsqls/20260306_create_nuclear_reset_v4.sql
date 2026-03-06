-- Migration: 20260306_create_nuclear_reset_v4.sql
-- Description: Cria a função RPC nuclear_reset_v4 para limpar todas as tabelas e perfis de usuários, apagando todo o conteúdo do site.

CREATE OR REPLACE FUNCTION public.nuclear_reset_v4()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Trunca as tabelas principais. O CASCADE garante que tabelas com chaves estrangeiras que dependem destas também sejam limpas (ex: comentários, curtidas, etc).
  -- A tabela auth.users não pode ser truncada diretamente por aqui facilmente devido a FKs e limitações do Supabase Auth.
  -- Perfis e conteúdo público:
  
  TRUNCATE TABLE public.profiles CASCADE;
  TRUNCATE TABLE public.submissions CASCADE;
  TRUNCATE TABLE public.perguntas CASCADE;
  TRUNCATE TABLE public.messages CASCADE;
  TRUNCATE TABLE public.entanglement_messages CASCADE;
  TRUNCATE TABLE public.learning_trails CASCADE;
  TRUNCATE TABLE public.collections CASCADE;
  TRUNCATE TABLE public.reports CASCADE;
  TRUNCATE TABLE public.feedback_reports CASCADE;
  TRUNCATE TABLE public.notifications CASCADE;
  TRUNCATE TABLE public.quiz_attempts CASCADE;
  TRUNCATE TABLE public.reading_history CASCADE;
  TRUNCATE TABLE public.analytics_plays CASCADE;

  -- Remove usuários do auth.users (isso cascateia para auth.identities, auth.sessions, etc)
  -- NOTA: O auth.users requer privilégios de superuser que a role postgres do Supabase geralmente tem no dashboard/migrations,
  -- mas pode falhar dependendo da role que chama o RPC se não for a correta, por isso usamos SECURITY DEFINER (roda como o criador, usualmente o superuser da migration).
  DELETE FROM auth.users;

END;
$$;
