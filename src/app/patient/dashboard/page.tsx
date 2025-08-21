
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInYears, formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { mockAppointments, Appointment, mockPatients, updatePatient, Patient, addRating } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Cake, Phone, User, Pencil, CalendarIcon, Camera, Video, Building, CreditCard, Star, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

const patientProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  dateOfBirth: z.date({ required_error: "Your date of birth is required." }),
  gender: z.string({ required_error: "Please select your gender." }),
  phone: z.string().min(10, "Please enter a valid phone number."),
  avatarUrl: z.string().optional(),
});
type PatientProfileValues = z.infer<typeof patientProfileSchema>;


const feedbackSchema = z.object({
    rating: z.number().min(1, "Rating is required."),
    feedback: z.string().min(10, "Feedback must be at least 10 characters.").max(500, "Feedback must be 500 characters or less."),
});
type FeedbackFormValues = z.infer<typeof feedbackSchema>;


export default function PatientDashboard() {
  const { authState } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const currentPatientId = "pat1";
  
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAppointmentForFeedback, setSelectedAppointmentForFeedback] = useState<Appointment | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [alarmPlayed, setAlarmPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);


  const currentPatient = useMemo(() => patients.find(p => p.id === currentPatientId), [patients, currentPatientId]);
  
  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const userAppointments = mockAppointments.filter(a => a.patientId === currentPatientId);
    const upcoming = userAppointments.filter(a => a.status === 'Upcoming').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = userAppointments.filter(a => a.status !== 'Upcoming').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [currentPatientId]);
  
    useEffect(() => {
    if (upcomingAppointments.length > 0) {
      const nextAppointment = upcomingAppointments[0];
      const appointmentDateTime = new Date(`${nextAppointment.date.slice(0, 10)}T${convertTimeTo24Hour(nextAppointment.time)}`);
      
      if (nextAppointment.id !== localStorage.getItem('lastAlarmAppointmentId')) {
          setAlarmPlayed(false);
      }


      const calculateTimeRemaining = () => {
        const now = new Date();
        const difference = appointmentDateTime.getTime() - now.getTime();

        if (difference <= 0) {
          setTimeRemaining("Your appointment is starting now.");
          clearInterval(interval);
          return;
        }
        
        if (difference < 5 * 60 * 1000 && !alarmPlayed) {
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
            setAlarmPlayed(true);
            localStorage.setItem('lastAlarmAppointmentId', nextAppointment.id);
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      };

      const interval = setInterval(calculateTimeRemaining, 1000);
      calculateTimeRemaining(); 

      return () => clearInterval(interval);
    }
  }, [upcomingAppointments, alarmPlayed]);

  const convertTimeTo24Hour = (time: string) => {
    const [timePart, ampm] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    if (ampm === 'PM' && hours !== '12') {
      hours = String(parseInt(hours, 10) + 12);
    }
    if (ampm === 'AM' && hours === '12') {
      hours = '00';
    }
    return `${hours.padStart(2, '0')}:${minutes}:00`;
  };


  const profileForm = useForm<PatientProfileValues>({
    resolver: zodResolver(patientProfileSchema),
  });
  
  const feedbackForm = useForm<FeedbackFormValues>({
      resolver: zodResolver(feedbackSchema),
      defaultValues: { rating: 0, feedback: '' },
  });

  useEffect(() => {
    if (currentPatient) {
      profileForm.reset({
        name: currentPatient.name,
        email: currentPatient.email,
        phone: currentPatient.phone,
        gender: currentPatient.gender,
        dateOfBirth: new Date(currentPatient.dateOfBirth),
        avatarUrl: currentPatient.avatarUrl,
      });
      setImagePreview(currentPatient.avatarUrl || null);
    }
  }, [currentPatient, profileForm]);


  useEffect(() => {
    if (!authState.loading && (!authState.isAuthenticated || authState.userType !== 'patient')) {
      router.push('/patient/login');
    }
  }, [authState, router]);


  if (authState.loading || !authState.isAuthenticated || authState.userType !== 'patient' || !currentPatient) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">Loading...</div>;
  }

  const renderAppointmentRows = (appointments: Appointment[], isHistory: boolean) => {
      if (appointments.length === 0) {
          return <TableRow><TableCell colSpan={isHistory ? 7: 6} className="text-center">No appointments found.</TableCell></TableRow>;
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
            {isHistory && (
                <TableCell>
                    {appt.status === 'Completed' && !appt.ratingId && (
                       <Dialog onOpenChange={(isOpen) => !isOpen && feedbackForm.reset()}>
                         <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedAppointmentForFeedback(appt)}>
                                Leave Feedback
                            </Button>
                         </DialogTrigger>
                         <DialogContent>
                             <DialogHeader>
                                 <DialogTitle>Leave Feedback for Dr. {selectedAppointmentForFeedback?.doctorName}</DialogTitle>
                             </DialogHeader>
                             <Form {...feedbackForm}>
                                 <form onSubmit={feedbackForm.handleSubmit(onFeedbackSubmit)} className="space-y-4">
                                     <FormField
                                         control={feedbackForm.control}
                                         name="rating"
                                         render={({ field }) => (
                                             <FormItem>
                                                 <FormLabel>Rating</FormLabel>
                                                 <FormControl>
                                                    <StarRatingInput value={field.value} onChange={field.onChange} />
                                                 </FormControl>
                                                 <FormMessage />
                                             </FormItem>
                                         )}
                                     />
                                      <FormField
                                        control={feedbackForm.control}
                                        name="feedback"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Feedback</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Share your experience..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                      />
                                     <DialogFooter>
                                         <Button type="submit">Submit Feedback</Button>
                                     </DialogFooter>
                                 </form>
                             </Form>
                         </DialogContent>
                       </Dialog>
                    )}
                     {appt.ratingId && <span className="text-sm text-muted-foreground italic">Feedback submitted</span>}
                </TableCell>
            )}
          </TableRow>
      ));
  }
  
  const onProfileSubmit = (data: PatientProfileValues) => {
    if (!currentPatient) return;

    const updatedDetails = { 
      ...data, 
      dateOfBirth: data.dateOfBirth.toISOString(),
      avatarUrl: imagePreview || data.avatarUrl,
    };
    
    const { success, newPatientsList } = updatePatient(currentPatient.id, updatedDetails);
    
    if(success) {
      setPatients(newPatientsList);
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

  const onFeedbackSubmit = (data: FeedbackFormValues) => {
      if (!selectedAppointmentForFeedback) return;
      
      addRating({
          appointmentId: selectedAppointmentForFeedback.id,
          doctorId: selectedAppointmentForFeedback.doctorId,
          patientId: currentPatient.id,
          patientName: currentPatient.name,
          rating: data.rating,
          feedback: data.feedback,
      });

      toast({
          title: "Feedback Submitted!",
          description: "Thank you for sharing your experience."
      });
      
      feedbackForm.reset();
      setSelectedAppointmentForFeedback(null);
       // Force re-render to update the table
      router.refresh();
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      profileForm.setValue('avatarUrl', previewUrl);
    }
  };


  const patientAge = differenceInYears(new Date(), new Date(currentPatient.dateOfBirth));
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');


  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      <main className="container p-4 mx-auto md:p-6 lg:p-8">
        <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" preload="auto" />
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-primary">Patient Dashboard</h1>
               <Dialog open={isProfileDialogOpen} onOpenChange={(isOpen) => {
                  setIsProfileDialogOpen(isOpen);
                  if (!isOpen) {
                    profileForm.reset();
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
                     <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 py-4">
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

                        <FormField control={profileForm.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={profileForm.control} name="email" render={({ field }) => (
                          <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                           <FormField control={profileForm.control} name="dateOfBirth" render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Date of Birth</FormLabel>
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={(date) => { if (date) { field.onChange(date); } setIsCalendarOpen(false); }} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={profileForm.control} name="gender" render={({ field }) => (
                              <FormItem className="flex flex-col">
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
                        <FormField control={profileForm.control} name="phone" render={({ field }) => (
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
                           <div className="p-4 space-y-4 rounded-lg bg-secondary">
                               <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
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
                               {timeRemaining && (
                                <div className="p-4 text-center border-t border-primary/20">
                                    <div className="flex items-center justify-center gap-2 text-primary">
                                        <Clock className="w-6 h-6" />
                                        <p className="text-lg font-semibold tracking-widest">{timeRemaining}</p>
                                    </div>
                                </div>
                               )}
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
                                  {renderAppointmentRows(upcomingAppointments, false)}
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
                                      <TableHead>Action</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {renderAppointmentRows(pastAppointments, true)}
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

const StarRatingInput = ({ value, onChange }: { value: number, onChange: (value: number) => void}) => {
    const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);
    return (
        <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(star => (
                <Star
                    key={star}
                    className={cn(
                        "h-6 w-6 cursor-pointer",
                        (hoverValue || value) >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                    )}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHoverValue(star)}
                    onMouseLeave={() => setHoverValue(undefined)}
                />
            ))}
        </div>
    )
}

    