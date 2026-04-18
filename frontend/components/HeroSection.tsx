'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

/**
 * HeroSection for MAAD Landing Page
 * 
 * Features:
 * - Full viewport height (100vh)
 * - Noise texture + blurred amber orbs
 * - Bold typographic hierarchy (88px headline)
 * - Staggered animations using Framer Motion
 * - Sharp design language (no rounded corners)
 */
const HeroSection = () => {
  // Animation Variants
  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  const noiseSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E`;

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[var(--bg-primary)]">
      {/* ── Background Elements ─────────────────────────────────── */}
      
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: `url("${noiseSvg}")` }}
      />

      {/* Blurred Amber Orbs */}
      <div 
        className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] rounded-full z-0 pointer-events-none"
        style={{
          background: 'var(--accent)',
          opacity: 0.11,
          filter: 'blur(120px)',
        }}
      />
      <div 
        className="absolute -bottom-[10%] -left-[5%] w-[600px] h-[600px] rounded-full z-0 pointer-events-none"
        style={{
          background: 'var(--accent)',
          opacity: 0.09,
          filter: 'blur(120px)',
        }}
      />

      {/* ── Hero Content ────────────────────────────────────────── */}
      <div className="container relative z-10 flex flex-col items-center text-center">
        
        {/* Version Tag */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          custom={0}
          className="px-3 py-1 border border-[var(--border-light)] text-[var(--border-light)] font-mono text-[11px] tracking-[0.15em] mb-12"
          style={{ borderRadius: 0 }}
        >
          MULTI-AGENT SYSTEM · v1.0
        </motion.div>

        {/* Headline */}
        <h1 className="flex flex-col items-center mb-8">
          <motion.span
            variants={fadeUp}
            initial="initial"
            animate="animate"
            custom={0.1}
            className="font-display font-bold text-[48px] md:text-[88px] text-[var(--text-primary)] leading-[0.95] tracking-tight"
          >
            Describe It.
          </motion.span>
          <motion.span
            variants={fadeUp}
            initial="initial"
            animate="animate"
            custom={0.2}
            className="font-display font-bold text-[48px] md:text-[88px] text-[var(--accent)] leading-[0.95] tracking-tight"
          >
            Watch It Get Built.
          </motion.span>
        </h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          custom={0.35}
          className="font-body text-[16px] md:text-[18px] text-[var(--text-secondary)] max-width-[520px] leading-[1.6] mb-12 px-4"
          style={{ maxWidth: '520px' }}
        >
          Five specialized AI agents collaborate in real time — planning, architecting, coding, debugging, and testing your idea into existence.
        </motion.p>

        {/* CTA Row */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          custom={0.45}
          className="flex flex-col sm:flex-row items-center gap-8 mb-16"
        >
          <Link href="/app">
            <button
              className="px-8 py-3.5 bg-[var(--accent)] text-[var(--ink-on-accent)] font-display font-medium text-[16px] transition-all hover:scale-[1.02] hover:bg-[var(--accent-dim)]"
              style={{ borderRadius: 0 }}
            >
              Start Building →
            </button>
          </Link>

          <button className="flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-body text-[14px] transition-colors group">
            <span className="w-5 h-5 flex items-center justify-center border border-[var(--text-muted)] group-hover:border-[var(--text-primary)] transition-colors">
              <svg width="6" height="8" viewBox="0 0 6 8" fill="currentColor">
                <path d="M6 4L0 8V0L6 4Z" />
              </svg>
            </span>
            Watch Demo
          </button>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          custom={0.55}
          className="font-mono text-[12px] text-[var(--text-muted)] tracking-[0.1em] uppercase"
        >
          Built with Claude · Orchestrated by n8n · Open Source
        </motion.div>
      </div>

      {/* ── Bottom Stats Line ───────────────────────────────────── */}
      <div className="relative w-full z-10 px-4 md:px-6 container mt-8 md:mt-12 lg:mt-0 lg:absolute lg:bottom-12 lg:left-0">
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-[1px] w-full bg-[var(--border)] mb-4 origin-left"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 text-[12px] md:text-[13px] text-[var(--text-muted)]"
        >
          {['5 Agents', 'Real-time Pipeline', 'Auto-debugged', 'GitHub Push'].map((stat) => (
            <span key={stat} className="font-body uppercase tracking-wider text-center md:text-left">
              {stat}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
