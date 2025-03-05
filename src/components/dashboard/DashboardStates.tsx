
import React from 'react';
import { RefreshCw, SearchX, AlertTriangle } from 'lucide-react';

export const DashboardLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <h3 className="text-lg font-medium text-gray-700">Loading Dashboard</h3>
      <p className="text-gray-500 mt-2">Please wait while we fetch your reservations...</p>
    </div>
  );
};

export const DashboardError: React.FC<{ error: string; onRetry: () => void }> = ({ 
  error, 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-800 mb-2">Something went wrong</h3>
      <p className="text-gray-500 mb-6 max-w-md">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
};

export const DashboardEmpty: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white rounded-xl shadow-sm">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <Calendar className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">No reservations yet</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        When customers make reservations, they'll appear here. Check back later or create a test reservation.
      </p>
      <button
        onClick={onRefresh}
        className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Refresh</span>
      </button>
    </div>
  );
};

export const NoResultsFound: React.FC<{ onClearFilters: () => void }> = ({ onClearFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 bg-white rounded-xl shadow-sm">
      <SearchX className="h-10 w-10 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-800 mb-2">No matching reservations</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        We couldn't find any reservations that match your current filters. Try adjusting your search criteria.
      </p>
      <button
        onClick={onClearFilters}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        Clear Filters
      </button>
    </div>
  );
};

// Add this import at the top
import { Calendar } from 'lucide-react';
