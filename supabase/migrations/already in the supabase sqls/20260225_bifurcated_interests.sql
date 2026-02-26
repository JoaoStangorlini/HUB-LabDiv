-- Add bifurcated interest columns for Team LabDiv
-- Created: 2026-02-25
-- Ref: V3.4 'Clean Slate' Refinement

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS interest_help_comm BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS interest_learn_prod BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.interest_help_comm IS 'User wants to help improve scientific communication.';
COMMENT ON COLUMN public.profiles.interest_learn_prod IS 'User wants to learn how to produce outreach materials.';
