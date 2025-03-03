/**
 * API configuration and utility functions for database operations
 */

// Base API URL - update to match the actual domain where PHP files are hosted
// THIS IS CRITICAL - This URL must be changed to your actual API URL without a trailing slash
export const API_BASE_URL = 'https://sounny.ma';

// Use JSON files as fallback for when the server is unreachable
export const USE_FALLBACK = false;

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
  console.log('Starting reservation creation process...');
  
  try {
    // Always use the real API since fallback is disabled
    const apiUrl = `${API_BASE_URL}${ENDPOINTS.CREATE_RESERVATION}`;
    console.log('Submitting reservation to:', apiUrl);
    console.log('Reservation data:', JSON.stringify(reservationData));
    
    // Create URLSearchParams for testing connectivity
    const testUrl = new URL(apiUrl);
    console.log('API URL is valid:', testUrl.toString());
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(reservationData),
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Server error';
      try {
        const errorData = await response.json();
        console.error('API error:', errorData);
        errorMessage = errorData.message || `Server error: ${response.status}`;
      } catch (jsonError) {
        console.error('Error parsing error response:', jsonError);
        errorMessage = `Server returned ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    return data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    
    // Provide more helpful error message
    let errorMessage = 'Network error. Please try again.';
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      errorMessage = 'Cannot connect to the server. Please check your network connection or contact support.';
    } else if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return { success: false, message: errorMessage };
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
