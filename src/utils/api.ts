/**
 * API configuration and utility functions using Supabase
 */
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://jyppxlopcvcwrlmrsoan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cHB4bG9wY3Zjd3JsbXJzb2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTQzNzMsImV4cCI6MjA1NjY3MDM3M30.4tkr_79mOojlbF4WtX8KEgATQ-ftJMW5plYgMDVYmpI';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types
export interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Canceled' | 'Not Responding';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// API functions
export async function createReservation(reservationData: Omit<Reservation, 'id' | 'status'>): Promise<{ success: boolean; message: string; id?: string }> {
  console.log('Starting reservation creation process with Supabase...');
  console.log('Reservation data:', JSON.stringify(reservationData));
  
  try {
    // Convert the timeSlot property to time_slot for Supabase
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        name: reservationData.name,
        phone: reservationData.phone,
        date: reservationData.date,
        time_slot: reservationData.timeSlot,
        status: 'Pending'
      })
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      return { 
        success: false, 
        message: error.message || 'Error creating reservation' 
      };
    }
    
    console.log('Reservation created successfully:', data);
    return { 
      success: true, 
      message: 'Reservation created successfully',
      id: data?.[0]?.id
    };
  } catch (error) {
    console.error('Error creating reservation:', error);
    
    let errorMessage = 'Network error. Please try again.';
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return { success: false, message: errorMessage };
  }
}

export async function fetchReservations(): Promise<{ success: boolean; data?: Reservation[]; message?: string }> {
  try {
    // Get auth token from localStorage (we'll keep this for now but might change later)
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return { 
        success: false, 
        message: error.message || 'Error fetching reservations' 
      };
    }
    
    // Transform data to match the expected format
    const transformedData = data.map(reservation => ({
      id: reservation.id,
      name: reservation.name,
      phone: reservation.phone,
      date: reservation.date,
      timeSlot: reservation.time_slot,
      status: reservation.status as Reservation['status']
    }));
    
    return { 
      success: true, 
      data: transformedData 
    };
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function updateReservation(
  id: string,
  updates: Partial<Reservation>
): Promise<{ success: boolean; message: string }> {
  try {
    // Get auth token from localStorage (we'll keep this for now but might change later)
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }
    
    // Transform updates to match Supabase column names
    const supabaseUpdates: any = { ...updates };
    if (updates.timeSlot) {
      supabaseUpdates.time_slot = updates.timeSlot;
      delete supabaseUpdates.timeSlot;
    }
    
    const { error } = await supabase
      .from('reservations')
      .update(supabaseUpdates)
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error:', error);
      return { 
        success: false, 
        message: error.message || 'Error updating reservation' 
      };
    }
    
    return { 
      success: true, 
      message: 'Reservation updated successfully' 
    };
  } catch (error) {
    console.error('Error updating reservation:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function loginAdmin(credentials: LoginCredentials): Promise<{ success: boolean; token?: string; message?: string }> {
  // For now, we'll keep this function as-is
  // Later we can implement proper authentication using Supabase Auth
  try {
    // Hardcoded login for demo purposes (replace with Supabase Auth later)
    if (credentials.username === 'admin' && credentials.password === 'password') {
      const fakeToken = 'fake-jwt-token-' + Date.now();
      localStorage.setItem('authToken', fakeToken);
      return { success: true, token: fakeToken };
    }
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}
