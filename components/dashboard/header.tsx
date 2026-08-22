import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-white px-5 py-4 shadow-sm dark:bg-slate-950">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">MRK AI Web Builder</p>
        <h1 className="text-2xl font-black">AI coding workspace</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800">GitHub setup required</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">No repository selected</span>
        <Button href="/settings" variant="ghost">Settings</Button>
        <form action="/api/auth/signout" method="post"><Button variant="secondary">Sign out</Button></form>
      </div>
    </header>
  );
}
