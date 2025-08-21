

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, CreditCard } from "lucide-react";
import { format, formatISO, startOfDay } from "date-fns";
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
import { mockDoctors, addAppointment, updateAppointment, mockPatients, timeSlots, mockAppointments } from "@/lib/data";
import { useAuth } from "@/context/auth-context";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const appointmentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  doctor: z.string({ required_error: "Please select a doctor." }),
  date: z.date({ required_error: "A date for the appointment is required." }),
  time: z.string({ required_error: "A time for the appointment is required." }),
  consultationType: z.enum(["In-Person", "Online"], { required_error: "Please select a consultation type."}),
  message: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const defaultValues: Partial<AppointmentFormValues> = { 
  name: "", 
  email: "",
  consultationType: "In-Person",
};

function AppointmentFormContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authState } = useAuth();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const rescheduleId = searchParams.get("rescheduleId");
  const isEditing = !!rescheduleId;

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues,
  });

  const selectedDoctorId = form.watch("doctor");
  const selectedDate = form.watch("date");

  const selectedDoctor = useMemo(() => {
    return mockDoctors.find(d => d.id === selectedDoctorId);
  }, [selectedDoctorId]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];

    const dateString = formatISO(startOfDay(selectedDate), { representation: 'date' });
    const isoDateString = startOfDay(selectedDate).toISOString();
    
    // Get doctor's specific unavailable times for that day
    const unavailableTimes = selectedDoctor.unavailability.find(u => u.date === dateString)?.times || [];
    
    // Get times already booked for that doctor on that day
    const bookedTimes = mockAppointments
        .filter(a => a.doctorId === selectedDoctorId && startOfDay(new Date(a.date)).toISOString() === isoDateString)
        .map(a => a.time);

    // Combine and filter the original time slots
    return timeSlots.filter(time => !unavailableTimes.includes(time) && !bookedTimes.includes(time));
  }, [selectedDoctor, selectedDate, selectedDoctorId]);
  
  useEffect(() => {
    // Reset time field if the available slots change and the current time is no longer valid
    const currentTime = form.getValues("time");
    if(currentTime && !availableTimeSlots.includes(currentTime)){
      form.setValue("time", "");
    }
  }, [availableTimeSlots, form]);


  useEffect(() => {
    const doctorId = searchParams.get("doctor");
    if (doctorId && mockDoctors.some(d => d.id === doctorId) && !isEditing) {
      form.setValue("doctor", doctorId);
    }

    if (rescheduleId) {
        const appointmentToEdit = mockAppointments.find(a => a.id === rescheduleId);
        if (appointmentToEdit) {
            form.reset({
                name: appointmentToEdit.patientName,
                email: mockPatients.find(p => p.id === appointmentToEdit.patientId)?.email,
                doctor: appointmentToEdit.doctorId,
                date: new Date(appointmentToEdit.date),
                time: appointmentToEdit.time,
                consultationType: appointmentToEdit.consultationType,
                message: appointmentToEdit.notes,
            });
        }
    }
  }, [searchParams, form, rescheduleId, isEditing]);

  useEffect(() => {
    if (authState.isAuthenticated && authState.userType === 'patient' && !isEditing) {
      const patient = mockPatients[0]; 
      form.setValue('name', patient.name);
      form.setValue('email', patient.email);
    }
  }, [authState, form, isEditing]);


  function onSubmit(data: AppointmentFormValues) {
    const doctor = mockDoctors.find(d => d.id === data.doctor);
    if (!doctor) {
        toast({ title: "Error", description: "Selected doctor not found.", variant: "destructive" });
        return;
    }

    const patientId = authState.isAuthenticated && authState.userType === 'patient' ? "pat1" : "new-patient";

    if (isEditing && rescheduleId) {
        updateAppointment(rescheduleId, {
            patientName: data.name,
            patientId: patientId,
            doctorName: doctor.name,
            doctorId: doctor.id,
            department: doctor.specialty,
            date: data.date.toISOString(),
            time: data.time,
            consultationType: data.consultationType,
            consultationFee: doctor.consultationFee,
            notes: data.message,
        });
        toast({
            title: "Appointment Updated!",
            description: `Your appointment with ${doctor?.name} on ${format(data.date, "PPP")} has been successfully rescheduled.`,
            variant: "default",
        });
        router.push('/patient/dashboard');
    } else {
        addAppointment({
            patientName: data.name,
            patientId: patientId,
            doctorName: doctor.name,
            doctorId: doctor.id,
            department: doctor.specialty,
            date: data.date.toISOString(),
            time: data.time,
            consultationType: data.consultationType,
            consultationFee: doctor.consultationFee,
            notes: data.message,
        });
        toast({
            title: "Appointment Scheduled!",
            description: `Thank you, ${data.name}. Your ${data.consultationType} appointment with ${doctor?.name} on ${format(data.date, "PPP")} at ${data.time} has been successfully booked.`,
            variant: "default",
            className: "bg-accent text-accent-foreground border-0",
        });
        form.reset(defaultValues);
        const doctorId = searchParams.get("doctor");
        if (doctorId) {
            form.setValue("doctor", "");
        }
    }
  }

  return (
    <section id="appointment" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <Card className="max-w-4xl mx-auto overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-6 md:p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-3xl font-bold tracking-tight">{isEditing ? "Reschedule Appointment" : "Book an Appointment"}</CardTitle>
                <CardDescription>{isEditing ? "Update the details below to reschedule your visit." : "Fill out the form below to schedule your visit."}</CardDescription>
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

                    {selectedDoctor && (
                        <div className="p-3 rounded-md bg-secondary/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                <span className="font-semibold">Consultation Fee</span>
                            </div>
                            <span className="font-bold text-lg">
                                {selectedDoctor.consultationFee > 0 ? `₹${selectedDoctor.consultationFee.toFixed(2)}` : 'Free'}
                            </span>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem className="flex flex-col justify-end">
                          <FormLabel>Appointment Date</FormLabel>
                          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); setIsCalendarOpen(false); }} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="time" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Appointment Time</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={!selectedDoctorId || !selectedDate}>
                            <FormControl><SelectTrigger><SelectValue placeholder={!selectedDoctorId || !selectedDate ? "Select doctor and date first" : "Select a time"} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {availableTimeSlots.length > 0 ? (
                                availableTimeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)
                              ) : (
                                <SelectItem value="no-slots" disabled>No available slots</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                     <FormField control={form.control} name="consultationType" render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Consultation Type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-row space-x-4"
                                >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="In-Person" /></FormControl>
                                    <FormLabel className="font-normal">In-Person Visit</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="Online" /></FormControl>
                                    <FormLabel className="font-normal">Online Consultation</FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                        <FormItem><FormLabel>Additional Information (Optional)</FormLabel><FormControl><Textarea placeholder="Tell us a little bit about your needs..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        {isEditing ? "Update Appointment" : "Schedule Now"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </div>
            <div className="hidden md:block relative bg-gradient-radial from-blue-300 to-green-200">
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
