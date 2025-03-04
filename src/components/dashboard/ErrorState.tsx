
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">An error occurred</h3>
      <div className="text-red-500 mb-4 text-center">{error}</div>
      <button 
        onClick={onRetry}
        className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorState;
