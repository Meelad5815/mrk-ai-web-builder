import { cookies } from 'next/headers';
import { createCipheriv, createDecipheriv, createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

type SessionPayload = { accessToken: string; login: string; avatarUrl?: string; expiresAt: number };

const cookieName = process.env.SESSION_COOKIE_NAME || 'mrk_session';

function secret() {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error('NEXTAUTH_SECRET is required for secure sessions.');
  return createHash('sha256').update(value).digest();
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createState() {
  return randomBytes(24).toString('base64url');
}

/** Encrypt the session payload so the GitHub access token is not readable from the cookie. */
export function encodeSession(payload: SessionPayload) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', secret(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const body = [iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.');
  return `${body}.${sign(body)}`;
}

export function decodeSession(value?: string): SessionPayload | null {
  try {
    if (!value) return null;
    const parts = value.split('.');
    if (parts.length !== 4) return null;
    const body = parts.slice(0, 3).join('.');
    const signature = parts[3];
    const expected = sign(body);
    const providedBuffer = Buffer.from(signature, 'base64url');
    const expectedBuffer = Buffer.from(expected, 'base64url');
    if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) return null;

    const iv = Buffer.from(parts[0], 'base64url');
    const tag = Buffer.from(parts[1], 'base64url');
    const ciphertext = Buffer.from(parts[2], 'base64url');
    const decipher = createDecipheriv('aes-256-gcm', secret(), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    const payload = JSON.parse(plaintext) as SessionPayload;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return cookieName;
}

export async function getSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(cookieName)?.value);
}
