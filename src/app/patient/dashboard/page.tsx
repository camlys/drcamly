import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PatientDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="bg-card border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Patient Dashboard</h1>
           <Button asChild variant="outline">
            <Link href="/">Logout</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, Patient!</CardTitle>
                    <CardDescription>This is your personal health dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Here you can view your upcoming appointments, medical records, and more.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You have no upcoming appointments.</p>
                     <Button asChild className="mt-4">
                        <Link href="/#appointment">Book a new appointment</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
