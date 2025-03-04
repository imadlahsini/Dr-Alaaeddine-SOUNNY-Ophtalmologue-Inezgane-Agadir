
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logoutAdmin } from '../utils/api';
import { sendReservationNotification } from '../utils/pushNotificationService';
import { clearAuthState } from '../utils/authUtils';
import { CalendarDays, Users, Calendar, BadgeCheck, XCircle, AlertTriangle, ArrowDown } from 'lucide-react';

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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Canceled' | 'Not Responding'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  
  // Set up hooks in the correct order to avoid race conditions
  const { isChecking, isAuth } = useAuthentication();
  
  const {
    reservations,
    loading,
    error,
    fetchData,
    handleStatusChange,
    handleUpdate,
    handleNewReservation,
    handleReservationUpdate
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
    onReservationUpdate: handleReservationUpdate
  });

  // Component mount tracking
  useEffect(() => {
    console.log("Dashboard component MOUNTED");
    setIsMounted(true);
    
    return () => {
      console.log("Dashboard component UNMOUNTED");
      setIsMounted(false);
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
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
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
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <NotificationSettings />
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
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />

          {/* Reservations Grid */}
          {reservations.length === 0 ? (
            <EmptyState onRefresh={fetchData} />
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
