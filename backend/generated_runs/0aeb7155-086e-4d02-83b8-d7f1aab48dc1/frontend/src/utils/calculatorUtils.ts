import axios from 'axios';

export const calculate = async (expression: string): Promise<number> => {
  try {
    const response = await axios.post('/api/v1/calculate', { expression });
    return response.data.result;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Calculation error');
    }
    throw new Error('Failed to perform calculation');
  }
};

export const formatNumber = (value: string | null): string => {
  if (value === null) return '0';

  // Remove leading zeros unless it's a single zero
  let formatted = value.replace(/^0+(\d)/, '$1');

  // If empty after removing leading zeros, return '0'
  if (formatted === '') return '0';

  // Format with commas for thousands separator
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
};

export const validateNumber = (value: string): boolean => {
  return /^-?\d*\.?\d+$/.test(value);
};

export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};