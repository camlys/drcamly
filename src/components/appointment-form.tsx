
"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockDoctors } from "@/lib/data";

const appointmentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  doctor: z.string({ required_error: "Please select a doctor." }),
  date: z.date({ required_error: "A date for the appointment is required." }),
  message: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const defaultValues: Partial<AppointmentFormValues> = { name: "", email: "" };

function AppointmentFormContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues,
  });

  useEffect(() => {
    const doctorId = searchParams.get("doctor");
    if (doctorId && mockDoctors.some(d => d.id === doctorId)) {
      form.setValue("doctor", doctorId);
    }
  }, [searchParams, form]);


  function onSubmit(data: AppointmentFormValues) {
    const doctor = mockDoctors.find(d => d.id === data.doctor);
    toast({
      title: "Appointment Scheduled!",
      description: `Thank you, ${data.name}. Your appointment with ${doctor?.name} on ${format(data.date, "PPP")} has been successfully booked.`,
      variant: "default",
      className: "bg-accent text-accent-foreground border-0",
    });
    form.reset();
  }

  return (
    <section id="appointment" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <Card className="max-w-4xl mx-auto overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-6 md:p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-3xl font-bold tracking-tight">Book an Appointment</CardTitle>
                <CardDescription>Fill out the form below to schedule your visit.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="doctor" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a doctor" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {mockDoctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.specialty})</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="date" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Appointment Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                        <FormItem><FormLabel>Additional Information (Optional)</FormLabel><FormControl><Textarea placeholder="Tell us a little bit about your needs..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Schedule Now</Button>
                  </form>
                </Form>
              </CardContent>
            </div>
            <div className="hidden md:block relative">
              <Image src="https://placehold.co/600x800.png" alt="Doctor consulting a patient" data-ai-hint="doctor patient" fill className="object-cover" />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

// Wrap with Suspense for components that use useSearchParams
export default function AppointmentForm() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <AppointmentFormContent />
        </React.Suspense>
    )
}
