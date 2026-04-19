import React from 'react';

interface HeroProps {
  children: React.ReactNode;
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {children}
    </div>
  );
};

export default Hero;