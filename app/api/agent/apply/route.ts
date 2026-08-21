import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { unsealToken } from '@/lib/session';

type Change={path:string;action:'create'|'modify'|'delete';content?:string;sha?:string};

export async function POST(request:Request){
 try{
  const {repository,changes,commitMessage='MRK AI: apply approved changes',createPullRequest=true}=await request.json() as {repository:string;changes:Change[];commitMessage?:string;createPullRequest?:boolean};
  if(!/^[^/]+\/[^/]+$/.test(repository)||!Array.isArray(changes)||!changes.length) return NextResponse.json({error:'A repository and approved changes are required.'},{status:400});
  const session=(await cookies()).get('mrk_github_session')?.value;if(!session)return NextResponse.json({error:'GitHub is not connected.'},{status:401});
  const token=await unsealToken(session);const octokit=new Octokit({auth:token});const [owner,name]=repository.split('/');
  const meta=await octokit.request('GET /repos/{owner}/{repo}',{owner,repo:name});const base=meta.data.default_branch;
  const branch=`mrk-ai/${Date.now()}`;
  const ref=await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}',{owner,repo:name,ref:`heads/${base}`});
  await octokit.request('POST /repos/{owner}/{repo}/git/refs',{owner,repo:name,ref:`refs/heads/${branch}`,sha:(ref.data as any).object.sha});
  for(const c of changes){if(!c.path||c.path.startsWith('/')||c.path.split('/').includes('..'))continue;
   if(c.action==='delete'){if(!c.sha)continue;await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}',{owner,repo:name,path:c.path,message:commitMessage,sha:c.sha,branch});}
   else {if(typeof c.content!=='string')continue;let sha=c.sha; if(!sha){try{const existing=await octokit.request('GET /repos/{owner}/{repo}/contents/{path}',{owner,repo:name,path:c.path,ref:base});sha=(existing.data as any).sha}catch{}} const args:any={owner,repo:name,path:c.path,message:commitMessage,content:Buffer.from(c.content,'utf8').toString('base64'),branch};if(sha)args.sha=sha;await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}',args);}
  }
  let pullRequest:null|{number:number;url:string}=null;
  if(createPullRequest){const pr=await octokit.request('POST /repos/{owner}/{repo}/pulls',{owner,repo:name,title:commitMessage,head:branch,base,body:'Created by MRK AI Web Builder after user approval.'});pullRequest={number:pr.data.number,url:pr.data.html_url};}
  return NextResponse.json({success:true,branch,pullRequest});
 }catch(error){console.error('apply error',error instanceof Error?error.message:'unknown');return NextResponse.json({error:'Approved changes could not be applied. Check GitHub permissions and repository access.'},{status:500});}
}
