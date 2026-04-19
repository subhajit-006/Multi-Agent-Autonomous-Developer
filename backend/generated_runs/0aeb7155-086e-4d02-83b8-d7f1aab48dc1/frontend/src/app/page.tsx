'use client';

import { useCalculator } from '@/hooks/useCalculator';
import Calculator from '@/components/Calculator';

export default function Home() {
  const calculator = useCalculator();

  return (
    <div className="w-full max-w-md mx-auto">
      <Calculator {...calculator} />
    </div>
  );
}