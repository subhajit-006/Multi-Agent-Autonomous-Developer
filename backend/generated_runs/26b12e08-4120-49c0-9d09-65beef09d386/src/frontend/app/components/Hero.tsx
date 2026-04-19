'use client';

import { useRef } from 'react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { observe } = useIntersectionObserver();

  return (
    <section
      ref={(node) => {
        observe(node);
        if (node) heroRef.current = node;
      }}
      className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 md:py-32"
    >
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 fade-in">
            Build Stunning Landing Pages
          </h1>
          <p className="text-xl md:text-2xl mb-8 fade-in" style={{ transitionDelay: '0.1s' }}>
            Create beautiful, self-contained HTML pages with embedded CSS and JavaScript.
            No dependencies, just pure performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in" style={{ transitionDelay: '0.2s' }}>
            <a
              href="#cta"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="btn btn-secondary text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-indigo-600"
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="mt-16 fade-in" style={{ transitionDelay: '0.3s' }}>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-indigo-400 rounded-lg transform rotate-3"></div>
            <div className="relative bg-white rounded-lg p-4 shadow-2xl">
              <div className="bg-gray-100 rounded aspect-video flex items-center justify-center">
                <span className="text-gray-500 font-medium">Preview of Your Landing Page</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-0 right-0">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <a
              href="#features"
              className="animate-bounce text-white hover:text-indigo-200"
              aria-label="Scroll to features"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}