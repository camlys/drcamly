
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
import { useAuth } from "@/context/auth-context";

const signupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .refine((password) => /[a-z]/.test(password), { message: "Password must contain at least one lowercase letter."})
    .refine((password) => /[A-Z]/.test(password), { message: "Password must contain at least one uppercase letter."})
    .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one number."})
    .refine((password) => /[\W_]/.test(password), { message: "Password must contain at least one special character."}),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function PatientSignupPage() {
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
    // In a real app, you'd call your auth service to register the user.
    console.log(data);
    login('patient'); // Log the user in directly after signup
    toast({
      title: "Account Created!",
      description: `Welcome, ${data.name}! You are now logged in.`,
    });
    router.push('/patient/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-background py-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Patient Sign Up</CardTitle>
          <CardDescription className="text-center">Create an account to manage your appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
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
                Already have an account? <Link href="/patient/login" className="underline">Log in</Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
