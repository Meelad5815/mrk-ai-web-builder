import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { unsealToken } from '@/lib/session';

export async function GET() {
  try {
    const value = (await cookies()).get('mrk_github_session')?.value;
    if (!value) return NextResponse.json({ error:'GitHub is not connected.' }, { status:401 });
    const token = await unsealToken(value);
    const octokit = new Octokit({ auth: token });
    const response = await octokit.request('GET /user/repos', { per_page:100, sort:'updated', affiliation:'owner,collaborator,organization_member' });
    const repos = response.data.map((r:any)=>({full_name:r.full_name,name:r.name,private:r.private,html_url:r.html_url,default_branch:r.default_branch}));
    return NextResponse.json(repos);
  } catch (error) {
    console.error('github repos error', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error:'Unable to load GitHub repositories. Please reconnect GitHub.' }, { status:500 });
  }
}
