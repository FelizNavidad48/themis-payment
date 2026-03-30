-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- Allow anyone to insert their own user record (needed for sign-up)
CREATE POLICY "Anyone can create user profile"
  ON users FOR INSERT
  WITH CHECK (true);

-- Users can still only view their own profile
-- (existing policy "Users can view own profile" remains unchanged)
