'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const stages = ['Prompt', 'Planner', 'Architect', 'Developer', 'Output'];

const Workflow3D = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.workflow-node',
        { opacity: 0, y: 24, rotateX: -14 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
      );

      gsap.to('.workflow-scene', {
        rotateY: 8,
        rotateX: -5,
        duration: 2.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="workflow" ref={sectionRef} className="py-20 md:py-28" aria-label="3D Workflow">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] tracking-[-0.02em] text-[var(--text-primary)]">
            3D Workflow Engine
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--text-secondary)]">
            A transparent execution chain where each stage receives memory from the previous one and produces traceable artifacts.
          </p>
        </div>

        <div className="workflow-scene relative mx-auto max-w-6xl [perspective:1300px]">
          <div className="grid gap-4 md:grid-cols-5 [transform-style:preserve-3d]">
            {stages.map((stage, idx) => (
              <div key={stage} className="workflow-node relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center shadow-[0_18px_48px_rgba(0,0,0,0.24)]">
                <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/20 text-xs font-bold text-[var(--accent)]">
                  {idx + 1}
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">{stage}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {idx === 0 ? 'User requirement ingestion' : idx === stages.length - 1 ? 'Generated product artifacts' : 'Structured transformation stage'}
                </p>
                {idx < stages.length - 1 && (
                  <div className="pointer-events-none absolute -right-2 top-1/2 hidden h-[2px] w-4 -translate-y-1/2 bg-[var(--accent)]/60 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow3D;
