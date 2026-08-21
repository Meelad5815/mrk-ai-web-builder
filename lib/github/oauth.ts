import { PublicError } from '@/lib/utils/errors';

export function getGitHubAuthUrl(state: string) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;
  if (!clientId || !callbackUrl) throw new PublicError('GitHub OAuth is not configured yet.', 503);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: process.env.GITHUB_OAUTH_SCOPES || 'repo read:user user:email',
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new PublicError('GitHub OAuth is not configured yet.', 503);
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  const payload = (await response.json()) as { access_token?: string; error?: string };
  if (!response.ok || !payload.access_token) throw new PublicError('GitHub connection failed. Please reconnect your GitHub account.', 401);
  return payload.access_token;
}

export async function fetchGitHubUser(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new PublicError('GitHub profile could not be loaded.', 401);
  return response.json() as Promise<{ login: string; avatar_url?: string }>;
}
