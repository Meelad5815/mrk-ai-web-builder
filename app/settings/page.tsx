import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-8">
      <div><p className="text-sm font-black uppercase tracking-[0.25em] text-brand">Settings</p><h1 className="text-4xl font-black">Configure MRK AI Web Builder</h1></div>
      <section className="grid gap-4 md:grid-cols-3">
        <Card title="AI Settings"><ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300"><li>Model: Gemini server-side service</li><li>Behavior: structured JSON only</li><li>Coding preference: smallest safe change</li></ul></Card>
        <Card title="GitHub"><ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300"><li>Connected account appears after OAuth login.</li><li>Repository permissions use configured OAuth scopes.</li><li>Disconnect by signing out.</li></ul></Card>
        <Card title="Security"><ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300"><li>Secrets are never displayed.</li><li>Sessions use HTTP-only cookies.</li><li>Path traversal is rejected before applying changes.</li></ul></Card>
      </section>
    </main>
  );
}
