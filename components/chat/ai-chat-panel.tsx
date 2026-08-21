'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const prompts = ['Add a dark mode.', 'Fix the login error.', 'Create an Amazon affiliate product page.', 'Make the website mobile responsive.'];

export function AiChatPanel() {
  const [message, setMessage] = useState(prompts[0]);
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        Describe what you want in normal language. MRK will inspect the repository, ask Gemini for structured changes, and show a diff before anything is applied.
      </div>
      <div className="flex flex-wrap gap-2">{prompts.map((prompt) => <button key={prompt} onClick={() => setMessage(prompt)} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{prompt}</button>)}</div>
      <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-56 flex-1 rounded-2xl border bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-brand dark:bg-slate-950" />
      <div className="flex items-center justify-between gap-3"><p className="text-xs text-slate-500">Status: Waiting for repository and Gemini configuration.</p><Button>Generate proposed changes</Button></div>
    </div>
  );
}
