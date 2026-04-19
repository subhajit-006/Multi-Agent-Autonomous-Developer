import { CalculatorState, CalculatorAction } from '@/types/calculator';
import axios from 'axios';

export const calculatorReducer = (
  state: CalculatorState,
  action: CalculatorAction
): CalculatorState => {
  switch (action.type) {
    case 'CLEAR':
      return {
        ...state,
        currentValue: '0',
        previousValue: null,
        operator: null,
        hasError: false,
        errorMessage: null,
      };

    case 'DIGIT':
      if (state.hasError) {
        return state;
      }

      if (state.currentValue === '0' || state.currentValue === null) {
        return { ...state, currentValue: action.payload };
      }

      return { ...state, currentValue: state.currentValue + action.payload };

    case 'DECIMAL':
      if (state.hasError) {
        return state;
      }

      if (state.currentValue === null) {
        return { ...state, currentValue: '0.' };
      }

      if (state.currentValue.includes('.')) {
        return state;
      }

      return { ...state, currentValue: state.currentValue + '.' };

    case 'OPERATOR':
      if (state.hasError) {
        return state;
      }

      if (state.currentValue === null) {
        return state;
      }

      if (state.previousValue !== null && state.operator !== null) {
        return {
          ...state,
          operator: action.payload,
        };
      }

      return {
        ...state,
        previousValue: state.currentValue,
        currentValue: null,
        operator: action.payload,
      };

    case 'EQUALS':
      if (state.hasError || state.previousValue === null || state.operator === null || state.currentValue === null) {
        return state;
      }

      try {
        const response = await axios.post('/api/v1/calculate', {
          operand1: parseFloat(state.previousValue),
          operand2: parseFloat(state.currentValue),
          operator: state.operator,
        });

        return {
          ...state,
          currentValue: response.data.result.toString(),
          previousValue: null,
          operator: null,
          hasError: false,
          errorMessage: null,
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            ...state,
            hasError: true,
            errorMessage: error.response.data.detail || 'Calculation error',
          };
        }

        return {
          ...state,
          hasError: true,
          errorMessage: 'Calculation error',
        };
      }

    default:
      return state;
  }
};

export const calculate = async (
  operand1: number,
  operand2: number,
  operator: string
): Promise<number> => {
  const response = await axios.post('/api/v1/calculate', {
    operand1,
    operand2,
    operator,
  });

  return response.data.result;
};