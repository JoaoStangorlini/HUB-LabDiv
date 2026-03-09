-- Migration: Add prerequisites column to learning_trails
-- Project: IF-USP Hub Lab-Div

ALTER TABLE public.learning_trails 
ADD COLUMN IF NOT EXISTS prerequisites text[] DEFAULT '{}';

-- Garantir que registros existentes não fiquem nulos
UPDATE public.learning_trails 
SET prerequisites = '{}' 
WHERE prerequisites IS NULL;
