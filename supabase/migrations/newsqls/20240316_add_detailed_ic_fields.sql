-- Migration: Add detailed IC fields to profiles
-- Date: 2024-03-16

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ic_research_area text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ic_preferred_department text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ic_preferred_lab text;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.ic_research_area IS 'Area of research interest for IC (Iniciação Científica)';
COMMENT ON COLUMN public.profiles.ic_preferred_department IS 'Preferred department for research';
COMMENT ON COLUMN public.profiles.ic_preferred_lab IS 'Preferred laboratory for research';
