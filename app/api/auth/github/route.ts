import { NextResponse } from 'next/server';
import { createState } from '@/lib/auth/session';
import { getGitHubAuthUrl } from '@/lib/github/oauth';
import { toPublicError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const state = createState();
    const response = NextResponse.redirect(getGitHubAuthUrl(state));
    response.cookies.set('mrk_oauth_state', state, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' });
    return response;
  } catch (error) {
    const publicError = toPublicError(error, 'GitHub sign in could not start.');
    return NextResponse.json({ error: publicError.message }, { status: publicError.status });
  }
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callback = process.env.GITHUB_CALLBACK_URL;
  if (!clientId || !callback) return NextResponse.json({ error: 'GitHub OAuth is not configured yet.' }, { status: 503 });
  const state = randomBytes(24).toString('hex');
  const jar = await cookies();
  jar.set('github_oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/' });
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', callback);
  url.searchParams.set('scope', 'repo read:user');
  url.searchParams.set('state', state);
  return NextResponse.redirect(url);
}
