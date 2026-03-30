import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { supabase } from '@/lib/supabase';

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

    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature, nonce });

    if (!fields.success) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 401 }
      );
    }

    const walletAddress = fields.data.address.toLowerCase();

    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        { wallet_address: walletAddress },
        { onConflict: 'wallet_address' }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
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
