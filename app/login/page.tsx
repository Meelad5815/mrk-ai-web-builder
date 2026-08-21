import { Button } from '@/components/ui/button';

type LoginSearchParams = Promise<{ error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: LoginSearchParams }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-[2rem] border bg-white p-8 shadow-glow dark:bg-slate-950">
        <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-brand">Secure GitHub connection</p>
        <h1 className="text-4xl font-black">Sign in without sharing your password.</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">MRK uses GitHub OAuth on the server. Your GitHub password is never requested, and secrets never appear in browser JavaScript.</p>
        {params.error ? <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{params.error}</div> : null}
        <div className="mt-8"><Button href="/api/auth/github">Continue with GitHub</Button></div>
      </section>
    </main>
  );
}
