import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4">
      <div className="neo-3d-panel p-8 max-w-[560px] w-full text-center">
        <h1 className="font-display text-[36px] mb-2">Page Not Found</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          This route is not available yet. Use docs or app workspace to continue.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/" className="px-4 py-2 border border-[var(--border)] hover:border-[var(--accent)]">Home</Link>
          <Link href="/docs" className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)]">Docs</Link>
        </div>
      </div>
    </div>
  );
}
