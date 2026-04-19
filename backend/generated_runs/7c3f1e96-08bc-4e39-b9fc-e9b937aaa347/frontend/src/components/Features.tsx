'use client'

import { useState } from 'react'

export default function Features() {
  const [activeTab, setActiveTab] = useState(0)

  const features = [
    {
      title: 'Lightweight',
      description: 'Under 5KB uncompressed with no external dependencies or requests.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
    },
    {
      title: 'Responsive',
      description: 'Fluid layouts with relative units and minimal media queries for all devices.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      ),
    },
    {
      title: 'Accessible',
      description: 'Semantic HTML, proper contrast, and keyboard navigation support.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
        </svg>
      ),
    },
    {
      title: 'Fast',
      description: 'Optimized for performance with inlined assets and minimal JavaScript.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
      ),
    },
  ]

  return (
    <section id="features" className="features">
      <div className="container">
        <div className="features-header">
          <h2 className="section-title">Core Features</h2>
          <p className="section-description">
            Everything you need to create a minimal, high-performance landing page.
          </p>
        </div>

        <div className="features-tabs">
          <div className="tabs-nav">
            {features.map((feature, index) => (
              <button
                key={index}
                className={`tab-button ${activeTab === index ? 'tab-button-active' : ''}`}
                onClick={() => setActiveTab(index)}
                aria-selected={activeTab === index}
              >
                {feature.title}
              </button>
            ))}
          </div>

          <div className="tab-content">
            <div className="tab-pane">
              <div className="feature-icon">
                {features[activeTab].icon}
              </div>
              <h3 className="feature-title">{features[activeTab].title}</h3>
              <p className="feature-description">
                {features[activeTab].description}
              </p>
            </div>
          </div>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-card-icon">
                {feature.icon}
              </div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}