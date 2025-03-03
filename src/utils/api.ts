
/**
 * API configuration and utility functions for database operations
 */

// Base API URL - update to match the actual domain where PHP files are hosted
// Remove the trailing slash if it exists
export const API_BASE_URL = 'https://sounny.ma';

// API endpoints
export const ENDPOINTS = {
  CREATE_RESERVATION: '/api/reservations/create.php',
  LIST_RESERVATIONS: '/api/reservations/list.php',
  UPDATE_RESERVATION: '/api/reservations/update.php',
  AUTH_LOGIN: '/api/auth/login.php',
};

// Types
export interface Reservation {
  id: number;
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
export async function createReservation(reservationData: Omit<Reservation, 'id' | 'status'>): Promise<{ success: boolean; message: string; id?: number }> {
  try {
    console.log('Submitting reservation to:', `${API_BASE_URL}${ENDPOINTS.CREATE_RESERVATION}`);
    console.log('Reservation data:', JSON.stringify(reservationData));
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE_RESERVATION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API error:', errorData || response.statusText);
      return { 
        success: false, 
        message: errorData?.message || `Server error: ${response.status}` 
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating reservation:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function fetchReservations(): Promise<{ success: boolean; data?: Reservation[]; message?: string }> {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LIST_RESERVATIONS}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function updateReservation(
  id: number, 
  updates: Partial<Reservation>
): Promise<{ success: boolean; message: string }> {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.UPDATE_RESERVATION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...updates }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error updating reservation:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function loginAdmin(credentials: LoginCredentials): Promise<{ success: boolean; token?: string; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH_LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}
