import type { ReactNode } from 'react';

export function Card({ title, eyebrow, children, className = '' }: { title: string; eyebrow?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border bg-white/85 p-5 shadow-sm backdrop-blur dark:bg-slate-950/70 ${className}`}>
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand">{eyebrow}</p> : null}
      <h2 className="mb-4 text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}
