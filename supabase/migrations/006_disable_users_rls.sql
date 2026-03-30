-- Disable RLS on users table since we validate on server side with session cookies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (they're not needed without RLS)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Allow inserts" ON users;
DROP POLICY IF EXISTS "Allow updates" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
