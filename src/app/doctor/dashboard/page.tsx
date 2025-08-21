
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Appointment, Patient, Doctor, Rating, getDoctorById, getAppointmentsByFilter, getPatients, updateDoctor as apiUpdateDoctor, timeSlots } from "@/lib/data";
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
import { MessageSquare, UserCircle, Pencil, Camera, Video, Building, CreditCard, Star } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const doctorProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  specialty: z.string().min(2, "Specialty is required."),
  consultationFee: z.coerce.number().min(0, "Fee must be a positive number."),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});
type DoctorProfileValues = z.infer<typeof doctorProfileSchema>;

const specialties = ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Ophthalmology", "General Practice"];

export default function DoctorDashboard() {
  const { authState } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const currentDoctorId = "doc1";
  
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [selectedUnavailableTimes, setSelectedUnavailableTimes] = useState<string[]>([]);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<DoctorProfileValues>({
    resolver: zodResolver(doctorProfileSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const doctor = await getDoctorById(currentDoctorId);
        if (doctor) {
            setCurrentDoctor(doctor);
            const doctorAppointments = await getAppointmentsByFilter({ doctorId: doctor.id });
            setAppointments(doctorAppointments);

            const allPatients = await getPatients();
            const patientIds = new Set(doctorAppointments.map(a => a.patientId));
            setPatients(allPatients.filter(p => patientIds.has(p.id)));

        }
        setLoading(false);
    }
    if(authState.isAuthenticated && authState.userType === 'doctor') {
        fetchData();
    }
  }, [authState, currentDoctorId]);


  useEffect(() => {
    if (currentDoctor) {
      form.reset({
        name: currentDoctor.name,
        specialty: currentDoctor.specialty,
        consultationFee: currentDoctor.consultationFee,
        bio: currentDoctor.bio,
        avatarUrl: currentDoctor.avatarUrl,
      });
      setImagePreview(currentDoctor.avatarUrl || null);
    }
  }, [currentDoctor, form, isEditingProfile]);
  
  const { todaysAppointments, doctorPatients, appointmentStats, weeklyAppointmentsChartData, averageRating } = useMemo(() => {
    const today = startOfDay(new Date());

    const todaysAppts = appointments.filter(a => {
        const apptDate = startOfDay(new Date(a.date));
        return apptDate.getTime() === today.getTime();
    });
        
    const stats = {
      upcoming: appointments.filter(a => a.status === 'Upcoming').length,
      completed: appointments.filter(a => a.status === 'Completed').length,
      cancelled: appointments.filter(a => a.status === 'Cancelled').length,
    };
    
    const weeklyData: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const formattedDate = format(date, 'MMM d');
        weeklyData[formattedDate] = 0;
    }

    appointments.forEach(appt => {
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

    const docRatings = currentDoctor?.ratings || [];
    const avgRating = docRatings.length > 0
        ? docRatings.reduce((acc, r) => acc + r.rating, 0) / docRatings.length
        : 0;

    return { 
        todaysAppointments: todaysAppts, 
        doctorPatients: patients, 
        appointmentStats: stats,
        weeklyAppointmentsChartData: chartData,
        averageRating: {
            avg: avgRating,
            count: docRatings.length
        }
    };
  }, [appointments, currentDoctor, patients]);
  
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

    const updatedUnavailability = [...(currentDoctor.unavailability || [])];
     selectedDates.forEach(date => {
        const dateString = formatISO(startOfDay(date), { representation: 'date' });
        const index = updatedUnavailability.findIndex(u => u.date === dateString);

        const timesToSet = selectedUnavailableTimes.length > 0 ? selectedUnavailableTimes : timeSlots;

        if (index > -1) {
            const existingTimes = updatedUnavailability[index].times;
            const updatedTimes = [...new Set([...existingTimes, ...timesToSet])];
            updatedUnavailability[index] = { date: dateString, times: updatedTimes };
        } else {
            updatedUnavailability.push({ date: dateString, times: timesToSet });
        }
    });
    
    // Here you would call an API to update the doctor's unavailability
    console.log("Updating unavailability:", updatedUnavailability);
    if(currentDoctor) {
        setCurrentDoctor({...currentDoctor, unavailability: updatedUnavailability});
    }

    toast({
        title: "Unavailability Updated",
        description: `Your unavailable slots for the selected dates have been saved.`,
    });
  }

  const onProfileSubmit = (data: DoctorProfileValues) => {
    if (!currentDoctor) return;
    
    const updatedDetails = {
      ...data,
      avatarUrl: imagePreview || data.avatarUrl,
    };
    
    const { success, newDoctorsList } = apiUpdateDoctor(currentDoctor.id, updatedDetails);

    if(success) {
      // Note: In a real app, the list update would come from the backend response/re-fetch.
      // For mock, we are directly setting state.
      const updatedDoctor = newDoctorsList.find(d => d.id === currentDoctorId);
      if(updatedDoctor) setCurrentDoctor(updatedDoctor);
      
      toast({
        title: "Profile Updated",
        description: "Your professional information has been successfully updated.",
      });
      setIsEditingProfile(false);
    } else {
       toast({
        title: "Error",
        description: "Could not update your profile.",
        variant: "destructive"
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      form.setValue('avatarUrl', previewUrl);
    }
  };


  if (loading || authState.loading || !authState.isAuthenticated || authState.userType !== 'doctor') {
    return <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">Loading...</div>;
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      <main className="container p-4 mx-auto md:p-6 lg:p-8">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Doctor Dashboard</h1>
          </div>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, {currentDoctor?.name || 'Doctor'}!</CardTitle>
                    <CardDescription>Manage your patients and appointments.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                     <Card className="bg-secondary/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Overall Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                               <p className="text-3xl font-bold">{averageRating.avg.toFixed(1)}</p>
                               <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
                            </div>
                            <p className="text-muted-foreground">from {averageRating.count} reviews</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                           <Button asChild>
                                <Link href="/chat"><MessageSquare className="mr-2 h-4 w-4" /> Go to Messages</Link>
                           </Button>
                           <Dialog onOpenChange={(isOpen) => !isOpen && setIsEditingProfile(false)}>
                            <DialogTrigger asChild>
                               <Button variant="outline">
                                    <UserCircle className="w-4 h-4 mr-2" /> View My Profile
                               </Button>
                             </DialogTrigger>
                             <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>{isEditingProfile ? "Edit Profile" : "My Profile"}</DialogTitle>
                                    <DialogDescription>{isEditingProfile ? "Update your professional information below." : "Your professional information."}</DialogDescription>
                                </DialogHeader>
                                {currentDoctor && (
                                    isEditingProfile ? (
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4 py-4">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="relative">
                                                    <Avatar className="w-24 h-24">
                                                        <AvatarImage src={imagePreview || ''} alt={currentDoctor.name} />
                                                        <AvatarFallback className="text-3xl">{getInitials(currentDoctor.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <Button type="button" size="icon" className="absolute bottom-0 right-0 rounded-full" onClick={() => fileInputRef.current?.click()}>
                                                        <Camera className="w-4 h-4" />
                                                    </Button>
                                                    <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                                </div>
                                            </div>
                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name="specialty" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Specialty</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                              {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                 <FormField control={form.control} name="consultationFee" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Consultation Fee (₹)</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <FormField control={form.control} name="bio" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Professional Bio</FormLabel>
                                                    <FormControl><Textarea placeholder="Describe your experience..." className="resize-none" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <DialogFooter>
                                                <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                                                <Button type="submit">Save Changes</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                ) : (
                                    <div className="grid gap-4 py-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-24 h-24">
                                              <AvatarImage src={currentDoctor.avatarUrl} alt={currentDoctor.name} />
                                              <AvatarFallback className="text-3xl">{getInitials(currentDoctor.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                            <h3 className="text-lg font-semibold">{currentDoctor.name}</h3>
                                            <p className="text-sm text-muted-foreground">{currentDoctor.specialty}</p>
                                            <p className="text-sm font-medium mt-1">{currentDoctor.consultationFee > 0 ? `₹${currentDoctor.consultationFee.toFixed(2)}` : 'Free Consultation'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="mb-1 font-semibold">Professional Bio</h4>
                                            <p className="text-sm text-muted-foreground">{currentDoctor.bio || 'No bio provided.'}</p>
                                        </div>
                                        <DialogFooter className="sm:justify-start">
                                           <Button onClick={() => setIsEditingProfile(true)}>
                                                <Pencil className="w-4 h-4 mr-2" />
                                                Edit Profile
                                            </Button>
                                        </DialogFooter>
                                    </div>
                                    )
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
              <CardContent className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div>
                      <h4 className="mb-2 font-semibold text-center">Appointments Last 7 Days</h4>
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
                       <h4 className="mb-2 font-semibold text-center">Appointment Status</h4>
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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                                    <TableHead>Type</TableHead>
                                    <TableHead>Fee</TableHead>
                                    <TableHead className="w-[150px]">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {todaysAppointments.length > 0 ? todaysAppointments.map(appt => (
                                  <TableRow key={appt.id}>
                                    <TableCell>{appt.time}</TableCell>
                                    <TableCell>{appt.patientName}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {appt.consultationType === 'Online' ? <Video className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                                            <span>{appt.consultationType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {appt.consultationFee > 0 ? `₹${appt.consultationFee.toFixed(2)}` : 'Free'}
                                    </TableCell>
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
                                  <TableRow><TableCell colSpan={5} className="text-center">No appointments for today.</TableCell></TableRow>
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
                            <CardDescription className="mt-1 text-left">Select dates and times you are unavailable.</CardDescription>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-0">
                        <CardDescription className="mb-4">If no times are selected, you'll be marked as unavailable for the entire day for the chosen dates.</CardDescription>
                        <div className="flex flex-col items-start gap-4 md:flex-row">
                           <Calendar
                              mode="multiple"
                              selected={selectedDates}
                              onSelect={setSelectedDates}
                              className="border rounded-md"
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
                                <p className="mb-3 text-sm text-muted-foreground">Select specific times to mark as unavailable for the chosen dates.</p>
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
                                          <AvatarImage src={patient.avatarUrl} />
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

              <Card>
                  <CardHeader>
                      <CardTitle>Patient Feedback</CardTitle>
                       <CardDescription>Reviews from your patients.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentDoctor && currentDoctor.ratings.length > 0 ? (
                        <div className="space-y-4">
                            {currentDoctor.ratings.map(rating => (
                                <div key={rating.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold">{rating.patientName}</span>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-5 w-5 ${i < rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">"{rating.feedback}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">No feedback received yet.</p>
                    )}
                  </CardContent>
              </Card>
        </div>
      </main>
    </div>
  );
}
