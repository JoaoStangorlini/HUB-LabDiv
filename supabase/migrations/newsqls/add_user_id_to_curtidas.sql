-- Add user_id column to curtidas (nullable to not break existing fingerprint-based likes)
ALTER TABLE public.curtidas ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for fast user-based lookups
CREATE INDEX IF NOT EXISTS idx_curtidas_user_id ON public.curtidas(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_curtidas_user_submission ON public.curtidas(user_id, submission_id) WHERE user_id IS NOT NULL;
