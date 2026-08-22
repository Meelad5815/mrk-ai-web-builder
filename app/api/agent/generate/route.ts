import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { runAgentPlanning } from '@/lib/agent/workflow';
import { toPublicError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please connect GitHub before using the AI coding agent.' }, { status: 401 });
    }

    const body = (await request.json()) as Parameters<typeof runAgentPlanning>[0];
    if (!body.request || !body.inspection) {
      return NextResponse.json({ error: 'A request and repository inspection are required.' }, { status: 400 });
    }

    return NextResponse.json(await runAgentPlanning(body));
  } catch (error) {
    const publicError = toPublicError(error, 'AI change generation failed.');
    return NextResponse.json({ error: publicError.message }, { status: publicError.status });
  }
}
