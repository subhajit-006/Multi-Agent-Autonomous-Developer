'use client';

import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    name: 'Planner',
    desc: 'Breaks your idea into features and tasks',
  },
  {
    num: '02',
    name: 'Architect',
    desc: 'Designs tech stack and file structure',
  },
  {
    num: '03',
    name: 'Developer',
    desc: 'Writes complete working code',
  },
  {
    num: '04',
    name: 'Debugger',
    desc: 'Finds and fixes bugs automatically',
  },
  {
    num: '05',
    name: 'Tester',
    desc: 'Generates test cases and validates output',
  },
];

const HowItWorks = () => {
  return (
    <section className="relative w-full py-32 bg-[var(--bg-secondary)] overflow-hidden">
      <div className="container relative z-10">
        
        {/* Section Header */}
        <div className="mb-24 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-[0.2em] mb-4"
          >
            THE PIPELINE
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-[40px] md:text-[56px] text-[var(--text-primary)] leading-[1.1] tracking-tight max-w-[800px]"
          >
            From idea to codebase in seconds.
          </motion.h2>
        </div>

        {/* Stepper Pipeline */}
        <div className="relative">
          {/* Horizontal Connecting Dash (Desktop only) */}
          <div className="hidden lg:block absolute top-[40px] left-0 w-full h-[1px] border-t border-dashed border-[var(--accent)] opacity-40 z-0" />
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-6 justify-between relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.15 * index, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-row lg:flex-col items-start gap-6 lg:gap-4 lg:w-1/5 group"
              >
                {/* Mobile Vertical Dash */}
                {index !== steps.length - 1 && (
                  <div className="lg:hidden absolute top-[40px] left-[19px] w-[1px] h-[calc(100%+24px)] border-l border-dashed border-[var(--accent)] opacity-40 z-0" />
                )}

                {/* Step Number Background / Indicator */}
                <div className="relative w-10 h-10 lg:w-auto lg:h-auto flex-shrink-0 flex items-center justify-center bg-[var(--bg-secondary)] lg:bg-transparent z-10">
                  {/* Circle Indicator (Mobile mainly, or stylistic on desktop) */}
                  <div className="w-2 h-2 lg:hidden bg-[var(--accent)] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                  
                  {/* Large Stylized Number */}
                  <div className="hidden lg:block font-display font-bold text-[72px] leading-none text-[var(--bg-secondary)] text-stroke group-hover:text-[var(--accent)] transition-colors duration-500 ease-out" 
                       style={{ WebkitTextStroke: '1px var(--text-muted)' }}>
                    {step.num}
                  </div>
                </div>

                <div className="pt-1 lg:pt-4">
                  {/* Mobile step number label */}
                  <div className="lg:hidden font-mono text-[10px] text-[var(--accent)] mb-1">
                    STEP {step.num}
                  </div>
                  <h3 className="font-display font-semibold text-[18px] text-[var(--text-primary)] mb-2">
                    {step.name}
                  </h3>
                  <p className="font-body text-[13px] text-[var(--text-secondary)] leading-[1.6] max-w-[240px]">
                    {step.desc}
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

export default HowItWorks;
