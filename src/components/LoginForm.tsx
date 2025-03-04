
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../utils/api';

const LoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginAdmin(credentials);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md p-6 bg-white rounded-[20px] shadow-lg"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-primary">Admin Login</h2>
        <p className="mt-2 text-gray-600">Please enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="form-group">
          <label htmlFor="email"><Mail className="w-4 h-4 mr-1" /> Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
            className="w-full p-4 text-base bg-transparent border-none rounded-[15px] outline-none"
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password"><Lock className="w-4 h-4 mr-1" /> Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="w-full p-4 text-base bg-transparent border-none rounded-[15px] outline-none"
            placeholder="Enter your password"
          />
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          className="primary-button group w-full flex items-center justify-center"
          whileHover={{ y: -2, boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)' }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              <span>Login</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default LoginForm;
