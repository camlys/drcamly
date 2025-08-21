
"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { mockTestimonials, addTestimonial, Testimonial } from '@/lib/data';

const testimonialSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    quote: z.string().min(10, "Testimonial must be at least 10 characters long."),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export default function Testimonials() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(mockTestimonials);

  const form = useForm<TestimonialFormValues>({
      resolver: zodResolver(testimonialSchema),
      defaultValues: {
          name: "",
          quote: "",
      }
  });

  const onSubmit = (data: TestimonialFormValues) => {
      const newTestimonial = addTestimonial(data);
      setTestimonials(prev => [...prev, newTestimonial]);
      toast({
          title: "Thank you!",
          description: "Your testimonial has been submitted successfully.",
      });
      form.reset();
  }


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
          className="w-full max-w-6xl mx-auto mt-12"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
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
             <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <Card className="h-full">
                     <CardHeader>
                        <CardTitle className="text-center">Leave a Testimonial</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                               <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                               />
                               <FormField
                                control={form.control}
                                name="quote"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Testimonial</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Share your experience..." className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                               />
                               <Button type="submit" className="w-full">Submit</Button>
                            </form>
                        </Form>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
