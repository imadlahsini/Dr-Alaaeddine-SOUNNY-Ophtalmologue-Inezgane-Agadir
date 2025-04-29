
/**
 * API configuration and utility functions using Supabase
 */
import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using our standard client
import { supabase } from '../integrations/supabase/client';

// Re-export supabase for backward compatibility
export { supabase };

// Types
export interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Canceled' | 'Not Responding';
  language?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// API functions
export async function createReservation(reservationData: Omit<Reservation, 'id' | 'status'>): Promise<{ success: boolean; message: string; id?: string }> {
  console.log('Starting reservation creation process with Supabase...');
  console.log('Reservation data:', JSON.stringify(reservationData));
  
  try {
    // 1. First save to Supabase
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
      
    console.log('Reservation created successfully in Supabase:', data);
      
    // 2. Then save to Google Sheets
    try {
      //URL of your Google Apps Script deployment
      const googleScriptUrl = '';
          
      // Revenir au mode 'no-cors' pour éviter les erreurs CORS
      await fetch(googleScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: reservationData.name,
          phone: reservationData.phone,
          date: reservationData.date,
          timeSlot: reservationData.timeSlot,
          language:reservationData.language
        }),
        mode: 'no-cors'  // Mode 'no-cors' pour contourner le problème CORS
      });
      
      // Avec mode: 'no-cors', on ne peut pas lire la réponse,
      // donc on suppose que ça a fonctionné si aucune exception n'est levée
      console.log('Google Sheets request sent (response not readable in no-cors mode)');
    } catch (googleError) {
      console.warn('Google Sheets storage error:', googleError);
      // Continue because error with Google Sheets is not critical
    }
      
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

export async function updateReservationStatus(id: string, status: Reservation['status']): Promise<{ success: boolean; message: string }> {
  console.log(`Updating reservation ${id} status to ${status}`);
  
  try {
    const { error } = await supabase
      .from('reservations')
      .update({ 
        status: status,
        manual_update: true // Mark this as a manual update by admin
      })
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error:', error);
      return { 
        success: false, 
        message: error.message || 'Error updating reservation status' 
      };
    }
    
    return { 
      success: true, 
      message: 'Reservation status updated successfully' 
    };
  } catch (error) {
    console.error('Error updating reservation status:', error);
    
    let errorMessage = 'Network error. Please try again.';
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return { success: false, message: errorMessage };
  }
}

export async function fetchReservations(): Promise<{ success: boolean; data?: Reservation[]; message?: string }> {
  try {
    console.log('Fetching reservations from Supabase...');
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
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
    
    console.log('Raw data from Supabase:', data);
    
    // Transform data to match the expected format
    const transformedData = data.map(reservation => ({
      id: reservation.id,
      name: reservation.name,
      phone: reservation.phone,
      date: reservation.date,
      timeSlot: reservation.time_slot,
      status: reservation.status as Reservation['status']
      
    }));
    
    console.log('Transformed reservation data:', transformedData);
    return { 
      success: true, 
      data: transformedData 
    };
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function loginAdmin(credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    
    if (error) {
      console.error('Supabase auth error:', error);
      return { 
        success: false, 
        message: error.message || 'Invalid credentials' 
      };
    }
    
    if (!data.session) {
      return { success: false, message: 'No session created' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function logoutAdmin(): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error during logout:', error);
      return { success: false, message: error.message };
    }
    
    // Clear both localStorage and sessionStorage for better mobile support
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authExpiry');
    sessionStorage.removeItem('authExpiry');
    
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function getSession() {
  return supabase.auth.getSession();
}

// Function to transform a Supabase record to a Reservation object
export function transformReservationRecord(record: any): Reservation | null {
  if (!record || typeof record !== 'object') {
    console.error('Invalid record received:', record);
    return null;
  }
  
  try {
    return {
      id: record.id,
      name: record.name,
      phone: record.phone,
      date: record.date,
      timeSlot: record.time_slot,
      status: record.status,
      language:record.language
    };
  } catch (error) {
    console.error('Error transforming reservation record:', error, record);
    return null;
  }
}
