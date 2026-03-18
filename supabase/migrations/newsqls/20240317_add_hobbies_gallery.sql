-- Adiciona coluna hobbies_gallery para armazenar a galeria de artes e hobbies
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hobbies_gallery JSONB DEFAULT '[]'::jsonb;
