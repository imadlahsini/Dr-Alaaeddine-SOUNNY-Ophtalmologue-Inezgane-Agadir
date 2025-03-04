
import React from 'react';
import { CalendarX, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  onRefresh: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onRefresh }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-10 mt-12 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto"
    >
      <div className="p-4 bg-primary/10 rounded-full">
        <CalendarX className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mt-6 text-gray-800">No reservations yet</h3>
      <p className="text-center text-gray-500 mt-3">
        You don't have any reservations in your system yet. They will appear here once customers start booking tables.
      </p>
      <motion.button 
        onClick={onRefresh}
        className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-medium flex items-center shadow-md hover:shadow-lg"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh Data
      </motion.button>
    </motion.div>
  );
};

export default EmptyState;
