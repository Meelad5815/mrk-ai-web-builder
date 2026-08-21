import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ authenticated: Boolean(session), user: session ? { login: session.login, avatarUrl: session.avatarUrl } : null });
}
