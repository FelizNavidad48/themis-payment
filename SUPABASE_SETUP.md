# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: Themis Payment
   - **Database Password**: (generate a strong password and save it)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (sufficient for MVP)
5. Click "Create new project"
6. Wait ~2 minutes for project to be ready

## Step 2: Get API Keys

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Add them to your `.env.local` file

## Step 3: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (bottom right)
6. You should see "Success. No rows returned"

## Step 4: Verify Tables

1. Go to **Table Editor** in Supabase dashboard
2. You should see 3 tables:
   - `users`
   - `payment_links`
   - `transactions`
3. Click each table to verify columns are correct

## Step 5: Test Connection

1. In your Next.js app, the Supabase client should now be configured
2. Start your dev server: `pnpm dev`
3. Check console for any Supabase connection errors
4. If you see no errors, connection is successful!

## Database Schema Overview

### users table
- `wallet_address` (PK) - Ethereum/Polygon wallet address
- `created_at` - Account creation timestamp
- `display_name` - Optional display name
- `custom_url_slug` - Custom URL for payment pages (e.g., themis.app/pay/alice)
- `branding_color` - Custom brand color (hex code)
- `branding_logo_url` - Custom logo URL

### payment_links table
- `id` (PK) - UUID
- `creator_wallet_address` (FK) - Who created the link
- `recipient_wallet_address` - Where funds should go
- `amount` - Amount in USDT
- `memo` - Optional payment description
- `short_url` - Unique short URL identifier
- `qr_code_url` - URL to QR code image
- `created_at` - Creation timestamp
- `expires_at` - Optional expiration timestamp
- `status` - active | expired | completed
- `custom_branding_enabled` - Whether to use custom branding

### transactions table
- `id` (PK) - UUID
- `payment_link_id` (FK) - Associated payment link
- `sender_wallet_address` - Who paid
- `tx_hash` - Blockchain transaction hash
- `amount` - Amount paid in USDT
- `status` - pending | completed | failed
- `created_at` - Transaction creation timestamp
- `confirmed_at` - Blockchain confirmation timestamp

## Security: Row Level Security (RLS)

All tables have RLS enabled with these policies:

### users table
- Users can only read/write their own profile
- Based on `app.current_wallet_address` setting

### payment_links table
- Anyone can view active payment links
- Users can only create/update their own links

### transactions table
- Anyone can create transactions (when paying)
- Users can view transactions for their links or their payments

## Next Steps

After Supabase is set up:

1. ✅ Test wallet authentication (SIWE)
2. ✅ Create first payment link
3. ✅ Verify data saves to Supabase
4. ✅ Test transaction recording
5. ✅ Build out dashboard UI

## Troubleshooting

### "Invalid API Key"
- Check your `.env.local` has correct keys
- Restart dev server after adding keys

### "Row Level Security policy violation"
- Make sure you're setting `app.current_wallet_address` before queries
- Check RLS policies in Supabase dashboard

### "Connection refused"
- Check your project is not paused (Free tier pauses after 1 week inactivity)
- Verify SUPABASE_URL is correct

### Migration fails
- Check SQL syntax in migration file
- Try running queries one at a time
- Check Supabase logs for detailed error
