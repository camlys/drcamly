

"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInYears } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import Image from "next/image";
import { mockAppointments, Appointment, mockPatients, updatePatient, Patient } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Cake, Phone, User, Pencil, CalendarIcon, Camera, Video, Building, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const patientProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  dateOfBirth: z.date({ required_error: "Your date of birth is required." }),
  gender: z.string({ required_error: "Please select your gender." }),
  phone: z.string().min(10, "Please enter a valid phone number."),
  avatarUrl: z.string().optional(),
});

type PatientProfileValues = z.infer<typeof patientProfileSchema>;


export default function PatientDashboard() {
  const { authState } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const currentPatientId = "pat1";
  
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPatient = useMemo(() => patients.find(p => p.id === currentPatientId), [patients, currentPatientId]);
  
  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const userAppointments = mockAppointments.filter(a => a.patientId === currentPatientId);
    const upcoming = userAppointments.filter(a => a.status === 'Upcoming').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = userAppointments.filter(a => a.status !== 'Upcoming').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [currentPatientId]);

  const form = useForm<PatientProfileValues>({
    resolver: zodResolver(patientProfileSchema),
  });

  useEffect(() => {
    if (currentPatient) {
      form.reset({
        name: currentPatient.name,
        email: currentPatient.email,
        phone: currentPatient.phone,
        gender: currentPatient.gender,
        dateOfBirth: new Date(currentPatient.dateOfBirth),
        avatarUrl: currentPatient.avatarUrl,
      });
      setImagePreview(currentPatient.avatarUrl || null);
    }
  }, [currentPatient, form]);


  useEffect(() => {
    if (!authState.loading && (!authState.isAuthenticated || authState.userType !== 'patient')) {
      router.push('/patient/login');
    }
  }, [authState, router]);


  if (authState.loading || !authState.isAuthenticated || authState.userType !== 'patient' || !currentPatient) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">Loading...</div>;
  }

  const renderAppointmentRows = (appointments: Appointment[]) => {
      if (appointments.length === 0) {
          return <TableRow><TableCell colSpan={6} className="text-center">No appointments found.</TableCell></TableRow>;
      }
      return appointments.map(appt => (
          <TableRow key={appt.id}>
            <TableCell>{format(new Date(appt.date), "PPP")} at {appt.time}</TableCell>
            <TableCell>{appt.doctorName}</TableCell>
            <TableCell>{appt.department}</TableCell>
            <TableCell>
                 <div className="flex items-center gap-2">
                    {appt.consultationType === 'Online' ? <Video className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                    <span>{appt.consultationType}</span>
                </div>
            </TableCell>
            <TableCell className="font-medium">
              {appt.consultationFee > 0 ? `₹${appt.consultationFee.toFixed(2)}` : 'Free'}
            </TableCell>
            <TableCell><Badge variant={appt.status === 'Completed' ? 'secondary' : appt.status === 'Cancelled' ? 'destructive' : 'default'}>{appt.status}</Badge></TableCell>
          </TableRow>
      ));
  }
  
  const onProfileSubmit = (data: PatientProfileValues) => {
    const updatedDetails = { 
      ...data, 
      dateOfBirth: data.dateOfBirth.toISOString(),
      avatarUrl: imagePreview || data.avatarUrl,
    };
    
    const updated = updatePatient(currentPatient.id, updatedDetails);
    
    if(updated) {
      setPatients(prev => prev.map(p => p.id === currentPatient.id ? updated : p));
      toast({
        title: "Profile Updated",
        description: "Your personal information has been successfully updated.",
      });
      setIsProfileDialogOpen(false);
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


  const patientAge = differenceInYears(new Date(), new Date(currentPatient.dateOfBirth));
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');


  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      <main className="container p-4 mx-auto md:p-6 lg:p-8">
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-primary">Patient Dashboard</h1>
               <Dialog open={isProfileDialogOpen} onOpenChange={(isOpen) => {
                  setIsProfileDialogOpen(isOpen);
                  if (!isOpen) {
                    form.reset();
                    setImagePreview(currentPatient.avatarUrl || null);
                  }
               }}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <User className="w-4 h-4 mr-2" /> My Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                     <Form {...form}>
                      <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4 py-4">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={imagePreview || ''} alt={currentPatient.name} />
                                    <AvatarFallback className="text-3xl">{getInitials(currentPatient.name)}</AvatarFallback>
                                </Avatar>
                                <Button type="button" size="icon" className="absolute bottom-0 right-0 rounded-full" onClick={() => fileInputRef.current?.click()}>
                                    <Camera className="w-4 h-4" />
                                </Button>
                                <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                            </div>
                        </div>

                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                           <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Date of Birth</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="gender" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                          <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={currentPatient.avatarUrl} alt={currentPatient.name} />
                            <AvatarFallback>{getInitials(currentPatient.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>Welcome, {currentPatient.name}!</CardTitle>
                            <CardDescription>This is your personal health dashboard.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                    <div className="flex items-center gap-2">
                        <Cake className="w-5 h-5 text-primary" />
                        <span>{patientAge} years old ({format(new Date(currentPatient.dateOfBirth), "MMMM d, yyyy")})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-primary" />
                        <span>{currentPatient.phone}</span>
                    </div>
                     <div className="flex items-center gap-2">
                       <span className="font-semibold text-primary">Gender:</span>
                       <span>{currentPatient.gender}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Next Appointment</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {upcomingAppointments.length > 0 ? (
                           <div className="flex flex-col items-start justify-between p-4 rounded-lg bg-secondary md:flex-row md:items-center">
                               <div>
                                  <p className="text-xl font-bold">{upcomingAppointments[0].doctorName}</p>
                                  <p className="text-muted-foreground">{upcomingAppointments[0].department}</p>
                                  <p className="mt-2 font-semibold">{format(new Date(upcomingAppointments[0].date), "PPPP")} at {upcomingAppointments[0].time}</p>
                                   <div className="flex items-center gap-2 mt-2">
                                        {upcomingAppointments[0].consultationType === 'Online' ? <Video className="h-5 w-5 text-primary" /> : <Building className="h-5 w-5 text-primary" />}
                                        <span className="font-medium">{upcomingAppointments[0].consultationType}</span>
                                    </div>
                               </div>
                                <Button asChild className="mt-4 md:mt-0">
                                  <Link href={`/booking?rescheduleId=${upcomingAppointments[0].id}`}>Reschedule</Link>
                                </Button>
                           </div>
                       ) : (
                           <div className="p-4 text-center rounded-lg bg-secondary">
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
                       <MessageSquare className="w-12 h-12 mb-4 text-muted-foreground" />
                       <p className="mb-4 text-muted-foreground">You have 2 unread messages.</p>
                       <Button asChild>
                          <Link href="/chat">View Messages</Link>
                       </Button>
                    </CardContent>
                </Card>
            </div>
            
            <Tabs defaultValue="upcoming">
              <TabsList className="grid w-full grid-cols-1 mx-auto md:w-1/2 md:grid-cols-2">
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
                        <div className="overflow-x-auto">
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Date & Time</TableHead>
                                      <TableHead>Doctor</TableHead>
                                      <TableHead>Department</TableHead>
                                      <TableHead>Type</TableHead>
                                      <TableHead>Fee</TableHead>
                                      <TableHead>Status</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {renderAppointmentRows(upcomingAppointments)}
                              </TableBody>
                          </Table>
                        </div>
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
                       <div className="overflow-x-auto">
                         <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Date & Time</TableHead>
                                      <TableHead>Doctor</TableHead>
                                      <TableHead>Department</TableHead>
                                      <TableHead>Type</TableHead>
                                      <TableHead>Fee</TableHead>
                                      <TableHead>Status</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {renderAppointmentRows(pastAppointments)}
                              </TableBody>
                          </Table>
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        </div>
      </main>
    </div>
  );
}
