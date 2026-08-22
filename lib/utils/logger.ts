const secretPatterns = [/token/gi, /secret/gi, /password/gi, /api[_-]?key/gi, /authorization/gi];

export function redact(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(/[A-Za-z0-9_\-]{24,}/g, '[REDACTED]');
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
      key,
      secretPatterns.some((pattern) => pattern.test(key)) ? '[REDACTED]' : redact(nested),
    ]),
  );
}

export function logInfo(operation: string, details: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ level: 'info', operation, ...redact(details) }));
}

export function logError(operation: string, details: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ level: 'error', operation, ...redact(details) }));
}
