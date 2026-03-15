-- Migration: IAM and Match Acadêmico
-- Description: Adds user_category enum and Match flags to profiles.

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_category') THEN
        CREATE TYPE public.user_category AS ENUM ('curioso', 'aluno_usp', 'pesquisador');
    END IF;
END $$;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_category public.user_category DEFAULT 'curioso';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS seeking_ic boolean DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS seeking_assistant boolean DEFAULT false;

COMMENT COLUMN public.profiles.user_category IS 'Category of the user: curioso, aluno_usp, or pesquisador.';
COMMENT COLUMN public.profiles.seeking_ic IS 'Flag for students looking for Undergraduate Research (IC).';
COMMENT COLUMN public.profiles.seeking_assistant IS 'Flag for researchers looking for academic assistants.';
