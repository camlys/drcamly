"use client";

import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const testimonials = [
  {
    name: "Sarah L.",
    quote: "The care I received at Dr.Camly was exceptional. The doctors and nurses were incredibly attentive and made me feel comfortable throughout my stay. I can't thank them enough.",
    avatar: "https://placehold.co/80x80.png"
  },
  {
    name: "Michael B.",
    quote: "Booking an appointment online was so easy and convenient. The staff was professional and the facilities are top-notch. Highly recommend Dr.Camly.",
    avatar: "https://placehold.co/80x80.png"
  },
  {
    name: "Jessica P.",
    quote: "Dr. Reed is a fantastic cardiologist. She took the time to explain everything to me and answered all my questions. I feel like I'm in great hands at Dr.Camly.",
    avatar: "https://placehold.co/80x80.png"
  },
  {
    name: "David C.",
    quote: "From the front desk to the medical team, everyone was friendly and efficient. A truly positive hospital experience. Dr.Camly is setting a new standard for patient care.",
    avatar: "https://placehold.co/80x80.png"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-card px-3 py-1 text-sm font-medium">Patient Stories</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Patients Say</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Read success stories from patients who have trusted us with their care.
            </p>
          </div>
        </div>
        <Carousel
          plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
          opts={{ align: "start", loop: true }}
          className="w-full max-w-4xl mx-auto mt-12"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2">
                <div className="p-2">
                  <Card className="h-full">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <Image
                        src={testimonial.avatar}
                        alt={`Avatar of ${testimonial.name}`}
                        width={80}
                        height={80}
                        className="rounded-full"
                        data-ai-hint="patient portrait"
                      />
                      <blockquote className="text-muted-foreground italic">"{testimonial.quote}"</blockquote>
                      <cite className="font-semibold not-italic">{testimonial.name}</cite>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
