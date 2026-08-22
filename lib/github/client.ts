import { PublicError } from '@/lib/utils/errors';
import type { ProjectInspection, RepositorySummary } from '@/types';

const apiBase = 'https://api.github.com';

async function githubFetch<T>(path: string, accessToken: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...init.headers,
    },
  });
  if (!response.ok) throw new PublicError('GitHub request failed. Please reconnect your GitHub account.', response.status);
  return response.json() as Promise<T>;
}

type GitHubRepo = {
  id: number; name: string; full_name: string; private: boolean; default_branch: string;
  updated_at: string; html_url: string; owner: { login: string };
};

export async function listRepositories(accessToken: string): Promise<RepositorySummary[]> {
  const repos = await githubFetch<GitHubRepo[]>('/user/repos?per_page=100&sort=updated', accessToken);
  return repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    private: repo.private,
    defaultBranch: repo.default_branch,
    updatedAt: repo.updated_at,
    htmlUrl: repo.html_url,
  }));
}

type TreeItem = { path: string; type: 'blob' | 'tree' };
type TreeResponse = { tree: TreeItem[] };
type ContentResponse = { content?: string; encoding?: string };

export async function readRepoFile(accessToken: string, owner: string, repo: string, path: string) {
  const file = await githubFetch<ContentResponse>(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, accessToken);
  if (file.encoding !== 'base64' || !file.content) return '';
  return Buffer.from(file.content, 'base64').toString('utf8');
}

export async function inspectRepository(accessToken: string, owner: string, repo: string, branch = 'HEAD'): Promise<ProjectInspection> {
  const tree = await githubFetch<TreeResponse>(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, accessToken);
  const files = tree.tree.filter((item) => item.type === 'blob').map((item) => item.path);
  const importantFiles = files.filter((file) => /(^package\.json$|next\.config\.|vite\.config\.|src\/|app\/|pages\/|requirements\.txt|pyproject\.toml|manage\.py|index\.html$)/.test(file)).slice(0, 80);
  const dependencies: Record<string, string> = {};
  if (files.includes('package.json')) {
    try {
      const pkg = JSON.parse(await readRepoFile(accessToken, owner, repo, 'package.json')) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      Object.assign(dependencies, pkg.dependencies, pkg.devDependencies);
    } catch {}
  }
  const projectType = detectProjectType(files, dependencies);
  return { projectType, importantFiles, dependencies, notes: [`Detected ${projectType} from repository files.`] };
}

export function detectProjectType(files: string[], dependencies: Record<string, string> = {}) {
  if (dependencies.next || files.some((file) => file.startsWith('app/') || file.startsWith('pages/'))) return 'Next.js';
  if (dependencies.react || files.some((file) => file === 'vite.config.ts' || file === 'vite.config.js')) return 'React';
  if (dependencies.vue) return 'Vue';
  if (files.includes('manage.py')) return 'Django';
  if (files.includes('requirements.txt') || files.includes('pyproject.toml')) return 'Python';
  if (files.includes('package.json')) return 'Node.js';
  if (files.includes('index.html')) return 'HTML/CSS/JavaScript';
  return 'Unknown';
}
