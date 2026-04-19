'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const agentOrbit = ['Planner', 'Architect', 'Developer', 'Debugger', 'Tester'];

const PremiumHero = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-copy > *',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.orbit-card',
        { y: 40, opacity: 0, rotateX: -12 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out', delay: 0.2 }
      );

      cardsRef.current.forEach((card, idx) => {
        if (!card) return;
        gsap.to(card, {
          y: idx % 2 === 0 ? -12 : 12,
          rotateY: idx % 2 === 0 ? 8 : -8,
          duration: 2.4 + idx * 0.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, root);

    const handleMove = (event: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      gsap.to('.hero-parallax', {
        x: x * 18,
        y: y * 14,
        rotateY: x * 8,
        rotateX: -y * 8,
        duration: 0.7,
        ease: 'power2.out',
      });
    };

    root.addEventListener('mousemove', handleMove);

    return () => {
      root.removeEventListener('mousemove', handleMove);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28"
      aria-label="MAAD Hero"
    >
      <div className="container grid gap-14 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <div className="hero-copy relative z-10">
          <p className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Hybrid Multi-Agent Engineering
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.2rem,6vw,4.8rem)] leading-[1.03] tracking-[-0.03em] text-[var(--text-primary)]">
            Premium AI Product Build Pipeline.
            <span className="block text-[var(--accent)]">Transparent. Fast. Reliable.</span>
          </h1>
          <p className="mt-6 max-w-[620px] text-[1.05rem] leading-relaxed text-[var(--text-secondary)]">
            MAAD transforms plain-English requirements into structured software deliverables through specialized hybrid agents and real-time execution visibility.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/app"
              className="inline-flex min-h-[46px] items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-ink)] transition hover:translate-y-[-1px]"
            >
              Start Our Project
            </Link>
            <Link
              href="/docs"
              className="inline-flex min-h-[46px] items-center justify-center border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Explore Docs
            </Link>
          </div>
        </div>

        <div className="hero-parallax relative [perspective:1200px]">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-[var(--accent)]/20 blur-3xl" />
          <div className="absolute -bottom-8 -right-6 h-56 w-56 rounded-full bg-[var(--accent-soft)] blur-3xl" />

          <div className="relative rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/85 p-6 backdrop-blur-sm shadow-[0_20px_70px_rgba(0,0,0,0.28)] [transform-style:preserve-3d]">
            <div className="mb-4 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Live Agent Stack</div>
            <div className="space-y-3">
              {agentOrbit.map((label, idx) => (
                <div
                  key={label}
                  ref={(el) => {
                    cardsRef.current[idx] = el;
                  }}
                  className="orbit-card rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 [transform-style:preserve-3d]"
                  style={{ transform: `translateZ(${24 + idx * 6}px)` }}
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Module {idx + 1} executing in orchestration memory.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumHero;
