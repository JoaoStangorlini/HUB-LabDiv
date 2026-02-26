-- PROFILE REFACTOR V3.3 (EMERGENCY PROTOCOL)
-- Adding Shadow Approval System, Advanced Segmented Fields, and Automated Review Workflow

-- 1. Create enum for review status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_review_status') THEN
        CREATE TYPE profile_review_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- 2. Add new and missing columns (Ensuring institute exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS institute TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS review_status profile_review_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS bio_draft TEXT,
ADD COLUMN IF NOT EXISTS completion_year NUMERIC,
ADD COLUMN IF NOT EXISTS major TEXT,
ADD COLUMN IF NOT EXISTS usp_status TEXT,
ADD COLUMN IF NOT EXISTS has_scholarship BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS seeking_scholarship BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS interest_in_team BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS artistic_interests TEXT[] DEFAULT '{}';

-- 3. AUTOMATED REVIEW TRIGGER
-- Automatically sets status to 'pending' if bio_draft is updated
CREATE OR REPLACE FUNCTION handle_profile_update_review() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.bio_draft IS DISTINCT FROM OLD.bio_draft THEN
        NEW.review_status := 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_bio_edit ON profiles;
CREATE TRIGGER on_profile_bio_edit
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_profile_update_review();

-- 4. Set existing profiles as public if they already have bio/institute
UPDATE profiles 
SET is_public = true, review_status = 'approved'
WHERE bio IS NOT NULL AND institute IS NOT NULL AND is_public = false;

-- 5. RLS Policy for review_status protection
-- Users can't change their own review_status to 'approved'
DROP POLICY IF EXISTS "Profiles are read-only for review_status" ON profiles;
CREATE POLICY "Profiles are read-only for review_status" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (
  (SELECT review_status FROM profiles WHERE id = auth.uid()) = review_status
);

COMMENT ON COLUMN profiles.is_public IS 'Controls if the profile is visible in researchers list';
COMMENT ON COLUMN profiles.review_status IS 'Admin approval status for new profiles or major edits';
COMMENT ON COLUMN profiles.bio_draft IS 'Temporary storage for bio edits while profile is already public';
COMMENT ON COLUMN profiles.artistic_interests IS 'Structured data for arts and hobbies (musician, painter, etc)';
