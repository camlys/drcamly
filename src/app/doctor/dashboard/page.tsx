import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DoctorDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Doctor Dashboard</h1>
          <Button asChild variant="outline">
            <Link href="/">Logout</Link>
          </Button>
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
                </CardHeader>
                <CardContent>
                    <p>You have 5 appointments today.</p>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
