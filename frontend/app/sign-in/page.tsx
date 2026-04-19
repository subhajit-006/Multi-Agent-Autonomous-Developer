'use client';

import Link from 'next/link';
import { useState } from 'react';

import Nav from '@/components/Nav';
import { authClient } from '@/lib/auth-client';

export default function SignInPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGithubSignIn = async () => {
    setBusy(true);
    setError(null);
    try {
      const callbackURL =
        typeof window !== 'undefined'
          ? `${window.location.origin}/app`
          : '/app';

      await authClient.signIn.social({
        provider: 'github',
        callbackURL,
      });
    } catch (e: any) {
      setError(e?.message || 'GitHub sign-in failed. Check your auth env variables.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Nav />
      <main className="pt-[96px] pb-16 px-4">
        <section className="container max-w-[760px] neo-3d-panel p-8 md:p-10">
          <h1 className="font-display text-[clamp(28px,5vw,44px)] leading-[1.05] mb-4">Sign In</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            Authenticate with GitHub through Better Auth handlers.
          </p>

          <button
            onClick={handleGithubSignIn}
            disabled={busy}
            className="w-full md:w-auto px-6 py-3 bg-[var(--accent)] text-[var(--ink-on-accent)] font-display uppercase tracking-wider disabled:opacity-60"
          >
            {busy ? 'Connecting...' : 'Continue With GitHub'}
          </button>

          {error ? (
            <p className="mt-4 text-[var(--accent-dim)]">{error}</p>
          ) : null}

          <div className="mt-8 text-[13px] text-[var(--text-muted)]">
            Required env vars: BETTER_AUTH_URL, NEXT_PUBLIC_BETTER_AUTH_URL, BETTER_AUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
          </div>

          <div className="mt-6">
            <Link href="/docs" className="text-[var(--accent)] hover:underline">
              View setup docs
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
