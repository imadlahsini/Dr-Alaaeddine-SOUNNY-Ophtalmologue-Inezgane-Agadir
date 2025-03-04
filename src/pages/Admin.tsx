
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { getSession } from '../utils/api';
import { isAuthenticated } from '../utils/authUtils';

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
        
        if (data?.session) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-6 text-center"
      >
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Admin Portal</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your reservations</p>
      </motion.div>

      <LoginForm />
    </div>
  );
};

export default Admin;
