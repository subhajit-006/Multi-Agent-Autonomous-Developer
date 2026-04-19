import React from 'react';

const HeroSection: React.FC = () => {
  const handleCTAClick = () => {
    console.log('CTA button clicked');
    // In a real implementation, this would trigger an API call or navigation
    // For example: window.location.href = '/signup';
  };

  return (
    <section className="section text-center">
      <div className="container">
        <h1 className="mb-6">Welcome to Minimal Landing Page</h1>
        <p className="text-xl text-light-text max-w-3xl mx-auto mb-8">
          A self-contained, lightweight HTML landing page with embedded CSS and JavaScript,
          optimized for fast loading and simplicity with no external dependencies.
        </p>
        <button
          onClick={handleCTAClick}
          className="btn text-lg px-8 py-4"
          aria-label="Get started with our minimal landing page"
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

export default HeroSection;