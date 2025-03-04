
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logoutAdmin } from '../utils/api';
import { sendReservationNotification } from '../utils/pushNotificationService';
import { clearAuthState } from '../utils/authUtils';
import { CalendarDays, Users, Calendar, BadgeCheck, XCircle, AlertTriangle, ArrowDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import debounce from 'lodash/debounce';

// Components
import LoadingState from '../components/dashboard/LoadingState';
import ErrorState from '../components/dashboard/ErrorState';
import EmptyState from '../components/dashboard/EmptyState';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StatsCard from '../components/dashboard/StatsCard';
import ReservationCard from '../components/dashboard/ReservationCard';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import NotificationSettings from '../components/NotificationSettings';

// Custom hooks
import { useAuthentication } from '../hooks/useAuthentication';
import { useReservations } from '../hooks/useReservations';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

// Define a type for status values to ensure type safety
export type StatusType = 'All' | 'Pending' | 'Confirmed' | 'Canceled' | 'Not Responding';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  
  // Set up hooks in the correct order to avoid race conditions
  const { isChecking, isAuth } = useAuthentication();
  
  const {
    reservations,
    loading,
    error,
    fetchData,
    refreshData,
    handleStatusChange,
    handleUpdate,
    handleNewReservation,
    handleReservationUpdate,
    handleReservationDelete,
    lastRefreshTime
  } = useReservations();

  // Set up realtime subscription
  const { isSubscribed } = useRealtimeSubscription({
    onNewReservation: (newReservation) => {
      handleNewReservation(newReservation);
      
      // Send notification
      try {
        console.log('Sending push notification for new reservation');
        sendReservationNotification({
          name: newReservation.name,
          phone: newReservation.phone,
          date: newReservation.date,
          timeSlot: newReservation.timeSlot
        });
      } catch (notifError) {
        console.error('Failed to send push notification:', notifError);
      }
    },
    onReservationUpdate: handleReservationUpdate,
    onReservationDelete: handleReservationDelete
  });

  // Component mount tracking
  useEffect(() => {
    console.log("Dashboard component MOUNTED");
    setIsMounted(true);
    
    // Force layout recalculation on mobile
    const forceReflow = () => {
      if (window.innerWidth < 768) {
        document.body.style.minHeight = '100vh';
        document.documentElement.style.minHeight = '100vh';
        
        // Add a small timeout to ensure styles are applied
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }
    };
    
    forceReflow();
    window.addEventListener('resize', forceReflow);
    
    return () => {
      console.log("Dashboard component UNMOUNTED");
      setIsMounted(false);
      window.removeEventListener('resize', forceReflow);
    };
  }, []);

  // Fetch data after authentication is confirmed
  useEffect(() => {
    if (isMounted && !isChecking && isAuth) {
      console.log("Authentication confirmed, fetching data...");
      fetchData().catch(err => {
        console.error("Error during initial data fetch:", err);
      });
    }
  }, [isMounted, isChecking, isAuth, fetchData]);

  // Set up a loading timeout
  useEffect(() => {
    if (!loading || !isMounted) return;
    
    console.log("Setting up loading timeout");
    const loadingTimeoutId = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout triggered");
        setTimeoutOccurred(true);
      }
    }, 10000); // 10 second timeout
    
    return () => {
      clearTimeout(loadingTimeoutId);
    };
  }, [loading, isMounted]);

  // Create debounced search handler
  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  // Handle manual refresh
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      console.log("Initiating logout process...");
      
      const result = await logoutAdmin();
      clearAuthState();
      
      if (result.success) {
        toast.success('Logged out successfully');
      } else {
        console.warn("Logout API error:", result.message);
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

  // Validate date format DD/MM/YYYY
  const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(dateStr)) return false;
    
    const [, day, month, year] = dateStr.match(dateRegex) || [];
    const numDay = parseInt(day, 10);
    const numMonth = parseInt(month, 10);
    const numYear = parseInt(year, 10);
    
    if (numMonth < 1 || numMonth > 12) return false;
    
    // Check if day is valid for the given month and year
    const daysInMonth = new Date(numYear, numMonth, 0).getDate();
    return numDay > 0 && numDay <= daysInMonth;
  };

  // Filter and sort reservations
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'All' || res.status === statusFilter;
    const matchesDate = !dateFilter || res.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  function parseDate(dateStr: string): number {
    if (!dateStr || !dateStr.includes('/')) return 0;
    try {
      const [day, month, year] = dateStr.split('/').map(Number);
      // Create date with the correct format (months are 0-indexed in JS Date)
      return new Date(year, month - 1, day).getTime();
    } catch (error) {
      console.error("Error parsing date:", dateStr, error);
      return 0;
    }
  }

  // Calculate stats
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter(r => r.status === 'Confirmed').length;
  const pendingReservations = reservations.filter(r => r.status === 'Pending').length;
  const canceledReservations = reservations.filter(r => r.status === 'Canceled').length;
  
  // Compute confirmation rate
  const confirmationRate = totalReservations > 0 
    ? Math.round((confirmedReservations / totalReservations) * 100) 
    : 0;

  // Format last refresh time
  const formattedLastRefreshTime = lastRefreshTime 
    ? format(lastRefreshTime, 'dd/MM/yyyy HH:mm:ss')
    : 'Never';

  // Handle authentication checking
  if (isChecking) {
    return <LoadingState />;
  }

  // Main dashboard view
  return (
    <DashboardLayout
      sidebarOpen={sidebarOpen}
      toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      onLogout={handleLogout}
    >
      {/* Handle loading state with timeout fallback */}
      {loading && (
        timeoutOccurred 
          ? <ErrorState error="Loading is taking longer than expected. Please try again." onRetry={fetchData} />
          : <LoadingState />
      )}

      {/* Handle error state */}
      {!loading && error && (
        <ErrorState error={error} onRetry={fetchData} />
      )}

      {/* Main content when data is loaded successfully */}
      {!loading && !error && (
        <div className="space-y-6 min-h-screen">
          {/* Notification Settings */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <NotificationSettings />
          </div>
          
          {/* Last refresh and manual refresh */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Last refreshed: {formattedLastRefreshTime}
            </p>
            
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title="Total Reservations" 
              value={totalReservations} 
              icon={CalendarDays}
              iconColor="text-purple-600"
            />
            <StatsCard 
              title="Confirmed" 
              value={confirmedReservations} 
              icon={BadgeCheck}
              iconColor="text-green-600"
            />
            <StatsCard 
              title="Pending" 
              value={pendingReservations} 
              icon={Calendar}
              iconColor="text-yellow-600"
            />
            <StatsCard 
              title="Confirmation Rate" 
              value={`${confirmationRate}%`} 
              icon={Users}
              iconColor="text-blue-600"
              change={{
                value: 5,
                trend: 'up'
              }}
            />
          </div>
          
          {/* Filters */}
          <DashboardFilters 
            searchQuery={searchQuery}
            setSearchQuery={(value) => debouncedSetSearchQuery(value)}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />

          {/* Reservations Grid */}
          {reservations.length === 0 ? (
            <EmptyState onRefresh={handleRefresh} />
          ) : (
            <div>
              {sortedReservations.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                  <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No matching reservations</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    We couldn't find any reservations that match your current filters. Try adjusting your search criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All');
                      setDateFilter(null);
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sortedReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onStatusChange={handleStatusChange}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Connection status indicator */}
          <div className="fixed bottom-4 right-4 z-10">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium shadow-md ${
              isSubscribed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                isSubscribed ? 'bg-green-500' : 'bg-yellow-500'
              }`}></span>
              <span>{isSubscribed ? 'Real-time updates active' : 'Connecting...'}</span>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
