

export type Appointment = {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  department: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  consultationType: "Online" | "In-Person";
  consultationFee: number;
  notes?: string;
  ratingId?: string;
};

export type Rating = {
    id: string;
    appointmentId: string;
    doctorId: string;
    patientId: string;
    rating: number;
    feedback: string;
    patientName: string;
}

export type Doctor = {
    id: string;
    name: string;
    specialty: string;
    avatarUrl?: string;
    bio?: string;
    consultationFee: number;
    unavailability: { date: string; times: string[] }[];
    ratings: Rating[];
};

export type Patient = {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
};

export type ChatParticipant = {
    id: string;
    name: string;
    avatarUrl?: string;
    type: 'doctor' | 'patient';
    online: boolean;
}

export type ChatMessage = {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    timestamp: string;
    read: boolean;
}

export type ChatConversation = {
    id: string;
    participants: ChatParticipant[];
    lastMessage: string;
    lastMessageTimestamp: string;
    unreadCount: number;
}

export type Testimonial = {
    name: string;
    quote: string;
    avatar: string;
};


export const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"
];

let mockRatings: Rating[] = [
    { id: 'rating1', appointmentId: 'appt2', doctorId: 'doc2', patientId: 'pat1', rating: 5, feedback: 'Dr. Thorne was very thorough and explained everything clearly.', patientName: 'John Doe' },
    { id: 'rating2', appointmentId: 'appt6', doctorId: 'doc1', patientId: 'pat1', rating: 4, feedback: 'Good experience, but the wait time was a bit long.', patientName: 'John Doe' }
];

export let mockDoctors: Doctor[] = [
  { id: "doc1", name: "Dr. Evelyn Reed", specialty: "Cardiology", consultationFee: 150, bio: "Dr. Reed is a board-certified cardiologist with over 15 years of experience. She is passionate about preventative care and patient education.", unavailability: [], avatarUrl: "https://i.pravatar.cc/150?u=doc1", ratings: mockRatings.filter(r => r.doctorId === 'doc1') },
  { id: "doc2", name: "Dr. Marcus Thorne", specialty: "Neurology", consultationFee: 200, unavailability: [], avatarUrl: "https://i.pravatar.cc/150?u=doc2", ratings: mockRatings.filter(r => r.doctorId === 'doc2') },
  { id: "doc3", name: "Dr. Lena Petrova", specialty: "Pediatrics", consultationFee: 120, unavailability: [], avatarUrl: "https://i.pravatar.cc/150?u=doc3", ratings: [] },
  { id: "doc4", name: "Dr. Kenji Tanaka", specialty: "Orthopedics", consultationFee: 180, unavailability: [], avatarUrl: "https://i.pravatar.cc/150?u=doc4", ratings: [] },
  { id: "doc5", name: "Dr. Aisha Khan", specialty: "Ophthalmology", consultationFee: 160, unavailability: [], avatarUrl: "https://i.pravatar.cc/150?u=doc5", ratings: [] },
  { id: "doc6", name: "Dr. Samuel Green", specialty: "General Practice", consultationFee: 0, unavailability: [], avatarUrl: "https://i.pravatar.cc/150?u=doc6", ratings: [] },
  { id: "doc7", name: "Dr. Clara Oswald", specialty: "Cardiology", consultationFee: 150, unavailability: [], avatarUrl: "https://i.pravatar.cc/150?u=doc7", ratings: [] },
  { id: "doc8", name: "Dr. Ben Carter", specialty: "Neurology", consultationFee: 200, unavailability: [], avatarUrl: "https://i.pravatar.cc/150?u=doc8", ratings: [] },
];

export let mockPatients: Patient[] = [
    { id: "pat1", name: "John Doe", email: "john.doe@example.com", dateOfBirth: "1985-05-20", gender: "Male", phone: "(123) 456-7890", avatarUrl: "https://i.pravatar.cc/150?u=pat1" },
    { id: "pat2", name: "Jane Smith", email: "jane.smith@example.com", dateOfBirth: "1992-09-15", gender: "Female", phone: "(234) 567-8901", avatarUrl: "https://i.pravatar.cc/150?u=pat2" },
    { id: "pat3", name: "Peter Jones", email: "peter.jones@example.com", dateOfBirth: "1978-11-30", gender: "Male", phone: "(345) 678-9012", avatarUrl: "https://i.pravatar.cc/150?u=pat3" },
];


export let mockAppointments: Appointment[] = [
  {
    id: "appt1",
    patientId: "pat1",
    patientName: "John Doe",
    doctorId: "doc1",
    doctorName: "Dr. Evelyn Reed",
    department: "Cardiology",
    date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    time: "10:00 AM",
    status: "Upcoming",
    consultationType: "In-Person",
    consultationFee: 150,
  },
  {
    id: "appt2",
    patientId: "pat1",
    patientName: "John Doe",
    doctorId: "doc2",
    doctorName: "Dr. Marcus Thorne",
    department: "Neurology",
    date: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
    time: "02:30 PM",
    status: "Completed",
    notes: "Follow-up in 6 months.",
    consultationType: "In-Person",
    consultationFee: 200,
    ratingId: 'rating1',
  },
  {
    id: "appt3",
    patientId: "pat2",
    patientName: "Jane Smith",
    doctorId: "doc1",
    doctorName: "Dr. Evelyn Reed",
    department: "Cardiology",
    date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    time: "11:00 AM",
    status: "Upcoming",
    consultationType: "Online",
    consultationFee: 150,
  },
  {
    id: "appt4",
    patientId: "pat3",
    patientName: "Peter Jones",
    doctorId: "doc3",
    doctorName: "Dr. Lena Petrova",
    department: "Pediatrics",
    date: new Date().toISOString(),
    time: "09:00 AM",
    status: "Upcoming",
    consultationType: "In-Person",
    consultationFee: 120,
  },
  {
    id: "appt5",
    patientId: "pat2",
    patientName: "Jane Smith",
    doctorId: "doc3",
    doctorName: "Dr. Lena Petrova",
    department: "Pediatrics",
    date: new Date().toISOString(),
    time: "03:00 PM",
    status: "Upcoming",
    consultationType: "Online",
    consultationFee: 120,
  },
  {
    id: "appt6",
    patientId: "pat1",
    patientName: "John Doe",
    doctorId: "doc1",
    doctorName: "Dr. Evelyn Reed",
    department: "Cardiology",
    date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    time: "09:00 AM",
    status: "Completed",
    notes: "Prescribed new medication.",
    consultationType: "In-Person",
    consultationFee: 150,
    ratingId: 'rating2',
  },
];

export let mockTestimonials: Testimonial[] = [
  {
    name: "Sarah L.",
    quote: "The care I received at Dr.Camly was exceptional. The doctors and nurses were incredibly attentive and made me feel comfortable throughout my stay. I can't thank them enough.",
    avatar: "https://placehold.co/80x80.png"
  },
  {
    name: "Michael B.",
    quote: "Booking an appointment online was so easy and convenient. The staff was professional and the facilities are top-notch. Highly recommend Dr.Camly.",
    avatar: "https://placehold.co/80x80.png"
  },
  {
    name: "Jessica P.",
    quote: "Dr. Reed is a fantastic cardiologist. She took the time to explain everything to me and answered all my questions. I feel like I'm in great hands at Dr.Camly.",
    avatar: "https://placehold.co/80x80.png"
  },
];

// Function to add a new appointment
export const addAppointment = (appointment: Omit<Appointment, 'id' | 'status'>) => {
  const newAppointment: Appointment = {
    ...appointment,
    id: `appt${mockAppointments.length + 1}`,
    status: 'Upcoming',
  };
  mockAppointments.push(newAppointment);
  return newAppointment;
};

// Function to update an existing appointment
export const updateAppointment = (appointmentId: string, updatedDetails: Omit<Appointment, 'id' | 'status'>) => {
    const appointmentIndex = mockAppointments.findIndex(a => a.id === appointmentId);
    if(appointmentIndex === -1) return null;

    const updatedAppointment = { ...mockAppointments[appointmentIndex], ...updatedDetails };
    mockAppointments[appointmentIndex] = updatedAppointment;
    return updatedAppointment;
}

// Function to update a patient's details
export const updatePatient = (patientId: string, updatedDetails: Partial<Omit<Patient, 'id'>>) => {
    const patientIndex = mockPatients.findIndex(p => p.id === patientId);
    if(patientIndex === -1) return null;

    const updatedPatient = { ...mockPatients[patientIndex], ...updatedDetails };
    mockPatients[patientIndex] = updatedPatient;
    return updatedPatient;
}

// Function to update a doctor's details
export const updateDoctor = (doctorId: string, updatedDetails: Partial<Omit<Doctor, 'id' | 'unavailability' | 'ratings'>>) => {
    const doctorIndex = mockDoctors.findIndex(d => d.id === doctorId);
    if(doctorIndex === -1) return null;

    const updatedDoctor = { ...mockDoctors[doctorIndex], ...updatedDetails };
    mockDoctors[doctorIndex] = updatedDoctor;
    return updatedDoctor;
}

export const addRating = (ratingData: Omit<Rating, 'id'>) => {
    const newRating: Rating = {
        ...ratingData,
        id: `rating${mockRatings.length + 1}`,
    };
    mockRatings.push(newRating);

    const doctorIndex = mockDoctors.findIndex(d => d.id === ratingData.doctorId);
    if (doctorIndex !== -1) {
        mockDoctors[doctorIndex].ratings.push(newRating);
    }

    const appointmentIndex = mockAppointments.findIndex(a => a.id === ratingData.appointmentId);
    if (appointmentIndex !== -1) {
        mockAppointments[appointmentIndex].ratingId = newRating.id;
    }
    
    return newRating;
}

export const addTestimonial = (testimonialData: Omit<Testimonial, 'avatar'>) => {
    const newTestimonial: Testimonial = {
        ...testimonialData,
        avatar: `https://placehold.co/80x80.png?text=${testimonialData.name.split(' ').map(n=>n[0]).join('')}`
    }
    mockTestimonials.push(newTestimonial);
    return newTestimonial;
}


export let mockConversations: ChatConversation[] = [
    {
        id: 'convo1',
        participants: [
            { id: 'pat1', name: 'John Doe', type: 'patient', online: true, avatarUrl: "https://i.pravatar.cc/150?u=pat1" },
            { id: 'doc1', name: 'Dr. Evelyn Reed', type: 'doctor', online: true, avatarUrl: "https://i.pravatar.cc/150?u=doc1" }
        ],
        lastMessage: 'Thank you, Doctor!',
        lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        unreadCount: 0,
    },
    {
        id: 'convo2',
        participants: [
            { id: 'pat1', name: 'John Doe', type: 'patient', online: true, avatarUrl: "https://i.pravatar.cc/150?u=pat1" },
            { id: 'doc2', name: 'Dr. Marcus Thorne', type: 'doctor', online: false, avatarUrl: "https://i.pravatar.cc/150?u=doc2" }
        ],
        lastMessage: 'I have a follow-up question about my prescription.',
        lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        unreadCount: 2,
    },
    {
        id: 'convo3',
        participants: [
            { id: 'pat2', name: 'Jane Smith', type: 'patient', online: false, avatarUrl: "https://i.pravatar.cc/150?u=pat2" },
            { id: 'doc1', name: 'Dr. Evelyn Reed', type: 'doctor', online: true, avatarUrl: "https://i.pravatar.cc/150?u=doc1" }
        ],
        lastMessage: 'See you next week.',
        lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        unreadCount: 0,
    }
];

export let mockMessages: ChatMessage[] = [
    { id: 'msg1', conversationId: 'convo1', senderId: 'doc1', text: 'Your test results are back and everything looks normal.', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), read: true },
    { id: 'msg2', conversationId: 'convo1', senderId: 'pat1', text: 'That is great news!', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), read: true },
    { id: 'msg3', conversationId: 'convo1', senderId: 'pat1', text: 'Thank you, Doctor!', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false },
    { id: 'msg4', conversationId: 'convo2', senderId: 'doc2', text: 'Hello, how can I help you?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), read: true },
    { id: 'msg5', conversationId: 'convo2', senderId: 'pat1', text: 'I have a follow-up question about my prescription.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: false }
];
