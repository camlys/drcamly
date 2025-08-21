
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

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function PatientLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormValues) {
    // In a real app, you'd call your auth service here.
    console.log(data);
    login('patient');
    toast({
      title: "Logged In!",
      description: `Welcome back!`,
    });
    router.push('/patient/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Patient Login</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit" className="w-full">Login</Button>
              <div className="text-center text-sm">
                Don't have an account? <Link href="/patient/signup" className="underline">Sign up</Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
