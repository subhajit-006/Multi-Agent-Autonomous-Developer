import React from 'react';

interface TitleProps {
  children: React.ReactNode;
  className?: string;
}

const Title: React.FC<TitleProps> = ({ children, className = '' }) => {
  return (
    <h1 className={`text-4xl md:text-5xl font-bold ${className}`}>
      {children}
    </h1>
  );
};

export default Title;