
/**
 * Authentication utility functions
 */

import { supabase } from '../integrations/supabase/client';

// Check if the user is authenticated using both localStorage and sessionStorage
export const isAuthenticated = (): boolean => {
  try {
    console.log("Checking authentication status...");
    
    // Try to access localStorage - this might fail on some mobile browsers
    let localAuth = false;
    let sessionAuth = false;
    let localExpiry = null;
    let sessionExpiry = null;
    
    try {
      localAuth = localStorage.getItem('isAuthenticated') === 'true';
      localExpiry = localStorage.getItem('authExpiry');
    } catch (storageError) {
      console.warn("Could not access localStorage:", storageError);
    }
    
    try {
      sessionAuth = sessionStorage.getItem('isAuthenticated') === 'true';
      sessionExpiry = sessionStorage.getItem('authExpiry');
    } catch (storageError) {
      console.warn("Could not access sessionStorage:", storageError);
    }
    
    // Check for session expiry
    const now = Date.now();
    
    const localExpired = localExpiry ? parseInt(localExpiry) < now : true;
    const sessionExpired = sessionExpiry ? parseInt(sessionExpiry) < now : true;
    
    const isAuth = (localAuth && !localExpired) || (sessionAuth && !sessionExpired);
    console.log(`Auth status: ${isAuth ? 'Authenticated' : 'Not authenticated'}`);
    
    // Also verify with Supabase session asynchronously
    if (isAuth) {
      checkSupabaseSession().catch(err => console.error('Session check error:', err));
    }
    
    return isAuth;
  } catch (error) {
    // Better error handling for mobile browsers
    console.error('Error checking authentication status:', error);
    // Return false for safety but don't immediately redirect
    return false;
  }
};

// Verify the Supabase session and update local storage accordingly
export async function checkSupabaseSession(): Promise<boolean> {
  try {
    console.log("Verifying Supabase session...");
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
    
    console.log("Valid Supabase session found, updating auth state");
    
    // Session is valid, update expiry time
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
    
    try {
      localStorage.setItem('authExpiry', expiryTime.toString());
      sessionStorage.setItem('authExpiry', expiryTime.toString());
      localStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('isAuthenticated', 'true');
    } catch (storageError) {
      console.error('Error updating storage during session check:', storageError);
      
      // Try to use sessionStorage as fallback if localStorage fails
      try {
        sessionStorage.setItem('authExpiry', expiryTime.toString());
        sessionStorage.setItem('isAuthenticated', 'true');
      } catch (sessionError) {
        console.error('Both storage methods failed:', sessionError);
        // At this point we could try cookies or other alternatives
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking Supabase session:', error);
    return false;
  }
}

// Clear authentication state from storage
export const clearAuthState = (): void => {
  try {
    console.log("Clearing authentication state...");
    
    try {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authExpiry');
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
    
    try {
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('authExpiry');
    } catch (e) {
      console.warn("Could not clear sessionStorage:", e);
    }
    
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
};

// Set authentication state in storage
export const setAuthState = (): void => {
  try {
    console.log("Setting authentication state...");
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
    
    let storedSuccessfully = false;
    
    try {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authExpiry', expiryTime.toString());
      storedSuccessfully = true;
    } catch (e) {
      console.warn("Failed to use localStorage:", e);
    }
    
    try {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('authExpiry', expiryTime.toString());
      storedSuccessfully = true;
    } catch (e) {
      console.warn("Failed to use sessionStorage:", e);
    }
    
    if (!storedSuccessfully) {
      console.error("Could not store authentication state in any storage mechanism");
      // Could implement cookie fallback here
    }
  } catch (error) {
    console.error('Error setting auth state:', error);
  }
};
