import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl items-center gap-10 rounded-[2rem] border bg-white p-6 shadow-glow dark:bg-slate-950 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
        <div>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-brand">MRK AI Web Builder</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">Build and modify websites by chatting with an AI developer.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Connect GitHub, choose a repository, write a natural-language request, review Gemini-generated code changes, approve the diff, and prepare the project for deployment.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button href="/login">Connect GitHub</Button><Button href="/dashboard" variant="ghost">Open dashboard</Button></div>
        </div>
        <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-glow">
          <div className="mb-8 flex gap-2"><span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-amber-300" /><span className="h-3 w-3 rounded-full bg-emerald-400" /></div>
          <div className="space-y-4">
            {['Inspecting repository structure...', 'Gemini is generating structured JSON...', 'Diff ready for your approval.', 'GitHub commit prepared.'].map((item) => <div key={item} className="rounded-2xl bg-white/10 p-4 text-sm font-semibold text-white/80">{item}</div>)}
          </div>
        </div>
      </section>
    </main>
  );
'use client';

import { useEffect, useState } from 'react';
type Repo={full_name:string,name:string,private:boolean,html_url:string,default_branch:string};
type Change={path:string;action:string;content?:string};
export default function Home(){
 const [repos,setRepos]=useState<Repo[]>([]);const [connected,setConnected]=useState(false);const [selected,setSelected]=useState('');const [prompt,setPrompt]=useState('Create a professional responsive landing page.');const [result,setResult]=useState('');const [changes,setChanges]=useState<Change[]>([]);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [applyStatus,setApplyStatus]=useState('');
 async function load(){const r=await fetch('/api/github/repos');if(r.ok){setRepos(await r.json());setConnected(true)}} useEffect(()=>{load()},[]);
 function connect(){window.location.href='/api/auth/github'}
 async function ask(){setBusy(true);setError('');setApplyStatus('');setResult('AI is analyzing your request and inspecting the selected repository…');setChanges([]);try{const r=await fetch('/api/agent',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({prompt,repository:selected})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Request failed');setResult(`${d.summary||'Analysis completed.'}${d.plan?.length?'\n\nPLAN\n'+d.plan.map((x:string)=>'• '+x).join('\n'):''}${d.warnings?.length?'\n\nWARNINGS\n'+d.warnings.map((x:string)=>'• '+x).join('\n'):''}`);setChanges(d.changes||[])}catch(e){setError(e instanceof Error?e.message:'Unknown error');setResult('')}finally{setBusy(false)}}
 async function apply(){if(!changes.length)return;setBusy(true);setError('');setApplyStatus('Applying approved changes on a new GitHub branch…');try{const r=await fetch('/api/agent/apply',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({repository:selected,changes,commitMessage:'MRK AI: apply approved changes',createPullRequest:true})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Apply failed');setApplyStatus(`Done. Branch: ${d.branch}${d.pullRequest?` · Pull request: ${d.pullRequest.url}`:''}`)}catch(e){setError(e instanceof Error?e.message:'Unknown error');setApplyStatus('')}finally{setBusy(false)}}
 return <main className="shell"><header className="top"><div><div className="brand">MRK AI Web Builder</div><div className="muted small">Natural-language development workspace</div></div><button className="btn primary" onClick={connect}>{connected?'GitHub Connected':'Connect GitHub'}</button></header>
 <section className="card"><div className="muted">MRK AI</div><h1 className="title">Build websites by telling the AI what you want.</h1><p className="muted">Connect GitHub, choose a repository, describe the change, review the proposed code, then approve it before creating a branch and pull request.</p></section>
 <section className="grid" style={{marginTop:18}}><article className="card"><div className="row"><h2>1. Project</h2><span className="status">{connected?'Connected':'Not connected'}</span></div><p className="muted small">Select a repository from your authorized GitHub account.</p><div className="list">{repos.length?repos.map(r=><div className="repo" key={r.full_name}><div><strong>{r.full_name}</strong><div className="muted small">{r.private?'Private':'Public'} · {r.default_branch}</div></div><button className="btn soft" onClick={()=>setSelected(r.full_name)}>{selected===r.full_name?'Selected':'Select'}</button></div>):<div className="status">{connected?'No repositories returned.':'Connect GitHub to load repositories.'}</div>}</div></article>
 <article className="card"><h2>2. AI Instruction</h2><p className="muted small">Tell MRK what to create, fix, or improve.</p><textarea className="textarea" value={prompt} onChange={e=>setPrompt(e.target.value)}/><div className="row" style={{marginTop:12}}><span className="muted small">Repository: {selected||'not selected'}</span><button className="btn primary" disabled={busy||!selected} onClick={ask}>{busy?'Working…':'Ask MRK AI'}</button></div></article>
 <article className="card wide"><div className="row"><h2>3. AI Result</h2><span className="status">{busy?'In progress':'Ready'}</span></div>{error&&<div className="status" style={{color:'#8c2020',marginBottom:10}}>{error}</div>}<div className="output">{result||'Your AI analysis and implementation plan will appear here.'}</div></article>
 <article className="card wide"><div className="row"><h2>4. Proposed Changes</h2>{changes.length>0&&<button className="btn primary" disabled={busy} onClick={apply}>Approve & Create PR</button>}</div><p className="muted small">Review these AI-generated changes before approving them.</p><div className="changes">{changes.length?changes.map((c,i)=><div className="change" key={i}><strong>{c.action.toUpperCase()}</strong> — {c.path}{c.content&&<pre className="output" style={{marginTop:10,maxHeight:260}}>{c.content}</pre>}</div>):<div className="status">No changes proposed yet.</div>}</div>{applyStatus&&<div className="status" style={{marginTop:12}}>{applyStatus}</div>}</article></section></main>
}
