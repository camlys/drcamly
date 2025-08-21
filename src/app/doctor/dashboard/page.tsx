
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";

export default function DoctorDashboard() {
  const { authState, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authState.isAuthenticated || authState.userType !== 'doctor') {
      router.push('/doctor/login');
    }
  }, [authState, router]);

  if (!authState.isAuthenticated || authState.userType !== 'doctor') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>; // Or a loading spinner
  }
  
  const handleLogout = () => {
    logout();
    router.push('/');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Doctor Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, Doctor!</CardTitle>
                    <CardDescription>Manage your patients and appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Here you can view your schedule, manage patient records, and more.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Today's Appointments</CardTitle>
                </Header>
                <CardContent>
                    <p>You have 5 appointments today.</p>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
