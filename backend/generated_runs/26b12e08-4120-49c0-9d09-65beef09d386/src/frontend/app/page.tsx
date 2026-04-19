'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import CTA from './components/CTA';
import Footer from './components/Footer';
import ResponsiveGrid from './components/ResponsiveGrid';
import useIntersectionObserver from './hooks/useIntersectionObserver';
import useFormValidation from './hooks/useFormValidation';
import axios from 'axios';

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const { validateForm } = useFormValidation();
  const { observe } = useIntersectionObserver();

  const onSubmit = async (data: FormData) => {
    const validation = validateForm(data);
    if (!validation.valid) {
      setSubmitStatus({ success: false, message: validation.message });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/v1/forms/submit', {
        name: data.name,
        email: data.email,
        message: data.message,
      });
      setSubmitStatus({ success: true, message: 'Form submitted successfully!' });
      reset();
    } catch (error) {
      setSubmitStatus({ success: false, message: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ResponsiveGrid>
          <Features />
        </ResponsiveGrid>
        <section className="py-16 px-4" ref={observe}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  {...register('message', { required: 'Message is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              {submitStatus && (
                <p className={`mt-2 text-center text-sm ${submitStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                  {submitStatus.message}
                </p>
              )}
            </form>
          </div>
        </section>
        <CTA />
      </main>
      <Footer />
    </div>
  );
}