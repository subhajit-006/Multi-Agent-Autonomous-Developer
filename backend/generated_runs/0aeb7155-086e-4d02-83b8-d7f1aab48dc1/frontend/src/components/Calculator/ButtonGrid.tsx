'use client';

import React from 'react';
import styles from './styles.module.css';

interface ButtonGridProps {
  onButtonClick: (value: string) => void;
}

const ButtonGrid: React.FC<ButtonGridProps> = ({ onButtonClick }) => {
  const buttons = [
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '/', value: '/' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '*', value: '*' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '-', value: '-' },
    { label: '0', value: '0' },
    { label: '.', value: '.' },
    { label: '=', value: '=' },
    { label: '+', value: '+' },
    { label: 'C', value: 'C' },
  ];

  return (
    <div className={styles.buttonGrid}>
      {buttons.map((button) => (
        <button
          key={button.value}
          className={`${styles.button} ${
            ['+', '-', '*', '/', '='].includes(button.value)
              ? styles.operatorButton
              : button.value === 'C'
              ? styles.clearButton
              : styles.digitButton
          }`}
          onClick={() => onButtonClick(button.value)}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default ButtonGrid;