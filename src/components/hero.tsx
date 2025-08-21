import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section id="home" className="relative w-full h-[80vh] min-h-[500px] flex items-center bg-gradient-radial from-blue-300 to-green-200">
      <div className="container relative z-20 px-4 md:px-6">
        <div className="max-w-3xl text-left">
          <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl !leading-tight" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
            Compassionate Care, Advanced Medicine.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
            Welcome to CamlyCare, where our dedicated team provides exceptional healthcare services with a personal touch.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 animate-pulse">
              <Link href="/booking">Schedule an Appointment</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
