
/**
 * API configuration and utility functions for database operations
 */

// Base API URL - replace with your actual domain where PHP files will be hosted
export const API_BASE_URL = 'https://sounny.ma/api';

// API endpoints
export const ENDPOINTS = {
  CREATE_RESERVATION: '/reservations/create.php',
  LIST_RESERVATIONS: '/reservations/list.php',
  UPDATE_RESERVATION: '/reservations/update.php',
  AUTH_LOGIN: '/auth/login.php',
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
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE_RESERVATION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });
    
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
