'use client';

import { useState } from 'react';
import { useIntersectionObserver } from '@/app/hooks/useIntersectionObserver';

export default function Hero() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const { ref: heroRef, isVisible } = useIntersectionObserver({ threshold: 0.1 });

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
        setSubmitStatus({ success: true, message: 'Subscription successful!' });
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
      ref={heroRef}
      className="hero-section relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            id="hero-heading"
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            Build Your Perfect Landing Page
          </h1>
          <p
            className={`text-xl md:text-2xl mb-8 transition-all duration-1000 delay-100 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            A self-contained, portable solution with no external dependencies.
            Deploy anywhere in minutes.
          </p>

          <form
            onSubmit={handleSubmit}
            className={`max-w-md mx-auto mb-8 transition-all duration-1000 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            noValidate
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="email" className="sr-only">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="form-input w-full"
                  required
                  aria-required="true"
                  aria-describedby={submitStatus?.message ? 'email-error' : undefined}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex-shrink-0"
                aria-label="Subscribe to newsletter"
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
                  'Get Started'
                )}
              </button>
            </div>
            {submitStatus && (
              <p
                id="email-error"
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
            className={`flex justify-center items-center gap-4 transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="flex -space-x-2">
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User avatar 1"
                loading="lazy"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                src="https://images.unsplash.com/photo-1550525811-e586910b323f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User avatar 2"
                loading="lazy"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User avatar 3"
                loading="lazy"
              />
            </div>
            <p className="text-text-light">
              Join <span className="font-semibold text-text-color">10,000+</span> happy customers
            </p>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background-color to-transparent pointer-events-none"
        aria-hidden="true"
      ></div>
    </section>
  );
}