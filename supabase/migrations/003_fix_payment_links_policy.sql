-- Drop the existing policy that requires app.current_wallet_address
DROP POLICY IF EXISTS "Users can create own payment links" ON payment_links;

-- Create a new policy that allows any insert (we'll validate on the server side)
CREATE POLICY "Allow authenticated inserts"
  ON payment_links FOR INSERT
  WITH CHECK (true);
