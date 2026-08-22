import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { unsealToken } from '@/lib/session';

type Change = {
  path: string;
  action: 'create' | 'modify' | 'delete';
  content?: string;
  sha?: string;
};

function validPath(path: string) {
  return Boolean(path) && !path.startsWith('/') && !path.split('/').includes('..');
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      repository?: string;
      changes?: Change[];
      commitMessage?: string;
      createPullRequest?: boolean;
    };
    const repository = body.repository ?? '';
    const changes = body.changes ?? [];
    const commitMessage = body.commitMessage || 'MRK AI: apply approved changes';
    const createPullRequest = body.createPullRequest !== false;

    if (!/^[^/]+\/[^/]+$/.test(repository) || !Array.isArray(changes) || changes.length === 0) {
      return NextResponse.json({ error: 'A repository and approved changes are required.' }, { status: 400 });
    }

    const session = (await cookies()).get('mrk_github_session')?.value;
    if (!session) return NextResponse.json({ error: 'GitHub is not connected.' }, { status: 401 });

    const token = await unsealToken(session);
    const octokit = new Octokit({ auth: token });
    const [owner, name] = repository.split('/');
    const meta = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo: name });
    const base = meta.data.default_branch;
    const ref = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
      owner, repo: name, ref: `heads/${base}`
    });
    const baseSha = (ref.data as { object: { sha: string } }).object.sha;
    const branch = `mrk-ai/${Date.now()}`;

    await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
      owner, repo: name, ref: `refs/heads/${branch}`, sha: baseSha
    });

    for (const change of changes) {
      if (!validPath(change.path)) continue;

      if (change.action === 'delete') {
        if (!change.sha) continue;
        await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
          owner, repo: name, path: change.path, message: commitMessage, sha: change.sha, branch
        });
        continue;
      }

      if (typeof change.content !== 'string') continue;
      let sha = change.sha;
      if (!sha) {
        try {
          const existing = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner, repo: name, path: change.path, ref: base
          });
          if (!Array.isArray(existing.data)) sha = (existing.data as { sha: string }).sha;
        } catch {
          // File does not exist; create it below.
        }
      }

      const args: {
        owner: string; repo: string; path: string; message: string;
        content: string; branch: string; sha?: string;
      } = {
        owner, repo: name, path: change.path, message: commitMessage,
        content: Buffer.from(change.content, 'utf8').toString('base64'), branch
      };
      if (sha) args.sha = sha;
      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', args);
    }

    let pullRequest: { number: number; url: string } | null = null;
    if (createPullRequest) {
      const pr = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
        owner, repo: name, title: commitMessage, head: branch, base,
        body: 'Created by MRK AI Web Builder after user approval.'
      });
      pullRequest = { number: pr.data.number, url: pr.data.html_url };
    }

    return NextResponse.json({ success: true, branch, pullRequest });
  } catch (error) {
    console.error('apply error', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Approved changes could not be applied. Check GitHub permissions and repository access.' }, { status: 500 });
  }
}
