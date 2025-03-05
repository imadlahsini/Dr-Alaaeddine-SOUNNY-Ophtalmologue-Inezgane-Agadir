
import React, { useCallback, useState } from 'react';
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
  
  const {
    reservations,
    filteredReservations,
    searchQuery,
    isLoading,
    error,
    setSearchQuery,
    refreshData,
    deleteReservation
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
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);
  
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
      <div className="max-w-full mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">Reservation Dashboard</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
        
        {/* Main Content */}
        {isLoading ? (
          <DashboardLoading />
        ) : error ? (
          <DashboardError error={error} onRetry={refreshData} />
        ) : (
          <>
            {/* Filters */}
            <div className="mb-6">
              <DashboardFiltersNew
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
            
            {/* Reservations Lists */}
            {reservations.length === 0 ? (
              <DashboardEmpty onRefresh={refreshData} />
            ) : filteredReservations.length === 0 ? (
              <NoResultsFound onClearFilters={clearFilters} />
            ) : (
              <div className="space-y-6">
                {/* Simplified view - just a flat list of reservations */}
                <div className="bg-white rounded-xl shadow-sm p-5 overflow-auto">
                  <h2 className="font-semibold mb-4 text-gray-700">All Reservations ({filteredReservations.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReservations.map((reservation) => (
                      <ReservationCardNew
                        key={reservation.id}
                        reservation={reservation}
                        compact={true}
                        onDelete={deleteReservation}
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
