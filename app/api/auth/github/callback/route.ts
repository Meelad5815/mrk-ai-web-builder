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
import { NextResponse } from 'next/server';
import { sealToken } from '@/lib/session';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const jar = await cookies();
  const savedState = jar.get('github_oauth_state')?.value;
  if (!code || !state || !savedState || state !== savedState) return NextResponse.json({ error: 'Invalid GitHub OAuth state.' }, { status: 400 });
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.json({ error: 'GitHub OAuth is not configured.' }, { status: 503 });
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', { method:'POST', headers:{Accept:'application/json','Content-Type':'application/json'}, body:JSON.stringify({client_id:clientId,client_secret:clientSecret,code,state}) });
  const data = await tokenResponse.json() as { access_token?: string; error?: string };
  if (!tokenResponse.ok || !data.access_token) return NextResponse.json({ error: data.error || 'GitHub authorization failed.' }, { status: 400 });
  const sealed = await sealToken(data.access_token);
  jar.set('mrk_github_session', sealed, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', maxAge:60*60*24*7, path:'/' });
  jar.delete('github_oauth_state');
  return NextResponse.redirect(new URL('/', request.url));
}
