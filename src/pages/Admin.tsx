
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { ShieldCheck } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Portal</h1>
        <p className="text-gray-600">Manage your reservations</p>
      </motion.div>

      <LoginForm />
    </div>
  );
};

export default Admin;
