
import React from 'react';
import { RefreshCw, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  onLogout: () => Promise<void>;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshed: Date | null;
}

const DashboardHeaderNew: React.FC<DashboardHeaderProps> = ({
  onLogout,
  onRefresh,
  isRefreshing,
  lastRefreshed
}) => {
  const formattedLastRefreshed = lastRefreshed 
    ? new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      }).format(lastRefreshed)
    : 'Never';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reservations Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Last updated: {formattedLastRefreshed}
        </p>
      </div>
      
      <div className="flex flex-shrink-0 gap-2">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
        
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardHeaderNew;
