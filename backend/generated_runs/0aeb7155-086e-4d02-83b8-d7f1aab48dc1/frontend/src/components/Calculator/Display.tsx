'use client';

import React from 'react';
import styles from './styles.module.css';

interface DisplayProps {
  value: string;
  hasError: boolean;
}

const Display: React.FC<DisplayProps> = ({ value, hasError }) => {
  return (
    <div className={`${styles.display} ${hasError ? styles.error : ''}`}>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
        {value || '0'}
      </div>
    </div>
  );
};

export default Display;