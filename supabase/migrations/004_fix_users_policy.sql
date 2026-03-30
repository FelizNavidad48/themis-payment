-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Anyone can create user profile" ON users;

-- Allow any insert (we validate on server side with session cookie)
CREATE POLICY "Allow all inserts"
  ON users FOR INSERT
  WITH CHECK (true);

-- Users can view their own profile
-- (keeping this policy as is for security)
