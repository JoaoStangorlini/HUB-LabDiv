-- =========================================
-- PROFILE REFACTOR: RESEARCHER FIELDS
-- =========================================

-- Add specific fields for researchers to signal interest and details
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS research_line TEXT,
ADD COLUMN IF NOT EXISTS office_room TEXT,
ADD COLUMN IF NOT EXISTS laboratory_name TEXT,
ADD COLUMN IF NOT EXISTS department TEXT;

-- Comments for documentation
COMMENT ON COLUMN public.profiles.research_line IS 'The specific research line/area of the researcher';
COMMENT ON COLUMN public.profiles.office_room IS 'The office room number or location';
COMMENT ON COLUMN public.profiles.laboratory_name IS 'The name of the laboratory the researcher is part of';
COMMENT ON COLUMN public.profiles.department IS 'The department alias or full name (e.g., DFMA, FNC)';
