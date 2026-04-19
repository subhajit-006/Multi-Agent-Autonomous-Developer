'use client';

import { useRef } from 'react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

const features = [
  {
    id: 1,
    title: 'Semantic HTML5',
    description: 'Built with clean, accessible markup following modern web standards.',
    icon: (
      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Embedded CSS',
    description: 'Responsive styles with Flexbox and Grid, all contained in a single file.',
    icon: (
      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Inline JavaScript',
    description: 'Essential interactivity without external dependencies or build steps.',
    icon: (
      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Mobile-First',
    description: 'Designed for all devices with responsive breakpoints and touch targets.',
    icon: (
      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Cross-Browser',
    description: 'Tested across modern and legacy browsers with appropriate fallbacks.',
    icon: (
      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m-9 9a9 9 0 019-9"></path>
      </svg>
    ),
  },
  {
    id: 6,
    title: 'Optimized',
    description: 'Minimal file size under 50KB with efficient, maintainable code.',
    icon: (
      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
    ),
  },
];

export default function Features() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const { observe } = useIntersectionObserver();

  return (
    <section
      id="features"
      ref={(node) => {
        observe(node);
        if (node) featuresRef.current = node;
      }}
      className="py-20 bg-gray-50"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">Everything you need in a single, portable HTML file</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="card text-center fade-in"
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}