import React from 'react';

const CTA: React.FC = () => {
  const handleCTAClick = async () => {
    try {
      const response = await fetch('/api/v1/health/log-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interactionType: 'cta_click',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log('CTA interaction logged successfully');
        // In a real implementation, this would redirect to a signup page
        // window.location.href = '/signup';
      } else {
        console.error('Failed to log CTA interaction');
      }
    } catch (error) {
      console.error('Error logging CTA interaction:', error);
    }
  };

  return (
    <section className="section">
      <div className="container text-center">
        <h2 className="mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-light-text max-w-2xl mx-auto mb-8">
          Join thousands of satisfied users who have simplified their web presence with our minimal landing page solution.
        </p>
        <button
          onClick={handleCTAClick}
          className="btn text-lg px-8 py-4"
          aria-label="Sign up now"
        >
          Sign Up Now
        </button>
      </div>
    </section>
  );
};

export default CTA;