
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
  notes?: string;
};

export type Doctor = {
    id: string;
    name: string;
    specialty: string;
    unavailability: { date: string; times: string[] }[];
};

export type Patient = {
    id: string;
    name: string;
    email: string;
};

export type ChatParticipant = {
    id: string;
    name: string;
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


export const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"
];

export let mockDoctors: Doctor[] = [
  { id: "doc1", name: "Dr. Evelyn Reed", specialty: "Cardiology", unavailability: [] },
  { id: "doc2", name: "Dr. Marcus Thorne", specialty: "Neurology", unavailability: [] },
  { id: "doc3", name: "Dr. Lena Petrova", specialty: "Pediatrics", unavailability: [] },
  { id: "doc4", name: "Dr. Kenji Tanaka", specialty: "Orthopedics", unavailability: [] },
  { id: "doc5", name: "Dr. Aisha Khan", specialty: "Ophthalmology", unavailability: [] },
  { id: "doc6", name: "Dr. Samuel Green", specialty: "General Practice", unavailability: [] },
  { id: "doc7", name: "Dr. Clara Oswald", specialty: "Cardiology", unavailability: [] },
  { id: "doc8", name: "Dr. Ben Carter", specialty: "Neurology", unavailability: [] },
];

export const mockPatients: Patient[] = [
    { id: "pat1", name: "John Doe", email: "john.doe@example.com" },
    { id: "pat2", name: "Jane Smith", email: "jane.smith@example.com" },
    { id: "pat3", name: "Peter Jones", email: "peter.jones@example.com" },
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
    notes: "Follow-up in 6 months."
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
    notes: "Prescribed new medication."
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

export let mockConversations: ChatConversation[] = [
    {
        id: 'convo1',
        participants: [
            { id: 'pat1', name: 'John Doe', type: 'patient', online: true },
            { id: 'doc1', name: 'Dr. Evelyn Reed', type: 'doctor', online: true }
        ],
        lastMessage: 'Thank you, Doctor!',
        lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        unreadCount: 0,
    },
    {
        id: 'convo2',
        participants: [
            { id: 'pat1', name: 'John Doe', type: 'patient', online: true },
            { id: 'doc2', name: 'Dr. Marcus Thorne', type: 'doctor', online: false }
        ],
        lastMessage: 'I have a follow-up question about my prescription.',
        lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        unreadCount: 2,
    },
    {
        id: 'convo3',
        participants: [
            { id: 'pat2', name: 'Jane Smith', type: 'patient', online: false },
            { id: 'doc1', name: 'Dr. Evelyn Reed', type: 'doctor', online: true }
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
