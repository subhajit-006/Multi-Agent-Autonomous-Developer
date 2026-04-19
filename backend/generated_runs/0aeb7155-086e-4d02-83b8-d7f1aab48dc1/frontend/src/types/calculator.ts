export interface CalculatorState {
  currentValue: string | null;
  previousValue: string | null;
  operator: string | null;
  hasError: boolean;
  errorMessage: string | null;
}

export type CalculatorAction =
  | { type: 'CLEAR' }
  | { type: 'DIGIT'; payload: string }
  | { type: 'DECIMAL' }
  | { type: 'OPERATOR'; payload: string }
  | { type: 'EQUALS' };