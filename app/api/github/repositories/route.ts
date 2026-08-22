import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listRepositories } from '@/lib/github/client';
import { toPublicError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Please connect GitHub first.' }, { status: 401 });
    return NextResponse.json({ repositories: await listRepositories(session.accessToken) });
  } catch (error) {
    const publicError = toPublicError(error, 'Repositories could not be loaded.');
    return NextResponse.json({ error: publicError.message }, { status: publicError.status });
  }
}
