import { EncryptJWT, jwtDecrypt } from 'jose';

const secret = () => {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters.');
  return new TextEncoder().encode(value);
};

export async function sealToken(token: string) {
  return new EncryptJWT({ token }).setProtectedHeader({ alg: 'dir', enc: 'A256GCM' }).setIssuedAt().setExpirationTime('7d').encrypt(secret());
}

export async function unsealToken(value: string) {
  const { payload } = await jwtDecrypt(value, secret());
  if (typeof payload.token !== 'string') throw new Error('Invalid session.');
  return payload.token;
}
