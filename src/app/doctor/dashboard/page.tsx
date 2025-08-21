

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
import { format, formatISO, startOfDay, subDays } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronDown, MessageSquare, UserCircle } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function DoctorDashboard() {
  const { authState } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const currentDoctorId = "doc1";
  
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  
  const currentDoctor = useMemo(() => doctors.find(d => d.id === currentDoctorId), [doctors, currentDoctorId]);

  const [selectedUnavailableTimes, setSelectedUnavailableTimes] = useState<string[]>([]);

  const { todaysAppointments, doctorPatients, appointmentStats, weeklyAppointmentsChartData } = useMemo(() => {
    const today = startOfDay(new Date());

    const doctorAppointments = appointments.filter(a => a.doctorId === currentDoctorId);

    const todaysAppts = doctorAppointments.filter(a => {
        const apptDate = startOfDay(new Date(a.date));
        return apptDate.getTime() === today.getTime();
    });
    
    const patientIds = new Set(doctorAppointments.map(a => a.patientId));
    const patients = mockPatients.filter(p => patientIds.has(p.id));
    
    const stats = {
      upcoming: doctorAppointments.filter(a => a.status === 'Upcoming').length,
      completed: doctorAppointments.filter(a => a.status === 'Completed').length,
      cancelled: doctorAppointments.filter(a => a.status === 'Cancelled').length,
    };
    
    const weeklyData: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const formattedDate = format(date, 'MMM d');
        weeklyData[formattedDate] = 0;
    }

    doctorAppointments.forEach(appt => {
        const apptDate = startOfDay(new Date(appt.date));
        if (apptDate >= subDays(today, 6) && apptDate <= today) {
            const formattedDate = format(apptDate, 'MMM d');
            weeklyData[formattedDate]++;
        }
    });

    const chartData = Object.keys(weeklyData).map(date => ({
        date,
        appointments: weeklyData[date],
    }));


    return { 
        todaysAppointments: todaysAppts, 
        doctorPatients: patients, 
        appointmentStats: stats,
        weeklyAppointmentsChartData: chartData
    };
  }, [currentDoctorId, appointments]);
  
  const appointmentStatusChartData = [
      { name: 'Upcoming', value: appointmentStats.upcoming },
      { name: 'Completed', value: appointmentStats.completed },
      { name: 'Cancelled', value: appointmentStats.cancelled },
  ];


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

  const handleSelectAllTimes = (checked: boolean) => {
    if (checked) {
      setSelectedUnavailableTimes(timeSlots);
    } else {
      setSelectedUnavailableTimes([]);
    }
  }

  const handleSetUnavailability = () => {
    if(!selectedDates || selectedDates.length === 0 || !currentDoctor) {
        toast({
            title: "Error",
            description: "Please select one or more dates.",
            variant: "destructive",
        })
        return;
    }

    setDoctors(prevDoctors => {
        return prevDoctors.map(doc => {
            if(doc.id === currentDoctorId) {
                const newUnavailability = [...doc.unavailability];
                
                selectedDates.forEach(date => {
                    const dateString = formatISO(startOfDay(date), { representation: 'date' });
                    const index = newUnavailability.findIndex(u => u.date === dateString);

                    const timesToSet = selectedUnavailableTimes.length > 0 ? selectedUnavailableTimes : timeSlots;

                    if (index > -1) {
                        const existingTimes = newUnavailability[index].times;
                        const updatedTimes = [...new Set([...existingTimes, ...timesToSet])];
                        newUnavailability[index] = { date: dateString, times: updatedTimes };
                    } else {
                        newUnavailability.push({ date: dateString, times: timesToSet });
                    }
                });
                
                console.log("Saving unavailability for", doc.name, newUnavailability);
                
                return { ...doc, unavailability: newUnavailability };
            }
            return doc;
        });
    });

    toast({
        title: "Unavailability Updated",
        description: `Your unavailable slots for the selected dates have been saved.`,
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
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card className="bg-secondary/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Patients</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{doctorPatients.length}</p>
                                <p className="text-muted-foreground">active patients</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-secondary/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Today's Appointments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{todaysAppointments.length}</p>
                                <p className="text-muted-foreground">scheduled</p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                           <Button asChild>
                                <Link href="/chat"><MessageSquare className="mr-2 h-4 w-4" /> Go to Messages</Link>
                           </Button>
                           <Dialog>
                            <DialogTrigger asChild>
                               <Button variant="outline">
                                    <UserCircle className="mr-2 h-4 w-4" /> View My Profile
                               </Button>
                             </DialogTrigger>
                             <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>My Profile</DialogTitle>
                                    <DialogDescription>Your professional information.</DialogDescription>
                                </DialogHeader>
                                {currentDoctor && (
                                <div className="grid gap-4 py-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                      <AvatarImage src={`https://i.pravatar.cc/80?u=${currentDoctor.id}`} />
                                      <AvatarFallback>{getInitials(currentDoctor.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-lg font-semibold">{currentDoctor.name}</h3>
                                      <p className="text-sm text-muted-foreground">{currentDoctor.specialty}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-1">Professional Bio</h4>
                                    <p className="text-sm text-muted-foreground">{currentDoctor.bio || 'No bio provided.'}</p>
                                  </div>
                                </div>
                                )}
                             </DialogContent>
                           </Dialog>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>An overview of your appointments.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                      <h4 className="text-center font-semibold mb-2">Appointments Last 7 Days</h4>
                      <ChartContainer config={{
                        appointments: {
                          label: 'Appointments',
                          color: 'hsl(var(--primary))',
                        },
                      }} className="h-[250px] w-full">
                        <BarChart data={weeklyAppointmentsChartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="appointments" fill="var(--color-appointments)" radius={4} />
                        </BarChart>
                      </ChartContainer>
                  </div>
                   <div>
                       <h4 className="text-center font-semibold mb-2">Appointment Status</h4>
                      <ChartContainer config={{}} className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={appointmentStatusChartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {appointmentStatusChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                  </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Today's Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="overflow-x-auto">
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
                      </div>
                  </CardContent>
              </Card>
              <Card>
                <Accordion type="single" collapsible>
                  <AccordionItem value="unavailability" className="border-b-0">
                    <AccordionTrigger className="p-6">
                        <div className="flex flex-col items-start">
                            <CardTitle>Set Unavailability</CardTitle>
                            <CardDescription className="text-left mt-1">Select dates and times you are unavailable.</CardDescription>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-0">
                        <CardDescription className="mb-4">If no times are selected, you'll be marked as unavailable for the entire day for the chosen dates.</CardDescription>
                        <div className="flex flex-col md:flex-row items-start gap-4">
                           <Calendar
                              mode="multiple"
                              selected={selectedDates}
                              onSelect={setSelectedDates}
                              className="rounded-md border"
                              disabled={{ before: new Date() }}
                              numberOfMonths={1}
                            />
                            <div className="flex-1 w-full">
                                <div className="flex items-center justify-between mb-3">
                                   <h4 className="font-medium">Time Slots</h4>
                                    <div className="flex items-center space-x-2">
                                         <Checkbox 
                                            id="select-all-times"
                                            onCheckedChange={(checked) => handleSelectAllTimes(!!checked)}
                                            checked={selectedUnavailableTimes.length === timeSlots.length}
                                         />
                                         <Label htmlFor="select-all-times" className="text-sm font-normal">
                                            Select All
                                        </Label>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">Select specific times to mark as unavailable for the chosen dates.</p>
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
                        </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            </div>
             <Card>
                  <CardHeader>
                      <CardTitle>My Patients</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="overflow-x-auto">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
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
                                    <TableCell>{patient.phone || 'N/A'}</TableCell>
                                  </TableRow>
                                )) : (
                                  <TableRow><TableCell colSpan={3} className="text-center">No patients found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                      </div>
                  </CardContent>
              </Card>
        </div>
      </main>
    </div>
  );
}
