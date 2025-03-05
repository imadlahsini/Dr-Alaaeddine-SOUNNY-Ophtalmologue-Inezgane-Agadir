
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logoutAdmin } from '../utils/api';
import { clearAuthState } from '../utils/authUtils';
import { CalendarDays, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// Hooks
import { useAuthentication } from '../hooks/useAuthentication';
import { useDashboard } from '../hooks/useDashboard';

// Components
import DashboardHeaderNew from '../components/dashboard/DashboardHeaderNew';
import StatsCardNew from '../components/dashboard/StatsCardNew';
import ReservationCardNew from '../components/dashboard/ReservationCardNew';
import DashboardFiltersNew from '../components/dashboard/DashboardFiltersNew';
import { DashboardLoading, DashboardError, DashboardEmpty, NoResultsFound } from '../components/dashboard/DashboardStates';
import NotificationSettings from '../components/NotificationSettings';

const NewDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isChecking, isAuth } = useAuthentication();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    reservations,
    filteredReservations,
    stats,
    searchQuery,
    statusFilter,
    dateFilter,
    isLoading,
    error,
    lastRefreshed,
    setSearchQuery,
    setStatusFilter,
    setDateFilter,
    updateReservationStatus,
    refreshData
  } = useDashboard();

  // Filter reservations by status
  const pendingReservations = filteredReservations.filter(r => r.status === 'Pending' || r.status === 'Not Responding');
  const confirmedReservations = filteredReservations.filter(r => r.status === 'Confirmed');
  const canceledReservations = filteredReservations.filter(r => r.status === 'Canceled');

  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await logoutAdmin();
      clearAuthState();
      
      if (result.success) {
        toast.success('Logged out successfully');
      } else {
        console.warn("Logout error:", result.message);
        toast.error(result.message || 'Logout failed, but local session cleared');
      }
      
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

  // Column render helper function
  const renderColumn = (title, icon, color, reservations, emptyMessage) => (
    <div className="flex flex-col h-full">
      <div className={`sticky top-0 z-10 flex items-center gap-2 mb-3 p-3 bg-white rounded-lg shadow-sm text-${color}-600 font-semibold`}>
        {icon}
        <h2>{title} ({reservations.length})</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {reservations.length === 0 ? (
          <div className="text-center py-6 text-gray-500 italic">{emptyMessage}</div>
        ) : (
          reservations.map((reservation) => (
            <ReservationCardNew
              key={reservation.id}
              reservation={reservation}
              onStatusChange={updateReservationStatus}
              compact={true}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <DashboardHeaderNew
          onLogout={handleLogout}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastRefreshed={lastRefreshed}
        />
        
        {/* Notification Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6">
          <NotificationSettings />
        </div>
        
        {/* Main Content */}
        {isLoading ? (
          <DashboardLoading />
        ) : error ? (
          <DashboardError error={error} onRetry={refreshData} />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCardNew 
                title="Total Reservations" 
                value={stats.total} 
                icon={CalendarDays}
                iconColor="text-purple-600"
              />
              <StatsCardNew 
                title="Confirmed" 
                value={stats.confirmed} 
                icon={CheckCircle}
                iconColor="text-green-600"
              />
              <StatsCardNew 
                title="Pending" 
                value={stats.pending} 
                icon={AlertTriangle}
                iconColor="text-yellow-600"
              />
              <StatsCardNew 
                title="Canceled" 
                value={stats.canceled} 
                icon={XCircle}
                iconColor="text-red-600"
              />
            </div>
            
            {/* Filters */}
            <div className="mb-6">
              <DashboardFiltersNew
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
              />
            </div>
            
            {/* Reservations Columns */}
            {reservations.length === 0 ? (
              <DashboardEmpty onRefresh={handleRefresh} />
            ) : filteredReservations.length === 0 ? (
              <NoResultsFound onClearFilters={clearFilters} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Pending Column */}
                <div className="bg-white rounded-xl shadow-sm p-3 min-h-[600px] max-h-[70vh] flex flex-col">
                  {renderColumn(
                    "Pending Reservations",
                    <AlertTriangle className="w-5 h-5" />,
                    "yellow",
                    pendingReservations,
                    "No pending reservations"
                  )}
                </div>
                
                {/* Confirmed Column */}
                <div className="bg-white rounded-xl shadow-sm p-3 min-h-[600px] max-h-[70vh] flex flex-col">
                  {renderColumn(
                    "Confirmed Reservations",
                    <CheckCircle className="w-5 h-5" />,
                    "green",
                    confirmedReservations,
                    "No confirmed reservations"
                  )}
                </div>
                
                {/* Canceled Column */}
                <div className="bg-white rounded-xl shadow-sm p-3 min-h-[600px] max-h-[70vh] flex flex-col">
                  {renderColumn(
                    "Canceled Reservations",
                    <XCircle className="w-5 h-5" />,
                    "red",
                    canceledReservations,
                    "No canceled reservations"
                  )}
                </div>
              </div>
            )}
            
            {/* Realtime indicator */}
            <div className="fixed bottom-4 right-4 z-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium shadow-md bg-green-100 text-green-800">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span>Real-time updates active</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewDashboard;
