import { AiChatPanel } from '@/components/chat/ai-chat-panel';
import { Header } from '@/components/dashboard/header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ChangesPanel } from '@/components/editor/changes-panel';
import { RepositoryList } from '@/components/github/repository-list';
import { PreviewPanel } from '@/components/preview/preview-panel';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <main className="grid min-h-screen gap-4 p-4 lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="space-y-4 overflow-hidden">
        <Header />
        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <Card title="AI Chat" eyebrow="Panel 1"><AiChatPanel /></Card>
          <Card title="Changes" eyebrow="Panel 2"><ChangesPanel /></Card>
          <Card title="Preview" eyebrow="Panel 3"><PreviewPanel /></Card>
        </section>
        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card title="GitHub repositories" eyebrow="Repository selection"><RepositoryList /></Card>
          <Card title="Agent workflow" eyebrow="Safe automation"><ol className="grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{['Understand', 'Inspect repository', 'Plan', 'Generate structured changes', 'Validate safety', 'Show diff', 'Wait for approval', 'Apply changes', 'Commit to GitHub', 'Prepare preview'].map((step) => <li key={step} className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-900">{step}</li>)}</ol></Card>
        </section>
      </div>
    </main>
  );
}
