
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logoutAdmin } from '../utils/api';
import { clearAuthState } from '../utils/authUtils';

// Hooks
import { useAuthentication } from '../hooks/useAuthentication';
import { useDashboard } from '../hooks/useDashboard';

// Components
import DashboardFiltersNew from '../components/dashboard/DashboardFiltersNew';
import ReservationCardNew from '../components/dashboard/ReservationCardNew';
import { DashboardLoading, DashboardError, DashboardEmpty, NoResultsFound } from '../components/dashboard/DashboardStates';

const NewDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isChecking, isAuth } = useAuthentication();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    reservations,
    filteredReservations,
    searchQuery,
    statusFilter,
    dateFilter,
    isLoading,
    error,
    setSearchQuery,
    setStatusFilter,
    setDateFilter,
    refreshData
  } = useDashboard();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutAdmin();
      clearAuthState();
      toast.success('Logged out successfully');
      navigate('/admin');
    } catch (err) {
      console.error('Error during logout:', err);
      clearAuthState();
      toast.error('Error during logout, but local session cleared');
      navigate('/admin');
    }
  };
  
  // Handle manual refresh
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('Dashboard refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('All');
    setDateFilter(null);
  }, [setSearchQuery, setStatusFilter, setDateFilter]);
  
  // Handle authentication checking
  if (isChecking) {
    return <DashboardLoading />;
  }
  
  // Handle unauthorized access
  if (!isAuth) {
    navigate('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-2 py-2">
        {/* Simple Header */}
        <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
          <h1 className="text-xl font-bold">Reservation Dashboard</h1>
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg"
              disabled={isRefreshing}
            >
              Refresh
            </button>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-gray-500 text-white rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        {isLoading ? (
          <DashboardLoading />
        ) : error ? (
          <DashboardError error={error} onRetry={refreshData} />
        ) : (
          <>
            {/* Filters */}
            <div className="mb-4">
              <DashboardFiltersNew
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
              />
            </div>
            
            {/* Reservations Lists */}
            {reservations.length === 0 ? (
              <DashboardEmpty onRefresh={handleRefresh} />
            ) : filteredReservations.length === 0 ? (
              <NoResultsFound onClearFilters={clearFilters} />
            ) : (
              <div className="space-y-4">
                {/* Simplified view - just a flat list of reservations */}
                <div className="bg-white rounded-lg shadow-sm p-3 overflow-auto">
                  <h2 className="font-semibold mb-2">All Reservations ({filteredReservations.length})</h2>
                  <div className="space-y-2">
                    {filteredReservations.map((reservation) => (
                      <ReservationCardNew
                        key={reservation.id}
                        reservation={reservation}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewDashboard;
