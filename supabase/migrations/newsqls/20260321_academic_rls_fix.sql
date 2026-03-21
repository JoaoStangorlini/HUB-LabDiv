/*
  # Academic Visibility RLS Fix
  
  Enables authenticated users to view completed trails and trail progress.
  Required for the Arena / Match Acadêmico feature where researchers view student profiles.
*/

-- Unify SELECT access for authenticated users on academic tables
DROP POLICY IF EXISTS "Public can view completed trails" ON user_completed_trails;
CREATE POLICY "Public can view completed trails" 
ON user_completed_trails FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Public can view trail progress" ON user_trail_progress;
CREATE POLICY "Public can view trail progress" 
ON user_trail_progress FOR SELECT 
TO authenticated 
USING (true);
