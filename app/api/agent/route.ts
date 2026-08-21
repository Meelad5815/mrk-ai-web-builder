import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { unsealToken } from '@/lib/session';

type Change={path:string;action:'create'|'modify'|'delete';content?:string};

function parseJson(text:string){
  const cleaned=text.replace(/^```json\s*/,'').replace(/```$/,'').trim();
  return JSON.parse(cleaned) as {summary?:string;changes?:Change[];warnings?:string[];plan?:string[]};
}

export async function POST(request:Request){
 try{
  const {prompt,repository}=await request.json();
  if(typeof prompt!=='string'||!prompt.trim()) return NextResponse.json({error:'Please enter an instruction.'},{status:400});
  if(typeof repository!=='string'||!repository.includes('/')) return NextResponse.json({error:'Select a GitHub repository first.'},{status:400});
  const geminiKey=process.env.GEMINI_API_KEY;
  if(!geminiKey) return NextResponse.json({error:'GEMINI_API_KEY is not configured yet.'},{status:503});
  const session=(await cookies()).get('mrk_github_session')?.value;
  if(!session) return NextResponse.json({error:'Connect GitHub before using the coding agent.'},{status:401});
  const token=await unsealToken(session); const octokit=new Octokit({auth:token});
  const [owner,name]=repository.split('/');
  const meta=await octokit.request('GET /repos/{owner}/{repo}',{owner,repo:name});
  const tree=await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}',{owner,repo:name,tree_sha:meta.data.default_branch,recursive:'1'}).catch(()=>null);
  const files=(tree?.data.tree||[]).filter((x:any)=>x.type==='blob' && /\.(tsx?|jsx?|css|html|json|md|py|vue|php)$/i.test(x.path)).slice(0,18);
  const contexts:string[]=[];
  for(const f of files){try{const r=await octokit.request('GET /repos/{owner}/{repo}/contents/{path}',{owner,repo:name,path:f.path,ref:meta.data.default_branch});const d=r.data as any;if(typeof d.content==='string'){const content=Buffer.from(d.content,'base64').toString('utf8');contexts.push(`FILE: ${f.path}\n${content.slice(0,12000)}`)}}catch{}}
  const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
  const system=`You are MRK AI Web Builder, a senior software engineer. Analyze the user's request against the existing repository context. Return ONLY valid JSON with this shape: {"summary":"string","plan":["string"],"changes":[{"path":"relative/path","action":"create|modify|delete","content":"complete file content for create/modify; omit content for delete"}],"warnings":["string"]}. Never invent secrets. Never use paths beginning with / or containing .. . Prefer minimal safe changes. Do not propose deleting unrelated files. This response is a PROPOSAL only; it will be reviewed before any write.`;
  const body={contents:[{role:'user',parts:[{text:`SYSTEM:\n${system}\n\nREPOSITORY: ${repository}\nDEFAULT BRANCH: ${meta.data.default_branch}\n\nUSER REQUEST:\n${prompt}\n\nEXISTING FILE CONTEXT:\n${contexts.join('\n\n').slice(0,90000)}`}]}],generationConfig:{temperature:0.2,responseMimeType:'application/json'}};
  const ai=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiKey)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  const data=await ai.json() as any;
  if(!ai.ok) return NextResponse.json({error:data?.error?.message||'Gemini request failed.'},{status:502});
  const text=data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||'').join('')||'';
  const parsed=parseJson(text);
  const safe=(parsed.changes||[]).filter(c=>c.path&&!c.path.startsWith('/')&&!c.path.split('/').includes('..')).map(c=>({path:c.path,action:c.action,content:c.content}));
  return NextResponse.json({summary:parsed.summary||'Analysis completed.',plan:parsed.plan||[],warnings:parsed.warnings||[],changes:safe,repository,model});
 }catch(error){console.error('agent error',error instanceof Error?error.message:'unknown');return NextResponse.json({error:'The AI agent could not complete the request. Check the server configuration and try again.'},{status:500})}
}
