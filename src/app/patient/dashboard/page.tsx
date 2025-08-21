
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { mockAppointments, Appointment, mockPatients } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";

export default function PatientDashboard() {
  const { authState } = useAuth();
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
    if (!authState.loading && (!authState.isAuthenticated || authState.userType !== 'patient')) {
      router.push('/patient/login');
    }
  }, [authState, router]);

  if (authState.loading || !authState.isAuthenticated || authState.userType !== 'patient') {
    return <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">Loading...</div>;
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
  
  const currentPatient = useMemo(() => mockPatients.find(p => p.id === currentPatientId), [currentPatientId]);


  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-primary">Patient Dashboard</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, {currentPatient?.name || 'Patient'}!</CardTitle>
                    <CardDescription>This is your personal health dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Here you can view your upcoming appointments, medical records, and messages.</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Next Appointment</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {upcomingAppointments.length > 0 ? (
                           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg bg-secondary">
                               <div>
                                  <p className="text-xl font-bold">{upcomingAppointments[0].doctorName}</p>
                                  <p className="text-muted-foreground">{upcomingAppointments[0].department}</p>
                                  <p className="mt-2 font-semibold">{format(new Date(upcomingAppointments[0].date), "PPPP")} at {upcomingAppointments[0].time}</p>
                               </div>
                                <Button asChild className="mt-4 sm:mt-0">
                                  <Link href="/booking">Reschedule</Link>
                                </Button>
                           </div>
                       ) : (
                           <div className="text-center p-4 rounded-lg bg-secondary">
                              <p>You have no upcoming appointments.</p>
                               <Button asChild className="mt-4">
                                  <Link href="/booking">Book a new appointment</Link>
                              </Button>
                           </div>
                       )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Messages</CardTitle>
                        <CardDescription>Communicate with your doctors.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center">
                       <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                       <p className="mb-4 text-muted-foreground">You have 2 unread messages.</p>
                       <Button asChild>
                          <Link href="/chat">View Messages</Link>
                       </Button>
                    </CardContent>
                </Card>
            </div>
            
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
                            <Link href="/booking">Book a new appointment</Link>
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
