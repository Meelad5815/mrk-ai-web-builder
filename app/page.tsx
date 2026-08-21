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
}
