'use client';

import React from 'react';
import Nav from '@/components/Nav';
import PremiumHero from '@/components/PremiumHero';
import TechStackCurve from '@/components/TechStackCurve';
import Workflow3D from '@/components/Workflow3D';
import AboutSwapSection from '@/components/AboutSwapSection';
import AgentBreakdown from '@/components/AgentBreakdown';
import PremiumFooter from '@/components/PremiumFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-body text-[var(--text-primary)]">
      <Nav />
      <main>
        <PremiumHero />
        <TechStackCurve />
        <Workflow3D />
        <AboutSwapSection />
        <AgentBreakdown />
      </main>
      <PremiumFooter />
    </div>
  );
}
