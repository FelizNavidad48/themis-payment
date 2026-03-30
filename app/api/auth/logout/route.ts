import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: true },
    {
      headers: {
        'Set-Cookie': 'siwe-session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
      },
    }
  );
}
