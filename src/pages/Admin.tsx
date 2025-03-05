
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { Loader2 } from 'lucide-react';
import { getSession } from '../utils/api';
import { isAuthenticated, clearAuthState } from '../utils/authUtils';

const Admin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // First check local storage for quick UI response
        if (isAuthenticated()) {
          navigate('/dashboard');
          return;
        }
        
        // Then verify with Supabase for double-check
        const { data, error } = await getSession();
        
        if (error) {
          console.error('Session check error:', error);
          clearAuthState();
        } else if (data?.session) {
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-6 sm:p-6">
      <LoginForm />
    </div>
  );
};

export default Admin;
