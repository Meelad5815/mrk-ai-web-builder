import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { inspectRepository } from '@/lib/github/client';
import { toPublicError } from '@/lib/utils/errors';

export async function GET(request: NextRequest, { params }: { params: Promise<{ owner: string; repo: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Please connect GitHub first.' }, { status: 401 });
    const { owner, repo } = await params;
    const branch = new URL(request.url).searchParams.get('branch') || 'HEAD';
    return NextResponse.json({ inspection: await inspectRepository(session.accessToken, owner, repo, branch) });
  } catch (error) {
    const publicError = toPublicError(error, 'Repository inspection failed.');
    return NextResponse.json({ error: publicError.message }, { status: publicError.status });
  }
}
