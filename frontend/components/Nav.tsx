'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MAAD Nav Component
 * 
 * Features:
 * - Fixed blurred backdrop
 * - Asymmetric layout
 * - Sharp design (no rounded corners)
 * - Framer Motion animations
 */
const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial = stored === 'light' || stored === 'dark' ? stored : (prefersLight ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', initial);
    setTheme(initial as 'light' | 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const navLinks = [
    { name: 'Docs', href: '/docs' },
    { name: 'Workflow', href: '/#workflow' },
    { name: 'Agents', href: '/#agents' },
    { name: 'Sign In', href: '/sign-in' },
    { name: 'GitHub', href: 'https://github.com/subhajit-006/Multi-Agent-Autonomous-Developer', external: true },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled ? 'py-3' : 'py-5'
      }`}
      style={{
        backgroundColor: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="container flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            className="w-2 h-2 bg-[var(--accent)]"
            initial={{ rotate: 45 }}
            whileHover={{ rotate: 135 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
          <span className="font-display font-bold text-[20px] text-[var(--text-primary)] leading-none tracking-tight">
            MAAD
          </span>
        </Link>

        {/* Center: Empty for asymmetry */}
        <div className="hidden lg:block flex-1" />

        {/* Right: Links & Button (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="font-body text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle light and dark theme"
            className="inline-flex min-h-[38px] items-center border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] hover:text-[var(--accent)]"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          <Link href="/app">
            <button
              className="px-6 py-2 border border-[var(--accent)] text-[var(--accent)] text-[11px] font-display font-bold uppercase tracking-[0.15em] transition-all duration-300 hover:bg-[var(--accent)] hover:text-[var(--ink-on-accent)] active:scale-[0.98]"
              style={{ borderRadius: '0px' }}
            >
              Launch App
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <div className="w-6 h-[1px] bg-[var(--text-primary)]" />
          <div className="w-4 h-[1px] bg-[var(--text-primary)] self-end" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-[var(--bg-secondary)] border-l border-[var(--border)] z-[70] p-8 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--accent)] rotate-45" />
                  <span className="font-display font-bold text-[18px]">MAAD</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:text-[var(--accent)] transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    onClick={() => setIsOpen(false)}
                    className="font-display text-2xl font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full border border-[var(--border)] bg-[var(--surface)] py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]"
                >
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
                </button>
                
                <div className="mt-4 pt-8 border-t border-[var(--border)]">
                  <Link href="/app" onClick={() => setIsOpen(false)}>
                    <button
                      className="w-full py-4 border border-[var(--accent)] text-[var(--accent)] text-xs font-display font-bold uppercase tracking-[0.2em] transition-all hover:bg-[var(--accent)] hover:text-[var(--ink-on-accent)]"
                    >
                      Launch App
                    </button>
                  </Link>
                </div>
              </div>

              <div className="mt-auto">
                <p className="text-[10px] text-[var(--text-muted)] font-body uppercase tracking-wider">
                  Multi-Agent Autonomous Developer
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  © 2026 MAAD SYSTEM
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Nav;
