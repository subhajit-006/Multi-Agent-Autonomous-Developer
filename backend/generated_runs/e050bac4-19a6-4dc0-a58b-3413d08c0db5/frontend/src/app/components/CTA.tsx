'use client';

import { useState } from 'react';
import { useIntersectionObserver } from '@/app/hooks/useIntersectionObserver';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const { ref: ctaRef, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/v1/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ success: true, message: 'Subscription successful! Get ready for updates.' });
        setEmail('');
      } else {
        setSubmitStatus({ success: false, message: data.detail || 'Subscription failed' });
      }
    } catch (error) {
      setSubmitStatus({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={ctaRef}
      className="cta-section"
      aria-labelledby="cta-heading"
    >
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <h2
            id="cta-heading"
            className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            Ready to Get Started?
          </h2>
          <p
            className={`text-xl mb-8 transition-all duration-1000 delay-100 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            Join thousands of satisfied users who have built their perfect landing page with our self-contained solution.
          </p>

          <form
            onSubmit={handleSubmit}
            className={`max-w-md mx-auto mb-6 transition-all duration-1000 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            noValidate
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="cta-email" className="sr-only">
                  Email Address
                </label>
                <input
                  type="email"
                  id="cta-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="form-input w-full"
                  required
                  aria-required="true"
                  aria-describedby={submitStatus?.message ? 'cta-email-error' : undefined}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex-shrink-0"
                aria-label="Subscribe to get started"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Join Now'
                )}
              </button>
            </div>
            {submitStatus && (
              <p
                id="cta-email-error"
                className={`mt-2 text-sm font-medium ${
                  submitStatus.success ? 'text-success-color' : 'text-error-color'
                }`}
                aria-live="polite"
              >
                {submitStatus.message}
              </p>
            )}
          </form>

          <div
            className={`flex justify-center items-center gap-6 transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-color" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-color" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>30-day free trial</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}