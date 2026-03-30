import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Get session from cookie
    const session = request.cookies.get('siwe-session')?.value;

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const walletAddress = session.toLowerCase();

    const { amount, memo, shortUrl, qrCodeUrl, expiresAt } = await request.json();

    // First, ensure the user exists (using upsert to avoid duplicate key errors)
    const { error: upsertError } = await (supabase
      .from('users')
      .upsert as Function)(
        { wallet_address: walletAddress },
        { onConflict: 'wallet_address', ignoreDuplicates: true }
      );

    if (upsertError && upsertError.code !== '23505') {
      console.error('User upsert error:', upsertError);
      return NextResponse.json(
        { error: 'Failed to ensure user exists', details: upsertError.message },
        { status: 500 }
      );
    }

    // Insert payment link
    const { data, error } = await supabase
      .from('payment_links')
      .insert({
        creator_wallet_address: walletAddress,
        recipient_wallet_address: walletAddress,
        amount: amount,
        memo: memo || null,
        short_url: shortUrl,
        qr_code_url: qrCodeUrl,
        expires_at: expiresAt,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create payment link', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Create payment link error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}
