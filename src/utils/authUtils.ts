
/**
 * Authentication utility functions with improved mobile browser support
 */

import { supabase } from '../integrations/supabase/client';

// Check if the user is authenticated using both localStorage and sessionStorage with improved mobile support
export const isAuthenticated = (): boolean => {
  try {
    console.log("Checking authentication status...");
    
    // Try to access localStorage and sessionStorage with better error handling
    let localAuth = false;
    let sessionAuth = false;
    let localExpiry = null;
    let sessionExpiry = null;
    
    try {
      // Use a try/catch for each individual operation for better granularity
      const localAuthItem = localStorage.getItem('isAuthenticated');
      localAuth = localAuthItem === 'true';
      localExpiry = localStorage.getItem('authExpiry');
      console.log("localStorage check:", { localAuth, localExpiry });
    } catch (storageError) {
      console.warn("Could not access localStorage:", storageError);
    }
    
    try {
      const sessionAuthItem = sessionStorage.getItem('isAuthenticated');
      sessionAuth = sessionAuthItem === 'true';
      sessionExpiry = sessionStorage.getItem('authExpiry');
      console.log("sessionStorage check:", { sessionAuth, sessionExpiry });
    } catch (storageError) {
      console.warn("Could not access sessionStorage:", storageError);
    }
    
    // Check for session expiry with better type handling
    const now = Date.now();
    
    // Ensure we parse as numbers and handle null values safely
    const localExpired = localExpiry ? parseInt(localExpiry, 10) < now : true;
    const sessionExpired = sessionExpiry ? parseInt(sessionExpiry, 10) < now : true;
    
    const isAuth = (localAuth && !localExpired) || (sessionAuth && !sessionExpired);
    console.log(`Auth status final determination: ${isAuth ? 'Authenticated' : 'Not authenticated'}`);
    
    return isAuth;
  } catch (error) {
    // Better error handling for mobile browsers
    console.error('Critical error checking authentication status:', error);
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
    
    // More granular storage operations with individual try/catch blocks
    let storedSuccessfully = false;
    
    try {
      localStorage.setItem('authExpiry', expiryTime.toString());
      localStorage.setItem('isAuthenticated', 'true');
      storedSuccessfully = true;
      console.log("Successfully stored auth in localStorage");
    } catch (storageError) {
      console.error('Error updating localStorage:', storageError);
    }
    
    try {
      sessionStorage.setItem('authExpiry', expiryTime.toString());
      sessionStorage.setItem('isAuthenticated', 'true');
      storedSuccessfully = true;
      console.log("Successfully stored auth in sessionStorage");
    } catch (sessionError) {
      console.error('Error updating sessionStorage:', sessionError);
    }
    
    if (!storedSuccessfully) {
      console.error("Both storage methods failed - unable to store authentication state");
    }
    
    return storedSuccessfully;
  } catch (error) {
    console.error('Error checking Supabase session:', error);
    return false;
  }
}

// Clear authentication state from storage with better error handling
export const clearAuthState = (): void => {
  try {
    console.log("Clearing authentication state...");
    let clearedSuccessfully = false;
    
    try {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authExpiry');
      clearedSuccessfully = true;
      console.log("Successfully cleared localStorage auth state");
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
    
    try {
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('authExpiry');
      clearedSuccessfully = true;
      console.log("Successfully cleared sessionStorage auth state");
    } catch (e) {
      console.warn("Could not clear sessionStorage:", e);
    }
    
    if (!clearedSuccessfully) {
      console.error("Failed to clear auth state from any storage mechanism");
    }
  } catch (error) {
    console.error('Critical error clearing auth state:', error);
  }
};

// Set authentication state in storage with better error handling
export const setAuthState = (): void => {
  try {
    console.log("Setting authentication state...");
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
    
    let storedSuccessfully = false;
    
    try {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authExpiry', expiryTime.toString());
      storedSuccessfully = true;
      console.log("Successfully set auth state in localStorage");
    } catch (e) {
      console.warn("Failed to use localStorage:", e);
    }
    
    try {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('authExpiry', expiryTime.toString());
      storedSuccessfully = true;
      console.log("Successfully set auth state in sessionStorage");
    } catch (e) {
      console.warn("Failed to use sessionStorage:", e);
    }
    
    if (!storedSuccessfully) {
      console.error("Could not store authentication state in any storage mechanism");
    }
  } catch (error) {
    console.error('Critical error setting auth state:', error);
  }
};

// New function to safely check if storage is available
export const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  try {
    const storage = window[type];
    const testKey = `__storage_test__${Math.random()}`;
    storage.setItem(testKey, testKey);
    const result = storage.getItem(testKey) === testKey;
    storage.removeItem(testKey);
    return result;
  } catch (e) {
    return false;
  }
};
