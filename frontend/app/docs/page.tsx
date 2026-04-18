import Link from 'next/link';

import Nav from '@/components/Nav';

const docsItems = [
  {
    title: 'Run The Pipeline',
    body: 'Open /app, enter a prompt, pick scope, and run. Generated files appear in Explorer and code view.',
  },
  {
    title: 'GitHub Auth (Better Auth)',
    body: 'API handler is mounted at /api/auth/[...all]. Configure GitHub OAuth env vars and sign in at /sign-in.',
  },
  {
    title: 'Live Preview Panel',
    body: 'Right panel now includes a sandboxed iframe preview for generated frontend snippets where preview is possible.',
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Nav />
      <main className="pt-[96px] pb-16 px-4">
        <section className="container max-w-[980px]">
          <h1 className="font-display text-[clamp(30px,5vw,56px)] mb-4">Documentation</h1>
          <p className="text-[var(--text-secondary)] mb-10">
            Quick reference for MAAD runtime, auth handlers, and live preview features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {docsItems.map((item) => (
              <article key={item.title} className="neo-3d-panel p-5">
                <h2 className="font-display text-[18px] mb-2">{item.title}</h2>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 text-[14px] text-[var(--text-secondary)]">
            Next steps:
            <div>
              <Link href="/sign-in" className="text-[var(--accent)] hover:underline">Open Sign In</Link>
            </div>
            <div>
              <Link href="/app" className="text-[var(--accent)] hover:underline">Open App Workspace</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
