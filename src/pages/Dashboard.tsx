import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  
  // Prevent useEffect from running twice in development
  const effectRan = useRef(false);
  const dashboardInitialized = useRef(false);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  
  // Set up hooks in the correct order to avoid race conditions
  const { isChecking, isAuth } = useAuthentication();
  
  // Updated to match the actual properties returned by useReservations hook
  const {
    reservations,
    isLoading,
    error,
    loadReservations,
    updateStatus
  } = useReservations();

  // These callbacks need to be updated to match the actual hooks
  const onNewReservationCallback = useCallback((newReservation) => {
    // Refresh data instead of using the non-existent handleNewReservation function
    loadReservations();
    
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
  }, [loadReservations]);

  // Updated callbacks to use loadReservations instead
  const onReservationUpdateCallback = useCallback(() => {
    loadReservations();
  }, [loadReservations]);
  
  const onReservationDeleteCallback = useCallback(() => {
    loadReservations();
  }, [loadReservations]);

  // Set up realtime subscription with memoized callbacks to prevent recreating the subscription
  const { isSubscribed } = useRealtimeSubscription({
    onNewReservation: onNewReservationCallback,
    onReservationUpdate: onReservationUpdateCallback,
    onReservationDelete: onReservationDeleteCallback
  });

  // Component mount tracking with additional safeguards
  useEffect(() => {
    // Skip if already initialized to prevent double initialization
    if (dashboardInitialized.current) {
      console.log("Dashboard already initialized, skipping");
      return;
    }
    
    // In development React will run effects twice, which can cause issues
    // This check prevents double execution in development
    if (effectRan.current === true && process.env.NODE_ENV !== 'production') {
      console.log("Skipping duplicate effect execution in development");
      return;
    }
    
    console.log("Dashboard component MOUNTED (effect executed once)");
    setIsMounted(true);
    dashboardInitialized.current = true;
    
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
    const resizeHandler = debounce(forceReflow, 250); // Debounce for performance
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      console.log("Dashboard component UNMOUNTED");
      effectRan.current = true; // Mark that the effect has run
      setIsMounted(false);
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  // Fetch data after authentication is confirmed - with safeguards against multiple fetches
  const dataFetchedRef = useRef(false);
  
  useEffect(() => {
    if (!isMounted || isChecking || !isAuth) return;
    
    // Prevent multiple fetches
    if (dataFetchedRef.current) {
      console.log("Data already fetched, skipping duplicate fetch");
      return;
    }
    
    console.log("Authentication confirmed, fetching data ONCE...");
    dataFetchedRef.current = true;
    
    loadReservations().catch(err => {
      console.error("Error during initial data fetch:", err);
      dataFetchedRef.current = false; // Reset on error to allow retry
    });
  }, [isMounted, isChecking, isAuth, loadReservations]);

  // Set up a loading timeout
  useEffect(() => {
    if (!isLoading || !isMounted) return;
    
    console.log("Setting up loading timeout");
    const loadingTimeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Loading timeout triggered");
        setTimeoutOccurred(true);
      }
    }, 10000); // 10 second timeout
    
    return () => {
      clearTimeout(loadingTimeoutId);
    };
  }, [isLoading, isMounted]);

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
      await loadReservations();
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

  // Filter and sort reservations - memoized to prevent unnecessary calculations
  const filteredReservations = React.useMemo(() => {
    return reservations.filter(res => {
      const matchesSearch = 
        res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.phone.includes(searchQuery);
      
      const matchesStatus = statusFilter === 'All' || res.status === statusFilter;
      const matchesDate = !dateFilter || res.date === dateFilter;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reservations, searchQuery, statusFilter, dateFilter]);

  const sortedReservations = React.useMemo(() => {
    return [...filteredReservations].sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredReservations, sortBy]);

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

  // Calculate stats - memoized to prevent recalculations
  const stats = React.useMemo(() => {
    const totalReservations = reservations.length;
    const confirmedReservations = reservations.filter(r => r.status === 'Confirmed').length;
    const pendingReservations = reservations.filter(r => r.status === 'Pending').length;
    const canceledReservations = reservations.filter(r => r.status === 'Canceled').length;
    
    // Compute confirmation rate
    const confirmationRate = totalReservations > 0 
      ? Math.round((confirmedReservations / totalReservations) * 100) 
      : 0;
      
    return {
      totalReservations,
      confirmedReservations,
      pendingReservations,
      canceledReservations,
      confirmationRate
    };
  }, [reservations]);

  // Format last refresh time - using current date since lastRefreshTime isn't available
  const formattedLastRefreshTime = new Date().toLocaleString();

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
      {isLoading && (
        timeoutOccurred 
          ? <ErrorState error="Loading is taking longer than expected. Please try again." onRetry={loadReservations} />
          : <LoadingState />
      )}

      {/* Handle error state */}
      {!isLoading && error && (
        <ErrorState error={error} onRetry={loadReservations} />
      )}

      {/* Main content when data is loaded successfully */}
      {!isLoading && !error && (
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
              value={stats.totalReservations} 
              icon={CalendarDays}
              iconColor="text-purple-600"
            />
            <StatsCard 
              title="Confirmed" 
              value={stats.confirmedReservations} 
              icon={BadgeCheck}
              iconColor="text-green-600"
            />
            <StatsCard 
              title="Pending" 
              value={stats.pendingReservations} 
              icon={Calendar}
              iconColor="text-yellow-600"
            />
            <StatsCard 
              title="Confirmation Rate" 
              value={`${stats.confirmationRate}%`} 
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
                      onStatusChange={(id, status) => updateStatus(id, status)}
                      onUpdate={() => loadReservations()}
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
