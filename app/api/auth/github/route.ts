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
}
