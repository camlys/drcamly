
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { mockAppointments, Appointment } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PatientDashboard() {
  const { authState, logout } = useAuth();
  const router = useRouter();
  
  // Mocking a logged-in patient. In a real app, this would come from the auth state.
  const currentPatientId = "pat1";

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const userAppointments = mockAppointments.filter(a => a.patientId === currentPatientId);
    const upcoming = userAppointments.filter(a => a.status === 'Upcoming').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = userAppointments.filter(a => a.status !== 'Upcoming').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [currentPatientId]);

  useEffect(() => {
    if (!authState.isAuthenticated || authState.userType !== 'patient') {
      router.push('/patient/login');
    }
  }, [authState, router]);

  if (!authState.isAuthenticated || authState.userType !== 'patient') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  const renderAppointmentRows = (appointments: Appointment[]) => {
      if (appointments.length === 0) {
          return <TableRow><TableCell colSpan={4} className="text-center">No appointments found.</TableCell></TableRow>;
      }
      return appointments.map(appt => (
          <TableRow key={appt.id}>
            <TableCell>{format(new Date(appt.date), "PPP")} at {appt.time}</TableCell>
            <TableCell>{appt.doctorName}</TableCell>
            <TableCell>{appt.department}</TableCell>
            <TableCell><Badge variant={appt.status === 'Completed' ? 'secondary' : 'default'}>{appt.status}</Badge></TableCell>
          </TableRow>
      ));
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="bg-card border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Patient Dashboard</h1>
           <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, {mockAppointments.find(a => a.patientId === currentPatientId)?.patientName || 'Patient'}!</CardTitle>
                    <CardDescription>This is your personal health dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Here you can view your upcoming appointments, medical records, and more.</p>
                </CardContent>
            </Card>
            <Tabs defaultValue="upcoming">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
                <TabsTrigger value="history">Appointment History</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Appointments</CardTitle>
                        <CardDescription>Your scheduled future appointments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderAppointmentRows(upcomingAppointments)}
                            </TableBody>
                        </Table>
                         <Button asChild className="mt-4">
                            <Link href="/#appointment">Book a new appointment</Link>
                        </Button>
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history">
                 <Card>
                    <CardHeader>
                        <CardTitle>Appointment History</CardTitle>
                        <CardDescription>Your past appointments and their details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderAppointmentRows(pastAppointments)}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        </div>
      </main>
    </div>
  );
}
