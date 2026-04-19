'use client';

import { useState, useEffect } from 'react';
import { useIntersectionObserver } from '@/app/hooks/useIntersectionObserver';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { ref: navbarRef, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 1, name: 'Features', href: '#features' },
    { id: 2, name: 'Pricing', href: '#pricing' },
    { id: 3, name: 'Documentation', href: '#docs' },
    { id: 4, name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      ref={navbarRef}
      className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}
      aria-label="Main navigation"
    >
      <div className="container">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <a
              href="#"
              className="text-2xl font-bold text-primary-color"
              aria-label="Home"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 inline-block mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
              </svg>
              LandingPage
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="text-text-color hover:text-primary-color transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center">
            <a
              href="#cta"
              className="btn btn-primary"
              aria-label="Get started"
            >
              Get Started
            </a>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-text-color hover:text-primary-color focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="text-text-color hover:text-primary-color transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#cta"
                className="btn btn-primary w-full text-center"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Get started"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}