const agentDetails = [
  {
    name: 'Planner Agent',
    role: 'Requirement decomposition and phase plan generation',
    output: 'Priority roadmap, milestones, and implementation scope.',
  },
  {
    name: 'Architect Agent',
    role: 'System design and file-level architecture blueprint',
    output: 'Modules, APIs, dependencies, and project structure.',
  },
  {
    name: 'Developer Agent',
    role: 'Code synthesis from architecture with consistency controls',
    output: 'Executable source files and integrated implementation.',
  },
  {
    name: 'Debugger Agent (Planned Active)',
    role: 'Automated issue detection and corrective patching',
    output: 'Fix report with corrected code artifacts.',
  },
  {
    name: 'Tester Agent (Planned Active)',
    role: 'Coverage-driven test generation and validation mapping',
    output: 'Unit and integration test assets with quality notes.',
  },
];

const AgentBreakdown = () => {
  return (
    <section id="agents" className="py-20 md:py-28" aria-label="Agent Breakdown">
      <div className="container">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">How Each Agent Works</p>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,3rem)] leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)]">
            Part-by-part execution roles across the MAAD pipeline
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agentDetails.map((agent, idx) => (
            <article
              key={agent.name}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.15)]"
            >
              <div className="mb-4 inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                Stage {idx + 1}
              </div>
              <h3 className="font-display text-xl text-[var(--text-primary)]">{agent.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{agent.role}</p>
              <p className="mt-4 text-sm text-[var(--text-muted)]">{agent.output}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgentBreakdown;
