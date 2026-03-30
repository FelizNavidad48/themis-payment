-- Create users table
CREATE TABLE users (
  wallet_address TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  display_name TEXT,
  custom_url_slug TEXT UNIQUE,
  branding_color TEXT,
  branding_logo_url TEXT
);

-- Create payment_links table
CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  recipient_wallet_address TEXT NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  memo TEXT,
  short_url TEXT NOT NULL UNIQUE,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed')),
  custom_branding_enabled BOOLEAN NOT NULL DEFAULT false
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_link_id UUID NOT NULL REFERENCES payment_links(id) ON DELETE CASCADE,
  sender_wallet_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  amount DECIMAL(20, 6) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX idx_payment_links_creator ON payment_links(creator_wallet_address);
CREATE INDEX idx_payment_links_short_url ON payment_links(short_url);
CREATE INDEX idx_payment_links_status ON payment_links(status);
CREATE INDEX idx_transactions_payment_link ON transactions(payment_link_id);
CREATE INDEX idx_transactions_sender ON transactions(sender_wallet_address);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (wallet_address = current_setting('app.current_wallet_address', true));

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  WITH CHECK (wallet_address = current_setting('app.current_wallet_address', true));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (wallet_address = current_setting('app.current_wallet_address', true));

-- RLS Policies for payment_links table
-- Anyone can view active payment links
CREATE POLICY "Anyone can view active payment links"
  ON payment_links FOR SELECT
  USING (status = 'active' OR creator_wallet_address = current_setting('app.current_wallet_address', true));

-- Users can create their own payment links
CREATE POLICY "Users can create own payment links"
  ON payment_links FOR INSERT
  WITH CHECK (creator_wallet_address = current_setting('app.current_wallet_address', true));

-- Users can update their own payment links
CREATE POLICY "Users can update own payment links"
  ON payment_links FOR UPDATE
  USING (creator_wallet_address = current_setting('app.current_wallet_address', true));

-- RLS Policies for transactions table
-- Anyone can insert transactions (when paying)
CREATE POLICY "Anyone can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- Users can view transactions for their payment links or their own payments
CREATE POLICY "Users can view related transactions"
  ON transactions FOR SELECT
  USING (
    sender_wallet_address = current_setting('app.current_wallet_address', true)
    OR
    EXISTS (
      SELECT 1 FROM payment_links
      WHERE payment_links.id = transactions.payment_link_id
      AND payment_links.creator_wallet_address = current_setting('app.current_wallet_address', true)
    )
  );

-- Function to automatically expire payment links
CREATE OR REPLACE FUNCTION expire_payment_links()
RETURNS void AS $$
BEGIN
  UPDATE payment_links
  SET status = 'expired'
  WHERE expires_at < NOW()
  AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run expiration check (if pg_cron extension is available)
-- This would need to be set up manually in Supabase dashboard if needed
-- For now, we'll handle expiration checks in the application layer
