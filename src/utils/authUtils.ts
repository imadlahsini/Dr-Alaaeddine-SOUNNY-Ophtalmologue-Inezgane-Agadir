
/**
 * Authentication utility functions
 */

import { supabase } from '../integrations/supabase/client';

// Check if the user is authenticated using both localStorage and sessionStorage
export const isAuthenticated = (): boolean => {
  const localAuth = localStorage.getItem('isAuthenticated') === 'true';
  const sessionAuth = sessionStorage.getItem('isAuthenticated') === 'true';
  
  // Check for session expiry
  const localExpiry = localStorage.getItem('authExpiry');
  const sessionExpiry = sessionStorage.getItem('authExpiry');
  const now = Date.now();
  
  const localExpired = localExpiry ? parseInt(localExpiry) < now : true;
  const sessionExpired = sessionExpiry ? parseInt(sessionExpiry) < now : true;
  
  // Also verify with Supabase session asynchronously
  checkSupabaseSession().catch(err => console.error('Session check error:', err));
  
  // User is authenticated if either storage confirms and isn't expired
  return (localAuth && !localExpired) || (sessionAuth && !sessionExpired);
};

// Verify the Supabase session and update local storage accordingly
export const checkSupabaseSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase session error:', error);
      clearAuthState();
      return false;
    }
    
    if (!data.session) {
      console.log('No active Supabase session found');
      clearAuthState();
      return false;
    }
    
    // Session is valid, update expiry time
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
    localStorage.setItem('authExpiry', expiryTime.toString());
    sessionStorage.setItem('authExpiry', expiryTime.toString());
    
    return true;
  } catch (error) {
    console.error('Error checking Supabase session:', error);
    return false;
  }
};

// Clear authentication state from storage
export const clearAuthState = (): void => {
  localStorage.removeItem('isAuthenticated');
  sessionStorage.removeItem('isAuthenticated');
  localStorage.removeItem('authExpiry');
  sessionStorage.removeItem('authExpiry');
};

// Set authentication state in storage
export const setAuthState = (): void => {
  const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
  
  localStorage.setItem('isAuthenticated', 'true');
  sessionStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('authExpiry', expiryTime.toString());
  sessionStorage.setItem('authExpiry', expiryTime.toString());
};
