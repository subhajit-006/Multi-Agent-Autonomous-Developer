'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Hero() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Simulate API call (in a real app, this would call the proxy endpoint)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitStatus('success')
      setEmail('')
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Build beautiful landing pages with minimal effort
            </h1>
            <p className="hero-description">
              A lightweight, self-contained solution for creating fast, responsive landing pages without external dependencies.
            </p>
            <div className="hero-actions">
              <Link href="#features" className="button button-primary">
                Explore Features
              </Link>
              <Link href="#about" className="button button-secondary">
                Learn More
              </Link>
            </div>
          </div>

          <div className="hero-form">
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Stay updated
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="form-input"
                  required
                  aria-describedby="email-help"
                />
                {submitStatus === 'error' && (
                  <p className="form-error" id="email-help">
                    Please enter a valid email address
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="button button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Subscribe'}
              </button>
              {submitStatus === 'success' && (
                <p className="form-success">
                  Thank you for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}