-- Drop existing policies
DROP POLICY IF EXISTS "Allow all inserts" ON users;

-- Allow inserts (for upsert)
CREATE POLICY "Allow inserts"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow updates (for upsert)
CREATE POLICY "Allow updates"
  ON users FOR UPDATE
  USING (true);
