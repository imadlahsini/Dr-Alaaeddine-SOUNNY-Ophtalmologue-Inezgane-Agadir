
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logoutAdmin } from '../utils/api';
import { sendReservationNotification } from '../utils/pushNotificationService';
import { clearAuthState } from '../utils/authUtils';

// Components
import ReservationTable from '../components/ReservationTable';
import NotificationSettings from '../components/NotificationSettings';
import LoadingState from '../components/dashboard/LoadingState';
import ErrorState from '../components/dashboard/ErrorState';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import EmptyState from '../components/dashboard/EmptyState';

// Custom hooks
import { useAuthentication } from '../hooks/useAuthentication';
import { useReservations } from '../hooks/useReservations';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  
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

  console.log("Render state:", { 
    loading, 
    error, 
    isChecking, 
    isAuth, 
    isMounted, 
    reservationsCount: reservations.length,
    timeoutOccurred,
    isSubscribed
  });

  // Handle authentication checking
  if (isChecking) {
    return <LoadingState />;
  }

  // Handle loading state with timeout fallback
  if (loading) {
    if (timeoutOccurred) {
      return (
        <ErrorState 
          error="Loading is taking longer than expected. Please try again." 
          onRetry={fetchData} 
        />
      );
    }
    return <LoadingState />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <DashboardHeader onLogout={handleLogout} />
        <ErrorState error={error} onRetry={fetchData} />
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="container mx-auto p-4 overflow-x-hidden">
      <DashboardHeader onLogout={handleLogout} />
      
      <NotificationSettings />
      
      {reservations.length === 0 ? (
        <EmptyState onRefresh={fetchData} />
      ) : (
        <ReservationTable
          reservations={reservations}
          onStatusChange={handleStatusChange}
          onUpdate={handleUpdate}
        />
      )}
      
      {/* Connection status indicator */}
      <div className="fixed bottom-4 right-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
          isSubscribed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isSubscribed ? 'bg-green-500' : 'bg-yellow-500'
          }`}></span>
          <span>{isSubscribed ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
