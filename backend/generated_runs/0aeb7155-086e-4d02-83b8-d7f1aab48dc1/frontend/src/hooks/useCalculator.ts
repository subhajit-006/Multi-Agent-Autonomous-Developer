'use client';

import { useReducer } from 'react';
import { calculatorReducer } from '@/components/Calculator/CalculatorEngine';
import { CalculatorState, CalculatorAction } from '@/types/calculator';

const initialState: CalculatorState = {
  currentValue: '0',
  previousValue: null,
  operator: null,
  hasError: false,
  errorMessage: null,
};

export const useCalculator = () => {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  const handleButtonClick = (value: string) => {
    switch (value) {
      case 'C':
        dispatch({ type: 'CLEAR' });
        break;
      case '=':
        dispatch({ type: 'EQUALS' });
        break;
      case '+':
      case '-':
      case '*':
      case '/':
        dispatch({ type: 'OPERATOR', payload: value });
        break;
      case '.':
        dispatch({ type: 'DECIMAL' });
        break;
      default:
        if (/^[0-9]$/.test(value)) {
          dispatch({ type: 'DIGIT', payload: value });
        }
    }
  };

  return {
    state,
    dispatch,
    handleButtonClick,
  };
};