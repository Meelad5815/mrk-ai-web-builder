import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { encodeSession, getSessionCookieName } from '@/lib/auth/session';
import { exchangeCodeForToken, fetchGitHubUser } from '@/lib/github/oauth';
import { toPublicError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const cookieStore = await cookies();
    if (!code || !state || cookieStore.get('mrk_oauth_state')?.value !== state) throw new Error('Invalid GitHub sign-in state.');
    const accessToken = await exchangeCodeForToken(code);
    const user = await fetchGitHubUser(accessToken);
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set(getSessionCookieName(), encodeSession({ accessToken, login: user.login, avatarUrl: user.avatar_url, expiresAt: Date.now() + 1000 * 60 * 60 * 8 }), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 8, path: '/' });
    response.cookies.delete('mrk_oauth_state');
    return response;
  } catch (error) {
    const publicError = toPublicError(error, 'GitHub connection failed. Please reconnect your GitHub account.');
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(publicError.message)}`, request.url));
  }
}
