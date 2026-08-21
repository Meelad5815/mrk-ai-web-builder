const items = ['Dashboard', 'Projects', 'GitHub Repositories', 'AI Chat', 'Changes', 'Commits', 'Settings'];

export function Sidebar() {
  return (
    <aside className="rounded-3xl border bg-white p-4 shadow-sm dark:bg-slate-950 lg:min-h-[calc(100vh-2rem)]">
      <div className="mb-8 rounded-2xl bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
        <p className="text-sm font-black">MRK</p>
        <p className="text-xs opacity-70">AI development workspace</p>
      </div>
      <nav className="grid gap-2" aria-label="Workspace navigation">
        {items.map((item) => (
          <a key={item} href={item === 'Settings' ? '/settings' : '/dashboard'} className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
            {item}
          </a>
        ))}
      </nav>
    </aside>
  );
}
