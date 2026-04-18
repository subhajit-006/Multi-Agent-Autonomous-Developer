'use client';

import React from 'react';
import { motion } from 'framer-motion';

const agents = [
  {
    id: 'planner',
    name: 'Planner',
    role: 'SYSTEM ARCHITECT',
    desc: 'Analyzes your prompt, breaks it down into logical features, and generates a structured implementation plan.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L20.6603 7V17L12 22L3.33975 17V7L12 2Z" />
      </svg>
    ),
  },
  {
    id: 'architect',
    name: 'Architect',
    role: 'INFRASTRUCTURE',
    desc: 'Determines the optimal tech stack, outlines the exact file structure, and creates the foundational boilerplate.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L22 20H2L12 2Z" />
      </svg>
    ),
  },
  {
    id: 'developer',
    name: 'Developer',
    role: 'CODE GEN',
    desc: 'Writes complete, production-ready code for components, APIs, and business logic based on the architecture.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" />
      </svg>
    ),
  },
  {
    id: 'debugger',
    name: 'Debugger',
    role: 'QUALITY CONTROL',
    desc: 'Automatically scans generated code for syntax errors, logical flaws, and edge cases, applying immediate fixes.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    id: 'tester',
    name: 'Tester',
    role: 'VALIDATION',
    desc: 'Generates and runs test cases to ensure the final software behaves exactly as requested in the initial prompt.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L22 12L12 22L2 12L12 2Z" />
      </svg>
    ),
  },
];

const AgentShowcase = () => {
  return (
    <section className="relative w-full py-24 md:py-40 bg-[var(--bg-primary)] border-t border-[var(--border)]">
      <div className="container">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative">
          
          {/* Left Column (Sticky on Desktop) */}
          <div className="w-full lg:w-5/12 flex-shrink-0">
            <div className="sticky top-32">
              <motion.h2 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="font-display font-bold text-[40px] md:text-[56px] text-[var(--text-primary)] leading-[1.1] tracking-tight mb-6"
              >
                Meet the agents.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-body text-[16px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[400px]"
              >
                Each agent has a single responsibility. Together they build complete software. No black boxes, just specialized intelligence executing in plain sight.
              </motion.p>
            </div>
          </div>

          {/* Right Column (Scrollable Cards) */}
          <div className="w-full lg:w-7/12 flex flex-col gap-6">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] hover:translate-x-1 transition-all duration-300 ease-out"
                style={{ borderRadius: 0 }} // No pills/rounded grids
              >
                {/* Icon Container */}
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--accent)] group-hover:bg-[#E8821A]/10 group-hover:border-[var(--accent)] transition-colors duration-300">
                  {agent.icon}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                    <h3 className="font-display font-medium text-[18px] text-[var(--text-primary)]">
                      {agent.name}
                    </h3>
                    <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.1em] uppercase">
                      {agent.role}
                    </span>
                  </div>
                  <p className="font-body text-[14px] text-[var(--text-secondary)] leading-[1.6]">
                    {agent.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
        
      </div>
    </section>
  );
};

export default AgentShowcase;
