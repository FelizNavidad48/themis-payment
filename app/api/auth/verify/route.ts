import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();

    const nonce = request.cookies.get('siwe-nonce')?.value;

    if (!nonce) {
      return NextResponse.json(
        { error: 'Nonce not found' },
        { status: 400 }
      );
    }

    // Create SiweMessage from the EXACT message text that was signed
    const siweMessage = new SiweMessage(message);

    // Verify the signature
    const fields = await siweMessage.verify({ signature, nonce });

    if (!fields.success) {
      console.error('Verification failed:', fields.error);
      return NextResponse.json(
        { error: 'Verification failed', details: fields.error?.type },
        { status: 401 }
      );
    }

    const walletAddress = fields.data.address.toLowerCase();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const { error: upsertError } = await (supabase
      .from('users')
      .upsert as Function)({ wallet_address: walletAddress }, { onConflict: 'wallet_address', ignoreDuplicates: true });

    if (upsertError) {
      console.error('Supabase error:', upsertError);
    }

    return NextResponse.json(
      { address: walletAddress },
      {
        headers: {
          'Set-Cookie': `siwe-session=${walletAddress}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
        },
      }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
