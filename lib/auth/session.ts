import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

type SessionPayload = { accessToken: string; login: string; avatarUrl?: string; expiresAt: number };

const cookieName = process.env.SESSION_COOKIE_NAME || 'mrk_session';

function secret() {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error('NEXTAUTH_SECRET is required for secure sessions.');
  return value;
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createState() {
  return randomBytes(24).toString('base64url');
}

export function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function decodeSession(value?: string): SessionPayload | null {
  if (!value) return null;
  const [body, signature] = value.split('.');
  if (!body || !signature) return null;
  const expected = sign(body);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload;
  return payload.expiresAt > Date.now() ? payload : null;
}

export function getSessionCookieName() {
  return cookieName;
}

export async function getSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(cookieName)?.value);
}
