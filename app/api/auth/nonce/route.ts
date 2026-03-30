import { NextResponse } from 'next/server';
import { generateNonce } from 'siwe';

export async function GET() {
  const nonce = generateNonce();

  return NextResponse.json({ nonce }, {
    headers: {
      'Set-Cookie': `siwe-nonce=${nonce}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=600`,
    },
  });
}
