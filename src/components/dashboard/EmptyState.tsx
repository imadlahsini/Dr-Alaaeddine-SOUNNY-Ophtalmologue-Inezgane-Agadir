
import React from 'react';
import { CalendarX } from 'lucide-react';

interface EmptyStateProps {
  onRefresh: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onRefresh }) => {
  return (
    <div className="mt-8 text-center p-8 bg-white rounded-lg shadow-sm border border-gray-100">
      <CalendarX className="h-10 w-10 text-gray-400 mx-auto mb-4" />
      <p className="text-lg text-gray-600 mb-4">No reservations found.</p>
      <button 
        onClick={onRefresh}
        className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
};

export default EmptyState;
