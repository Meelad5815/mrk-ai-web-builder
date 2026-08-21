import assert from 'node:assert/strict';
import test from 'node:test';

function normalizeRepoPath(input) {
  const blockedSegments = new Set(['', '.', '..']);
  const secretFilePatterns = [/(^|\/)\.env(\.|$|\/)/, /(^|\/)id_rsa$/, /(^|\/)\.ssh(\/|$)/];
  const path = input.replaceAll('\\', '/').trim();
  if (path.startsWith('/') || path.includes('\0')) return null;
  const parts = path.split('/');
  if (parts.some((part) => blockedSegments.has(part))) return null;
  const normalized = parts.join('/');
  if (secretFilePatterns.some((pattern) => pattern.test(normalized))) return null;
  return normalized;
}

function detectProjectType(files, dependencies = {}) {
  if (dependencies.next || files.some((file) => file.startsWith('app/') || file.startsWith('pages/'))) return 'Next.js';
  if (dependencies.react || files.some((file) => file === 'vite.config.ts' || file === 'vite.config.js')) return 'React';
  if (dependencies.vue) return 'Vue';
  if (files.includes('manage.py')) return 'Django';
  if (files.includes('requirements.txt') || files.includes('pyproject.toml')) return 'Python';
  if (files.includes('package.json')) return 'Node.js';
  if (files.includes('index.html')) return 'HTML/CSS/JavaScript';
  return 'Unknown';
}

function parseStructuredAgentOutput(raw) {
  const match = raw.trim().startsWith('{') ? raw.trim() : raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  if (!match) throw new Error('Gemini did not return structured JSON.');
  const parsed = JSON.parse(match);
  if (typeof parsed.summary !== 'string' || !Array.isArray(parsed.changes)) throw new Error('Invalid agent plan shape.');
  for (const change of parsed.changes) {
    if (!['create', 'modify', 'delete'].includes(change.action)) throw new Error('Invalid action.');
    if (!normalizeRepoPath(change.path)) throw new Error('Unsafe path rejected.');
  }
  return parsed;
}

test('path traversal protection rejects unsafe paths', () => {
  assert.equal(normalizeRepoPath('../../etc/passwd'), null);
  assert.equal(normalizeRepoPath('/absolute/path'), null);
  assert.equal(normalizeRepoPath('src/../secret.ts'), null);
  assert.equal(normalizeRepoPath('.env.local'), null);
  assert.equal(normalizeRepoPath('app/page.tsx'), 'app/page.tsx');
});

test('project detection recognizes common frameworks', () => {
  assert.equal(detectProjectType(['package.json', 'app/page.tsx'], { next: 'latest' }), 'Next.js');
  assert.equal(detectProjectType(['vite.config.ts'], { react: 'latest' }), 'React');
  assert.equal(detectProjectType(['manage.py']), 'Django');
});

test('structured Gemini output parsing validates shape and paths', () => {
  const plan = parseStructuredAgentOutput('{"summary":"Add page","plan":[],"changes":[{"path":"app/page.tsx","action":"modify","content":"export default function Page(){}"}],"warnings":[],"tests":[]}');
  assert.equal(plan.summary, 'Add page');
  assert.throws(() => parseStructuredAgentOutput('{"summary":"Bad","changes":[{"path":"../../x","action":"modify","content":""}]}'));
});
