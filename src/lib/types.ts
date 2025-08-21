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
    id: string;
    name: string;
    quote: string;
    avatar: string;
};

export type Notification = {
    id: string;
    userId: string;
    userType: 'patient' | 'doctor';
    message: string;
    link: string;
    timestamp: string;
    read: boolean;
}
