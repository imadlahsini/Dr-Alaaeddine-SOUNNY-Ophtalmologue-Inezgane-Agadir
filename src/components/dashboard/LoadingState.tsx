
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] p-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <span className="text-lg font-medium">Loading reservations...</span>
      <p className="text-sm text-gray-500 mt-2">
        Please wait while we load your dashboard
      </p>
    </div>
  );
};

export default LoadingState;
