import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Apply is intentionally gated until user approval and GitHub write credentials are connected.' }, { status: 501 });
}
