'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { gsap } from 'gsap';

const cards = [
  {
    title: 'Requirement to Blueprint',
    text: 'Planner and Architect convert business intent into executable technical structure.',
    metric: '2 Stages',
  },
  {
    title: 'Blueprint to Production Code',
    text: 'Developer agent materializes architecture into runnable files with retry-safe state.',
    metric: '24+ Files',
  },
  {
    title: 'Traceable Session Memory',
    text: 'Every stage is persisted for inspection, replay, and compliance-ready visibility.',
    metric: '100% Logged',
  },
];

const AboutSwapSection = () => {
  const [active, setActive] = useState(0);

  const activeCard = useMemo(() => cards[active], [active]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 2600);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    gsap.fromTo('.swap-card', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  }, [active]);

  return (
    <section className="py-20 md:py-28" aria-label="About MAAD">
      <div className="container grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">About The Project</p>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,3rem)] leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)]">
            We built MAAD as a premium orchestration layer for autonomous software delivery.
          </h2>
          <p className="mt-5 max-w-2xl text-[var(--text-secondary)]">
            Instead of one-shot generation, MAAD uses role-specialized agents and shared memory handoffs. This improves quality, transparency, and execution confidence for real engineering pipelines.
          </p>

          <ul className="mt-8 space-y-3 text-[var(--text-secondary)]">
            <li className="flex items-start gap-3"><span className="mt-2 h-2 w-2 bg-[var(--accent)]" />Hybrid provider model routing</li>
            <li className="flex items-start gap-3"><span className="mt-2 h-2 w-2 bg-[var(--accent)]" />Session snapshots and run history</li>
            <li className="flex items-start gap-3"><span className="mt-2 h-2 w-2 bg-[var(--accent)]" />Real-time streaming status updates</li>
          </ul>
        </div>

        <div className="relative min-h-[310px] [perspective:1000px]">
          <div className="swap-card absolute inset-0 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.22)] [transform-style:preserve-3d]">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Auto Insight Card</p>
            <h3 className="mt-4 font-display text-2xl leading-tight text-[var(--text-primary)]">{activeCard.title}</h3>
            <p className="mt-4 text-[var(--text-secondary)]">{activeCard.text}</p>
            <div className="mt-7 inline-flex items-center border border-[var(--accent)]/50 bg-[var(--accent)]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">
              {activeCard.metric}
            </div>
          </div>

          <div className="absolute -bottom-4 left-6 right-6 h-16 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]/60" />
          <div className="absolute -bottom-8 left-10 right-10 h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]/40" />
        </div>
      </div>

      <div className="container mt-12">
        <Link
          href="/app"
          className="inline-flex min-h-[48px] items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-ink)] transition hover:translate-y-[-1px]"
        >
          Start Our Project
        </Link>
      </div>
    </section>
  );
};

export default AboutSwapSection;
