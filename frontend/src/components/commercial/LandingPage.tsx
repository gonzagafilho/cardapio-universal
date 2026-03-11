import {
  LandingLayout,
  Hero,
  Benefits,
  Preview,
  Plans,
  Footer,
} from '@/components/landing';

export function LandingPage() {
  return (
    <LandingLayout>
      <Hero />
      <Benefits />
      <Preview />
      <Plans />
      <Footer />
    </LandingLayout>
  );
}
