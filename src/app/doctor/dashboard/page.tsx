
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { mockAppointments, mockPatients, Appointment, Patient } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function DoctorDashboard() {
  const { authState, logout } = useAuth();
  const router = useRouter();

  // Mocking a logged-in doctor.
  const currentDoctorId = "doc1";

  const { todaysAppointments, doctorPatients } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const appointments = mockAppointments.filter(a => a.doctorId === currentDoctorId && a.date.startsWith(todayStr) && a.status === 'Upcoming');
    
    const patientIds = new Set(mockAppointments.filter(a => a.doctorId === currentDoctorId).map(a => a.patientId));
    const patients = mockPatients.filter(p => patientIds.has(p.id));

    return { todaysAppointments: appointments, doctorPatients: patients };
  }, [currentDoctorId]);


  useEffect(() => {
    if (!authState.isAuthenticated || authState.userType !== 'doctor') {
      router.push('/doctor/login');
    }
  }, [authState, router]);

  if (!authState.isAuthenticated || authState.userType !== 'doctor') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  const handleLogout = () => {
    logout();
    router.push('/');
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
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
                    <CardTitle>Welcome, {mockAppointments.find(a => a.doctorId === currentDoctorId)?.doctorName || 'Doctor'}!</CardTitle>
                    <CardDescription>Manage your patients and appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium">Patients</h3>
                      <p className="text-muted-foreground">{doctorPatients.length} active patients</p>
                    </div>
                     <div>
                      <h3 className="text-lg font-medium">Today's Appointments</h3>
                      <p className="text-muted-foreground">{todaysAppointments.length} appointments scheduled</p>
                    </div>
                  </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Today's Appointments</CardTitle>
                  </Header>
                  <CardContent>
                       <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Time</TableHead>
                                  <TableHead>Patient</TableHead>
                                  <TableHead>Status</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {todaysAppointments.length > 0 ? todaysAppointments.map(appt => (
                                <TableRow key={appt.id}>
                                  <TableCell>{appt.time}</TableCell>
                                  <TableCell>{appt.patientName}</TableCell>
                                  <TableCell><Badge>{appt.status}</Badge></TableCell>
                                </TableRow>
                              )) : (
                                <TableRow><TableCell colSpan={3} className="text-center">No appointments for today.</TableCell></TableRow>
                              )}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle>My Patients</CardTitle>
                  </Header>
                  <CardContent>
                       <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Patient</TableHead>
                                  <TableHead>Email</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {doctorPatients.length > 0 ? doctorPatients.map(patient => (
                                <TableRow key={patient.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <AvatarImage src={`https://i.pravatar.cc/40?u=${patient.id}`} />
                                        <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                                      </Avatar>
                                      <span>{patient.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{patient.email}</TableCell>
                                </TableRow>
                              )) : (
                                <TableRow><TableCell colSpan={2} className="text-center">No patients found.</TableCell></TableRow>
                              )}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
