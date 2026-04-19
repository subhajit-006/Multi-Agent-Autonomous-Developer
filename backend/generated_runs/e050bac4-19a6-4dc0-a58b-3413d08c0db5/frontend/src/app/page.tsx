import Hero from '@/app/components/Hero';
import Features from '@/app/components/Features';
import CTA from '@/app/components/CTA';
import Footer from '@/app/components/Footer';
import Navbar from '@/app/components/Navbar';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}