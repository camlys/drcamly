
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { mockAppointments, mockPatients, Appointment, Patient, mockDoctors, timeSlots, Doctor } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format, formatISO, startOfDay } from "date-fns";

export default function DoctorDashboard() {
  const { authState } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const currentDoctorId = "doc1";
  
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const currentDoctor = useMemo(() => doctors.find(d => d.id === currentDoctorId), [doctors, currentDoctorId]);

  const unavailableTimesForSelectedDate = useMemo(() => {
    if (!selectedDate || !currentDoctor) return [];
    const dateString = formatISO(startOfDay(selectedDate), { representation: 'date' });
    const unavailability = currentDoctor.unavailability.find(u => u.date === dateString);
    return unavailability ? unavailability.times : [];
  }, [selectedDate, currentDoctor]);

  const [selectedUnavailableTimes, setSelectedUnavailableTimes] = useState<string[]>([]);
  
  useEffect(() => {
    setSelectedUnavailableTimes(unavailableTimesForSelectedDate);
  }, [unavailableTimesForSelectedDate]);


  const { todaysAppointments, doctorPatients } = useMemo(() => {
    const today = startOfDay(new Date());

    const todaysAppts = appointments.filter(a => {
        const apptDate = startOfDay(new Date(a.date));
        return a.doctorId === currentDoctorId && apptDate.getTime() === today.getTime();
    });
    
    const patientIds = new Set(appointments.filter(a => a.doctorId === currentDoctorId).map(a => a.patientId));
    const patients = mockPatients.filter(p => patientIds.has(p.id));

    return { todaysAppointments: todaysAppts, doctorPatients: patients };
  }, [currentDoctorId, appointments]);


  useEffect(() => {
    if (!authState.loading && (!authState.isAuthenticated || authState.userType !== 'doctor')) {
      router.push('/doctor/login');
    }
  }, [authState, router]);

  const handleStatusChange = (appointmentId: string, newStatus: "Upcoming" | "Completed" | "Cancelled") => {
    setAppointments(prev => prev.map(appt => appt.id === appointmentId ? { ...appt, status: newStatus } : appt));
    toast({
        title: "Status Updated",
        description: `Appointment status has been changed to ${newStatus}.`,
    });
  };

  const handleTimeSelectionChange = (time: string, checked: boolean) => {
    setSelectedUnavailableTimes(prev => {
        if(checked) {
            return [...prev, time];
        } else {
            return prev.filter(t => t !== time);
        }
    });
  }

  const handleSetUnavailability = () => {
    if(!selectedDate || !currentDoctor) {
        toast({
            title: "Error",
            description: "Please select a doctor and date.",
            variant: "destructive",
        })
        return;
    }
    const dateString = formatISO(startOfDay(selectedDate), { representation: 'date' });

    setDoctors(prevDoctors => {
        return prevDoctors.map(doc => {
            if(doc.id === currentDoctorId) {
                const otherUnavailability = doc.unavailability.filter(u => u.date !== dateString);
                const newUnavailability = selectedUnavailableTimes.length > 0 
                    ? [...otherUnavailability, { date: dateString, times: selectedUnavailableTimes }]
                    : otherUnavailability;
                
                // This is where you would typically make an API call to save the data
                console.log("Saving unavailability for", doc.name, newUnavailability);
                
                return { ...doc, unavailability: newUnavailability };
            }
            return doc;
        });
    });

    toast({
        title: "Unavailability Updated",
        description: `Your unavailable slots for ${format(selectedDate, 'PPP')} have been saved.`,
    });
  }

  if (authState.loading || !authState.isAuthenticated || authState.userType !== 'doctor') {
    return <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">Loading...</div>;
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">Doctor Dashboard</h1>
          </div>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, {currentDoctor?.name || 'Doctor'}!</CardTitle>
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
                  </CardHeader>
                  <CardContent>
                       <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Time</TableHead>
                                  <TableHead>Patient</TableHead>
                                  <TableHead className="w-[150px]">Status</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {todaysAppointments.length > 0 ? todaysAppointments.map(appt => (
                                <TableRow key={appt.id}>
                                  <TableCell>{appt.time}</TableCell>
                                  <TableCell>{appt.patientName}</TableCell>
                                  <TableCell>
                                    <Select 
                                        value={appt.status} 
                                        onValueChange={(value: "Upcoming" | "Completed" | "Cancelled") => handleStatusChange(appt.id, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Upcoming">Upcoming</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                  </TableCell>
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
                      <CardTitle>Set Unavailability</CardTitle>
                      <CardDescription>Select a date and mark the times you are unavailable.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col lg:flex-row items-start gap-4">
                       <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                          disabled={{ before: new Date() }}
                        />
                        <div className="flex-1 w-full">
                            <h4 className="font-medium mb-2">Time Slots for {selectedDate ? format(selectedDate, "PPP") : "..."}</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.map(time => (
                                    <div key={time} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`time-${time.replace(/\s/g, '')}`}
                                            checked={selectedUnavailableTimes.includes(time)}
                                            onCheckedChange={(checked) => handleTimeSelectionChange(time, !!checked)}
                                        />
                                        <Label htmlFor={`time-${time.replace(/\s/g, '')}`} className="text-sm font-normal">
                                            {time}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                           <Button onClick={handleSetUnavailability} className="w-full mt-4">Save Unavailability</Button>
                        </div>
                  </CardContent>
              </Card>
            </div>
             <Card>
                  <CardHeader>
                      <CardTitle>My Patients</CardTitle>
                  </CardHeader>
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
      </main>
    </div>
  );
}

    