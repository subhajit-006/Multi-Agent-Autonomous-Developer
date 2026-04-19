'use client';

import { useCallback } from 'react';

type FormData = {
  name: string;
  email: string;
  message: string;
};

type ValidationResult = {
  valid: boolean;
  errors: {
    name?: string;
    email?: string;
    message?: string;
  };
};

const useFormValidation = () => {
  const validateForm = useCallback((data: FormData): ValidationResult => {
    const errors: ValidationResult['errors'] = {};

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'Name is required';
    } else if (data.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (data.name.length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }

    // Email validation
    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Email is invalid';
    } else if (data.email.length > 100) {
      errors.email = 'Email must be less than 100 characters';
    }

    // Message validation
    if (!data.message.trim()) {
      errors.message = 'Message is required';
    } else if (data.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    } else if (data.message.length > 1000) {
      errors.message = 'Message must be less than 1000 characters';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }, []);

  return { validateForm };
};

export default useFormValidation;