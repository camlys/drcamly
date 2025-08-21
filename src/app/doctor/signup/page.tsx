
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";

const signupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  specialty: z.string({ required_error: "Please select a specialty." }),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

const specialties = ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Ophthalmology", "General Practice"];

export default function DoctorSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(data: SignupFormValues) {
    // In a real app, you'd call your auth service to register the doctor.
    console.log(data);
    login('doctor');
    toast({
      title: "Account Created!",
      description: `Welcome, Dr. ${data.name}! You are now logged in.`,
    });
    router.push('/doctor/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Doctor Sign Up</CardTitle>
          <CardDescription className="text-center">Create a professional account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Dr. John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input placeholder="doctor@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="specialty" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select your specialty" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full">Create Account</Button>
              <div className="text-center text-sm">
                Already have an account? <Link href="/doctor/login" className="underline">Log in</Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
