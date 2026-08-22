import { Button } from '@/components/ui/button';

const files = [
  { path: 'app/page.tsx', action: 'MODIFY', diff: '+ Adds a professional landing section' },
  { path: 'components/ProductCard.tsx', action: 'CREATE', diff: '+ Creates reusable product cards' },
  { path: 'app/globals.css', action: 'MODIFY', diff: '+ Improves responsive spacing' },
];

export function ChangesPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-600 dark:text-slate-300">Generated changes appear here as readable diffs before the user approves them.</div>
      <ul className="space-y-3">{files.map((file) => <li key={file.path} className="rounded-2xl bg-slate-100 p-3 text-sm dark:bg-slate-900"><div className="mb-2 flex items-center justify-between gap-2"><strong>{file.path}</strong><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700">{file.action}</span></div><code className="text-xs text-slate-600 dark:text-slate-300">{file.diff}</code></li>)}</ul>
      <div className="flex gap-2"><Button>Apply Changes</Button><Button variant="ghost">Reject Changes</Button></div>
    </div>
  );
}
