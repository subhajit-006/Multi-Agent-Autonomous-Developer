import Link from 'next/link';

const PremiumFooter = () => {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-alt)] py-14">
      <div className="container grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl tracking-tight text-[var(--text-primary)]">MAAD</p>
          <p className="mt-3 max-w-sm text-sm text-[var(--text-secondary)]">
            Multi-Agent Autonomous Developer. A modern hybrid-agent platform for prompt-to-product engineering workflows.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Platform</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
            <Link href="/docs" className="hover:text-[var(--accent)]">Documentation</Link>
            <Link href="/app" className="hover:text-[var(--accent)]">Launch Workspace</Link>
            <a href="https://github.com/subhajit-006/Multi-Agent-Autonomous-Developer" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)]">
              GitHub Repository
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Status</p>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Active pipeline: Planner &rarr; Architect &rarr; Developer</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Planned activation: Debugger + Tester</p>
        </div>
      </div>

      <div className="container mt-10 border-t border-[var(--border)] pt-6 text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
        © {new Date().getFullYear()} MAAD. All rights reserved.
      </div>
    </footer>
  );
};

export default PremiumFooter;
