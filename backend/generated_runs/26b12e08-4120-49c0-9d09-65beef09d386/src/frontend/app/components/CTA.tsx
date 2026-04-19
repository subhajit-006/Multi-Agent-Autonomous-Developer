'use client';

import { useRef } from 'react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function CTA() {
  const ctaRef = useRef<HTMLDivElement>(null);
  const { observe } = useIntersectionObserver();

  return (
    <section
      id="cta"
      ref={(node) => {
        observe(node);
        if (node) ctaRef.current = node;
      }}
      className="py-20 bg-white"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section-title mb-6">Ready to Build Your Landing Page?</h2>
          <p className="section-subtitle mb-8">
            Get started with our self-contained HTML template today.
            No dependencies, no build steps, just pure HTML, CSS, and JavaScript.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#contact"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Download Template
            </a>
            <a
              href="#features"
              className="btn btn-secondary text-lg px-8 py-3"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}