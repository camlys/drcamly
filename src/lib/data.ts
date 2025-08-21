import { getSupabase } from './supabaseClient';
import { Appointment, Doctor, Patient, Rating, Testimonial, ChatConversation, ChatMessage, Notification } from '@/lib/types';
import { PostgrestError } from '@supabase/supabase-js';

export const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"
];

// Generic fetch function
async function fetchData<T>(table: string, columns: string = '*', filter?: any): Promise<{ data: T[] | null, error: PostgrestError | null }> {
    const supabase = getSupabase();
    let query = supabase.from(table).select(columns);
    if (filter) {
        query = query.match(filter);
    }
    return await query;
}

// Doctors
export const getDoctors = async (): Promise<Doctor[]> => {
    const { data, error } = await fetchData<Doctor>('doctors', '*, ratings(*)');
    if (error) {
        console.error('Error fetching doctors:', error);
        return [];
    }
    return data || [];
};
export const getDoctorById = async (id: string): Promise<Doctor | null> => {
    const { data, error } = await fetchData<Doctor>('doctors', '*, ratings(*)', { id });
     if (error || !data || data.length === 0) {
        console.error('Error fetching doctor:', error);
        return null;
    }
    return data[0];
}
export const updateDoctor = async (id: string, updates: Partial<Doctor>) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('doctors').update(updates).eq('id', id).select().single();
    if(error) console.error("Error updating doctor", error);
    return { data, error };
}


// Patients
export const getPatients = async (): Promise<Patient[]> => {
    const { data, error } = await fetchData<Patient>('patients');
    if (error) return [];
    return data || [];
}
export const getPatientById = async (id: string): Promise<Patient | null> => {
    const { data, error } = await fetchData<Patient>('patients', '*', { id });
     if (error || !data || data.length === 0) return null;
    return data[0];
}
export const updatePatient = async (id: string, updates: Partial<Patient>) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('patients').update(updates).eq('id', id).select().single();
     if(error) console.error("Error updating patient", error);
    return { data, error };
}

// Appointments
export const getAppointments = async (): Promise<Appointment[]> => {
    const { data, error } = await fetchData<Appointment>('appointments');
    if (error) return [];
    return data || [];
}

export const getAppointmentsByFilter = async (filter: any): Promise<Appointment[]> => {
    const { data, error } = await fetchData<Appointment>('appointments', '*', filter);
    if (error) {
        console.error('Error fetching appointments by filter:', error);
        return [];
    }
    return data || [];
};

export const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('appointments').insert({ ...appointmentData, status: 'Upcoming' }).select().single();
    if (error) console.error('Error adding appointment:', error);
    return { data, error };
}

export const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select().single();
    if(error) console.error("Error updating appointment", error);
    return { data, error };
}


// Ratings
export const addRating = async (ratingData: Omit<Rating, 'id'>) => {
    const supabase = getSupabase();
    // 1. Insert the new rating
    const { data: newRating, error: ratingError } = await supabase
        .from('ratings')
        .insert(ratingData)
        .select()
        .single();

    if (ratingError) {
        console.error('Error adding rating:', ratingError);
        return { data: null, error: ratingError };
    }

    if (!newRating) {
        return { data: null, error: { message: 'Failed to create rating', details: '', hint: '', code: '' } };
    }

    // 2. Update the corresponding appointment with the new ratingId
    const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ ratingId: newRating.id })
        .eq('id', ratingData.appointmentId);

    if (appointmentError) {
        console.error('Error updating appointment with ratingId:', appointmentError);
        // Optional: decide if you want to roll back the rating insertion
    }

    return { data: newRating, error: null };
};

// Testimonials
export const getTestimonials = async (): Promise<Testimonial[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('testimonials').select('*');
    if (error) {
        console.error("Error fetching testimonials", error);
        return [];
    }
    return data || [];
}

export const addTestimonial = async (testimonialData: Omit<Testimonial, 'id' | 'avatar'>) => {
    const supabase = getSupabase();
     const newTestimonial = {
        ...testimonialData,
        avatar: `https://placehold.co/80x80.png?text=${testimonialData.name.split(' ').map(n=>n[0]).join('')}`
    }
    const { data, error } = await supabase.from('testimonials').insert(newTestimonial).select().single();
    if(error) console.error("Error adding testimonial", error);
    return { data, error };
}

// Chat
export const getConversations = async (userId: string): Promise<ChatConversation[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('get_user_conversations', { p_user_id: userId });
     if (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }
    return data || [];
}

export const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversationId', conversationId)
        .order('timestamp', { ascending: true });
     if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
    return data || [];
}

export const addMessage = async (messageData: Omit<ChatMessage, 'id' | 'read'>) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('messages')
        .insert({ ...messageData, read: false })
        .select()
        .single();
    
    if (error) {
        console.error('Error sending message:', error);
    }
    return { data, error };
}

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
    const supabase = getSupabase();
     const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversationId', conversationId)
        .neq('senderId', userId);
    
    if (error) {
        console.error('Error marking messages as read:', error);
    }
}

// Notifications
export const getNotifications = async(userId: string): Promise<Notification[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', userId)
        .order('timestamp', { ascending: false });

    if(error) {
        console.error('Error fetching notifications', error);
        return [];
    }
    return data || [];
}

export const markNotificationsAsRead = async (userId: string) => {
    const supabase = getSupabase();
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('userId', userId)
        .eq('read', false);
    
    if(error) {
        console.error('Error marking notifications as read', error);
    }
}
