-- Migration: Add isotopes to submissions table
-- For sprint 11: Interest Analysis

-- 1. Add isotopes column
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS isotopes text[] DEFAULT '{}'::text[];

-- 2. Add index for better performance when querying by isotope
CREATE INDEX IF NOT EXISTS idx_submissions_isotopes ON public.submissions USING GIN (isotopes);

-- 3. Update RLS (if needed, but usually automatically handled by table permissions)
-- Profiles that can select/update/delete submissions can still do so.
