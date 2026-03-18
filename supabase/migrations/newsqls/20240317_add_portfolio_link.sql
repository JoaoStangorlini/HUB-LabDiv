-- Migration: Add Portfolio URL to Profiles Table

DO $$
BEGIN
    -- Check if column exists to avoid errors on multiple runs
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'portfolio_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN portfolio_url TEXT;
    END IF;
END $$;
