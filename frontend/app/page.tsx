'use client';

import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import AgentShowcase from '@/components/AgentShowcase';
import TerminalPreview from '@/components/TerminalPreview';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Scroll to Top Button Component
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-8 z-50 p-3 border border-[var(--accent)] bg-[rgba(10,10,10,0.8)] backdrop-blur-sm text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] active:scale-95 min-h-[44px] min-w-[44px] flex justify-center items-center"
          style={{ borderRadius: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-body text-[var(--text-primary)]">
      <Nav />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <HowItWorks />
        <AgentShowcase />
        <TerminalPreview />
        
        <section className="w-full py-24 md:py-32 bg-[var(--accent)] flex flex-col items-center justify-center border-t border-[var(--border)]">
          <div className="container flex flex-col items-center text-center px-4">
            <h2 className="font-display font-bold text-[clamp(28px,4vw,64px)] text-[var(--ink-on-accent)] leading-[1.1] tracking-tight mb-10 max-w-[800px]">
              Ready to build something?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
              <Link href="/app" className="w-full sm:w-auto">
                <button 
                  aria-label="Start Building"
                  className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 min-h-[44px] bg-[var(--bg-primary)] text-[var(--text-primary)] font-display text-[15px] md:text-[18px] font-bold uppercase tracking-[0.15em] hover:bg-[var(--bg-secondary)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent)]/30 whitespace-nowrap"
                  style={{ borderRadius: 0 }}
                >
                  Start Building &rarr;
                </button>
              </Link>
              <Link href="/app?demo=true" className="w-full sm:w-auto">
                <button 
                  aria-label="Launch Hackathon Demo Pipeline"
                  className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 min-h-[44px] bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] font-display text-[15px] md:text-[18px] font-bold uppercase tracking-[0.15em] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent)]/30 whitespace-nowrap"
                  style={{ borderRadius: 0 }}
                >
                  Launch Demo Mode
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-[var(--bg-primary)] border-t border-[var(--border)] pt-20 pb-10">
        <div className="container px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-16 md:gap-8 mb-20">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent)] rotate-45" />
                <span className="font-display font-bold text-[20px] leading-none tracking-tight">
                  MAAD
                </span>
              </div>
              <p className="font-body text-[14px] text-[var(--text-secondary)] leading-[1.6] max-w-[280px]">
                Multi-Agent Autonomous Developer.<br/>
                From plain-English prompt to production codebase via dynamic AI pipelines.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-[12px] text-[var(--text-primary)] uppercase tracking-[0.1em] mb-2 border-b border-[var(--border)] pb-2 max-w-[120px]">
                System
              </h4>
              <Link href="/docs" className="font-body text-[14px] min-h-[44px] flex items-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors w-fit focus:outline-none focus-visible:text-[var(--accent)]">
                Documentation
              </Link>
              <a href="https://github.com/maad-dev/maad" className="font-body text-[14px] min-h-[44px] flex items-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors w-fit focus:outline-none focus-visible:text-[var(--accent)]" target="_blank" rel="noopener noreferrer">
                GitHub Repository
              </a>
              <Link href="/app" className="font-body text-[14px] min-h-[44px] flex items-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors w-fit focus:outline-none focus-visible:text-[var(--accent)]">
                Launch App
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-[12px] text-[var(--text-primary)] uppercase tracking-[0.1em] mb-2 border-b border-[var(--border)] pb-2 max-w-[120px]">
                Built With
              </h4>
              <div className="flex flex-col gap-2">
                <span className="font-body text-[14px] text-[var(--text-secondary)] cursor-default hover:text-[var(--text-primary)] transition-colors w-fit">Anthropic Claude</span>
                <span className="font-body text-[14px] text-[var(--text-secondary)] cursor-default hover:text-[var(--text-primary)] transition-colors w-fit">n8n Workflow</span>
                <span className="font-body text-[14px] text-[var(--text-secondary)] cursor-default hover:text-[var(--text-primary)] transition-colors w-fit">Next.js 14</span>
                <span className="font-body text-[14px] text-[var(--text-secondary)] cursor-default hover:text-[var(--text-primary)] transition-colors w-fit">FastAPI</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-[var(--border)] gap-4">
            <p className="font-mono text-[12px] text-[var(--text-muted)] tracking-wide">
              &copy; {new Date().getFullYear()} MAAD SYSTEM
            </p>
            <p className="font-mono text-[12px] text-[var(--text-muted)] tracking-wide uppercase">
              Open Source &middot; MIT License
            </p>
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
