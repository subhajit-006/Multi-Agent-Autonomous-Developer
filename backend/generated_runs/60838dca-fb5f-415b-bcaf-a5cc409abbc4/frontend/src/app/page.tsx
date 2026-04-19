import Hero from '@/components/Hero';
import Title from '@/components/Title';
import Subtitle from '@/components/Subtitle';
import CTA from '@/components/CTA';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Hero>
        <Title>John Doe</Title>
        <Subtitle className="mt-2">Full-Stack Developer</Subtitle>
        <Subtitle className="mt-4 max-w-md text-center">
          Building scalable web applications with modern technologies
        </Subtitle>
        <CTA href="/contact" className="mt-8">
          Get In Touch
        </CTA>
      </Hero>
    </main>
  );
}