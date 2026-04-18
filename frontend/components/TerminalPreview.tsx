'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const logLines = [
  { prefix: '› Planner', prefixColor: 'text-[var(--accent)]', text: ' analyzing prompt...' },
  { prefix: '', text: '  ✓ Identified 6 features, 12 tasks', color: 'text-[var(--accent)]' },
  { prefix: '› Architect', prefixColor: 'text-[var(--accent)]', text: ' designing system...' },
  { prefix: '', text: '  ✓ Stack: Next.js + FastAPI + SQLite', color: 'text-[var(--accent)]' },
  { prefix: '› Developer', prefixColor: 'text-[var(--accent)]', text: ' writing code...' },
  { prefix: '', text: '  ✓ Generated app/page.tsx (142 lines)', color: 'text-[var(--accent)]' },
  { prefix: '', text: '  ✓ Generated api/routes.py (89 lines)', color: 'text-[var(--accent)]' },
  { prefix: '› Debugger', prefixColor: 'text-[var(--accent)]', text: ' reviewing...' },
  { prefix: '', text: '  ✓ Fixed: missing null check on line 34', color: 'text-[var(--accent)]' },
  { prefix: '› Tester', prefixColor: 'text-[var(--accent)]', text: ' generating tests...' },
  { prefix: '', text: '  ✓ 8 test cases written', color: 'text-[var(--accent)]' },
  { prefix: '', text: '  ✓ Pipeline complete in 14.2s', color: 'text-[var(--accent)]' },
];

const TerminalPreview = () => {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      if (tickCount <= logLines.length) {
        setVisibleLines(tickCount);
      } else if (tickCount > logLines.length + 8) {
        // Reset after pausing for ~3 seconds (assuming ~400ms interval * 8 ticks delay)
        tickCount = 0;
        setVisibleLines(0);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full py-24 md:py-40 bg-[var(--bg-secondary)] border-t border-[var(--border)] overflow-hidden">
      <div className="container relative z-10 flex flex-col items-center">
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-display font-bold text-[40px] md:text-[48px] text-[var(--text-primary)] leading-[1.1] tracking-tight mb-16 text-center"
        >
          Watch the agents think.
        </motion.h2>

        <div className="w-full flex flex-col xl:flex-row items-center gap-16 xl:gap-24">
          
          {/* Fake Terminal Window */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full xl:w-[65%] border border-[var(--border)] bg-[var(--bg-primary)] shadow-2xl flex flex-col"
            style={{ borderRadius: 0 }}
          >
            {/* Top Bar */}
            <div className="flex items-center px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex gap-2 mr-4">
                <div className="w-2.5 h-2.5 bg-[var(--accent)]" />
                <div className="w-2.5 h-2.5 bg-[var(--accent-dim)]" />
                <div className="w-2.5 h-2.5 bg-[var(--border-light)]" />
              </div>
              <div className="font-mono text-[12px] text-[var(--text-muted)] w-full text-center pr-[48px]">
                maad — agent pipeline
              </div>
            </div>

            {/* Terminal Body */}
            <div className="px-6 py-6 h-[400px] md:h-[460px] overflow-y-auto bg-[var(--bg-primary)] font-mono text-[13px] leading-[1.8]">
              {logLines.slice(0, visibleLines).map((line, idx) => (
                <div key={idx} className="break-all whitespace-pre-wrap">
                  {line.prefix && (
                    <span className={`font-semibold ${line.prefixColor} mr-2`}>
                      {line.prefix}
                    </span>
                  )}
                  <span className={line.color || 'text-[var(--text-primary)]'}>
                    {line.text}
                  </span>
                </div>
              ))}
              <div className="inline-block w-2.5 h-4 bg-[var(--accent)] ml-1 align-middle translate-y-[-2px] animate-[cursorBlink_1s_step-end_infinite]" />
            </div>
          </motion.div>

          {/* Stats Panel */}
          <div className="w-full xl:w-[35%] flex flex-col sm:flex-row xl:flex-col gap-12 md:gap-16 justify-center">
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-2 relative pl-6 xl:pl-8 border-l-[2px] border-[var(--border)]"
            >
              <div className="font-display font-bold text-[56px] leading-[1] text-[var(--accent)]">
                14.2s
              </div>
              <div className="font-display text-[16px] text-[var(--text-secondary)] uppercase tracking-[0.1em]">
                AVG TIME TO CODE
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-2 relative pl-6 xl:pl-8 border-l-[2px] border-[var(--border)]"
            >
              <div className="font-display font-bold text-[56px] leading-[1] text-[var(--accent)]">
                5
              </div>
              <div className="font-display text-[16px] text-[var(--text-secondary)] uppercase tracking-[0.1em]">
                SPECIALIZED AGENTS
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-2 relative pl-6 xl:pl-8 border-l-[2px] border-[var(--border)]"
            >
              <div className="font-display font-bold text-[56px] leading-[1] text-[var(--accent)]">
                100%
              </div>
              <div className="font-display text-[16px] text-[var(--text-secondary)] uppercase tracking-[0.1em]">
                AUTOMATED BUILD
              </div>
            </motion.div>

          </div>
          
        </div>
      </div>
    </section>
  );
};

export default TerminalPreview;
