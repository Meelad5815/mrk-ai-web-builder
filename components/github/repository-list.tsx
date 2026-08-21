const sampleRepos = [
  { name: 'portfolio-site', owner: 'you', visibility: 'Private', branch: 'main', updated: 'After GitHub login' },
  { name: 'affiliate-store', owner: 'you', visibility: 'Public', branch: 'main', updated: 'After GitHub login' },
];

export function RepositoryList() {
  return <div className="grid gap-3">{sampleRepos.map((repo) => <article key={repo.name} className="rounded-2xl border bg-white p-4 text-sm dark:bg-slate-950"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{repo.owner}/{repo.name}</h3><p className="text-slate-500">Default branch: {repo.branch}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-900">{repo.visibility}</span></div><p className="mt-3 text-slate-500">Updated: {repo.updated}</p></article>)}</div>;
}
