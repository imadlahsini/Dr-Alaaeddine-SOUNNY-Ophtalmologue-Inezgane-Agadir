
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-sm border border-red-100 max-w-md mx-auto"
    >
      <div className="p-4 bg-red-100 rounded-full">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold mt-6 text-gray-800">Error Loading Data</h3>
      <p className="text-center text-red-500 font-medium mt-2">
        {error}
      </p>
      <p className="text-center text-gray-500 mt-3">
        There was a problem loading your reservation data. This could be due to a network issue or a server problem.
      </p>
      <motion.button 
        onClick={onRetry}
        className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-medium flex items-center shadow-md hover:shadow-lg"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </motion.button>
    </motion.div>
  );
};

export default ErrorState;
