const blockedSegments = new Set(['', '.', '..']);
const secretFilePatterns = [/(^|\/)\.env(\.|$|\/)/, /(^|\/)id_rsa$/, /(^|\/)\.ssh(\/|$)/];

export function normalizeRepoPath(input: string): string | null {
  const path = input.replaceAll('\\', '/').trim();
  if (path.startsWith('/') || path.includes('\0')) return null;
  const parts = path.split('/');
  if (parts.some((part) => blockedSegments.has(part))) return null;
  const normalized = parts.join('/');
  if (secretFilePatterns.some((pattern) => pattern.test(normalized))) return null;
  return normalized;
}

export function assertSafeRepoPath(input: string): string {
  const normalized = normalizeRepoPath(input);
  if (!normalized) throw new Error(`Unsafe repository path rejected: ${input}`);
  return normalized;
}
