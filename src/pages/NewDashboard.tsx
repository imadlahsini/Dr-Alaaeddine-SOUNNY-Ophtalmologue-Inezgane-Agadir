
import React, { useCallback } from 'react';
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
    statusFilter,
    isLoading,
    error,
    setSearchQuery,
    setStatusFilter,
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
    setStatusFilter('All');
  }, [setSearchQuery, setStatusFilter]);
  
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
          <button 
            onClick={handleLogout}
            className="px-3 py-1 bg-gray-500 text-white rounded-lg"
          >
            Logout
          </button>
        </div>
        
        {/* Main Content */}
        {isLoading ? (
          <DashboardLoading />
        ) : error ? (
          <DashboardError error={error} onRetry={() => {}} />
        ) : (
          <>
            {/* Filters */}
            <div className="mb-4">
              <DashboardFiltersNew
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            </div>
            
            {/* Reservations Lists */}
            {reservations.length === 0 ? (
              <DashboardEmpty onRefresh={() => {}} />
            ) : filteredReservations.length === 0 ? (
              <NoResultsFound onClearFilters={clearFilters} />
            ) : (
              <div className="space-y-4">
                {/* Simplified view - just a flat list of reservations */}
                <div className="bg-white rounded-lg shadow-sm p-3 overflow-auto">
                  <h2 className="font-semibold mb-2">All Reservations ({filteredReservations.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
