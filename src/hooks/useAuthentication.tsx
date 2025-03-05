
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getSession } from '../utils/api';
import { isAuthenticated, setAuthState, clearAuthState } from '../utils/authUtils';
import { supabase } from '../integrations/supabase/client';

export const useAuthentication = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    let isMounted = true;
    console.log("Authentication hook initialized");

    const checkAuthentication = async () => {
      try {
        console.log("Starting authentication check...");
        
        // Quick check first using storage
        const localAuth = isAuthenticated();
        console.log("Local storage auth check:", localAuth);
        
        if (!localAuth) {
          console.log('Not authenticated based on local check');
          if (isMounted) {
            clearAuthState();
            setIsChecking(false);
            return;
          }
          return;
        }
        
        console.log("Verifying with Supabase...");
        
        // Verify with Supabase
        const { data, error } = await getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (isMounted) {
            clearAuthState();
            setIsChecking(false);
            if (window.location.pathname.includes('/dashboard')) {
              toast.error('Authentication error. Please login again.');
              navigate('/admin');
            }
          }
          return;
        }
        
        if (!data.session) {
          console.log('No active session found');
          if (isMounted) {
            clearAuthState();
            setIsChecking(false);
            if (window.location.pathname.includes('/dashboard')) {
              toast.error('Session expired. Please login again.');
              navigate('/admin');
            }
          }
          return;
        }
        
        console.log("Authentication verified successfully");
        
        // Renew authentication status
        setAuthState();
        
        if (isMounted) {
          setIsAuth(true);
          setIsChecking(false);
        }
      } catch (err) {
        console.error('Uncaught auth check error:', err);
        if (isMounted) {
          clearAuthState();
          setIsChecking(false);
          if (window.location.pathname.includes('/dashboard')) {
            toast.error('Authentication error. Please login again.');
            navigate('/admin');
          }
        }
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
      
      if (event === 'SIGNED_IN' && session) {
        setAuthState();
        setIsAuth(true);
        setIsChecking(false);
      } else if (event === 'SIGNED_OUT') {
        clearAuthState();
        setIsAuth(false);
        setIsChecking(false);
        if (window.location.pathname.includes('/dashboard')) {
          navigate('/admin');
        }
      }
    });

    // Start the check after a brief delay to ensure component is mounted
    const timeoutId = setTimeout(() => {
      checkAuthentication();
    }, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      console.log("Authentication hook cleanup");
    };
  }, [navigate]);

  return { isChecking, isAuth };
};
