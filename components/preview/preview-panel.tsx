import { Button } from '@/components/ui/button';

export function PreviewPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 p-5 text-white shadow-glow">
        <div className="mb-16 flex gap-2"><span className="h-3 w-3 rounded-full bg-white/50" /><span className="h-3 w-3 rounded-full bg-white/50" /><span className="h-3 w-3 rounded-full bg-white/50" /></div>
        <h3 className="text-2xl font-black">Live preview</h3>
        <p className="mt-2 text-sm text-white/70">Preview URL appears after the selected project is connected to a deployment provider.</p>
      </div>
      <dl className="grid gap-3 text-sm"><div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-900"><dt className="font-bold">Deployment status</dt><dd className="text-slate-600 dark:text-slate-300">Not deployed</dd></div><div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-900"><dt className="font-bold">Preview URL</dt><dd className="text-slate-600 dark:text-slate-300">Waiting for deployment</dd></div></dl>
      <div className="flex gap-2"><Button variant="secondary">Open Preview</Button><Button variant="ghost">Refresh Preview</Button></div>
    </div>
  );
}
