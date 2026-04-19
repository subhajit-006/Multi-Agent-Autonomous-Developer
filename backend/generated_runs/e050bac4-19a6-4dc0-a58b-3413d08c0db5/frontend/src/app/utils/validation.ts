export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateFormData = (data: { email: string }): { isValid: boolean; error?: string } => {
  if (!data.email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!validateEmail(data.email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

export const validateRequiredFields = (fields: Record<string, string>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  for (const [fieldName, value] of Object.entries(fields)) {
    if (!value || value.trim() === '') {
      errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};