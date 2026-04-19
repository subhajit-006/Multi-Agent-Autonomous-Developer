'use client';

const techStack = [
  'Next.js 14',
  'FastAPI',
  'TypeScript',
  'LangChain',
  'Mistral',
  'Groq',
  'Google GenAI',
  'SQLite',
  'Server-Sent Events',
  'Tailwind',
  'GSAP',
];

const repeated = [...techStack, ...techStack, ...techStack];

const TechStackCurve = () => {
  return (
    <section className="relative py-6 md:py-10" aria-label="Technology Stack Loop">
      <div className="container">
        <div className="rounded-[120px] border border-[var(--border)] bg-[var(--surface)] px-2 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="overflow-hidden rounded-[100px] border border-[var(--border)] bg-[var(--bg-secondary)]/85 py-4">
            <div className="tech-loop-track flex w-max items-center gap-3 px-2">
              {repeated.map((item, idx) => (
                <span
                  key={`${item}-${idx}`}
                  className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackCurve;
