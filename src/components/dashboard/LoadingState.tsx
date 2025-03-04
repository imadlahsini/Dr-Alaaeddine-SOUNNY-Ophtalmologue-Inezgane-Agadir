
import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingState: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col justify-center items-center min-h-[calc(100vh-6rem)] p-4 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-12 w-12 text-primary" />
      </motion.div>
      <h3 className="text-xl font-medium mt-6 text-gray-800">Loading reservations...</h3>
      <p className="text-gray-500 mt-2 max-w-md">
        Please wait while we retrieve your restaurant's reservation data
      </p>
    </motion.div>
  );
};

export default LoadingState;
