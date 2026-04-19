'use client';

import React from 'react';
import { CalculatorState, CalculatorAction } from '@/types/calculator';

interface InputHandlerProps {
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
}

const InputHandler: React.FC<InputHandlerProps> = ({ state, dispatch }) => {
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

  return null;
};

export default InputHandler;