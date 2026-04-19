'use client';

import { useState } from 'react';
import styled from 'styled-components';

const HeroSection = styled.section`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  gap: 1.5rem;
`;

const CTAButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.accent.DEFAULT};
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accent.hover};
  }
`;

const FeaturesSection = styled.section`
  padding: 4rem 1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const Header = styled.header`
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
`;

const Logo = styled.div`
  font-weight: 700;
  font-size: 1.25rem;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const Footer = styled.footer`
  padding: 2rem;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  margin-top: 4rem;
`;

export default function Home() {
  const [clickCount, setClickCount] = useState(0);

  const handleCTAClick = () => {
    setClickCount(clickCount + 1);
    alert(`Thank you! Button clicked ${clickCount + 1} times.`);
  };

  return (
    <>
      <Header>
        <Logo>Minimalist</Logo>
        <Nav>
          <a href="#features" className="text-primary hover:text-accent">Features</a>
          <a href="#about" className="text-primary hover:text-accent">About</a>
        </Nav>
      </Header>

      <main>
        <HeroSection>
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Welcome to Minimalist
          </h1>
          <p className="text-lg md:text-xl text-primary-light max-w-2xl">
            A lightweight, self-contained landing page with no external dependencies.
            Optimized for performance and simplicity.
          </p>
          <CTAButton onClick={handleCTAClick}>
            Get Started
          </CTAButton>
        </HeroSection>

        <FeaturesSection id="features">
          <h2 className="text-2xl font-bold text-primary mb-6">Key Features</h2>
          <FeatureCard>
            <h3 className="text-xl font-semibold mb-2">Single File</h3>
            <p className="text-primary-light">Everything you need in one HTML file with embedded CSS and JavaScript.</p>
          </FeatureCard>
          <FeatureCard>
            <h3 className="text-xl font-semibold mb-2">Mobile-First</h3>
            <p className="text-primary-light">Responsive design that works on all devices.</p>
          </FeatureCard>
          <FeatureCard>
            <h3 className="text-xl font-semibold mb-2">No Dependencies</h3>
            <p className="text-primary-light">Zero external libraries or CDN imports.</p>
          </FeatureCard>
        </FeaturesSection>
      </main>

      <Footer>
        <p className="text-primary-light">
          &copy; {new Date().getFullYear()} Minimalist Landing Page. All rights reserved.
        </p>
      </Footer>
    </>
  );
}