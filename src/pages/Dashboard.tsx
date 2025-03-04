import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import ReservationTable from '../components/ReservationTable';
import NotificationSettings from '../components/NotificationSettings';
import { 
  fetchReservations, 
  updateReservation, 
  Reservation, 
  logoutAdmin, 
  getSession,
  transformReservationRecord 
} from '../utils/api';
import { supabase } from '../integrations/supabase/client';
import { sendReservationNotification } from '../utils/pushNotificationService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const realtimeChannelRef = useRef<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await getSession();
        
        if (error || !data.session) {
          toast.error('Session expired. Please login again.');
          navigate('/admin');
          return;
        }
        
        await fetchData();
        
        setupRealtimeSubscription();
      } catch (err) {
        console.error('Auth check error:', err);
        toast.error('Authentication error. Please login again.');
        navigate('/admin');
      }
    };
    
    checkAuth();
    
    return () => {
      removeRealtimeSubscription();
    };
  }, [navigate]);

  const setupRealtimeSubscription = () => {
    console.log('Setting up real-time subscription to reservations...');
    
    try {
      removeRealtimeSubscription();
      
      const channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'reservations'
          }, 
          (payload) => {
            console.log('New reservation received via real-time:', payload);
            
            if (payload.new && typeof payload.new === 'object') {
              handleNewReservation(payload.new);
            } else {
              console.error('Invalid payload received:', payload);
            }
          }
        )
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'reservations'
          },
          (payload) => {
            console.log('Reservation update received via real-time:', payload);
            
            if (payload.new && typeof payload.new === 'object') {
              handleReservationUpdate(payload.new);
            } else {
              console.error('Invalid update payload received:', payload);
            }
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to real-time updates for reservations');
            toast.success('Real-time updates activated');
          } else if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
            console.error('Subscription timed out');
            toast.error('Real-time updates timed out');
          } else if (status === REALTIME_SUBSCRIBE_STATES.CLOSED) {
            console.error('Subscription closed');
            toast.error('Real-time connection closed');
          } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
            console.error('Channel error occurred');
            toast.error('Connection error with real-time service');
            
            setTimeout(() => {
              setupRealtimeSubscription();
            }, 5000);
          }
        });
      
      realtimeChannelRef.current = channel;
      console.log('Real-time subscription setup complete', channel);
    } catch (err) {
      console.error('Error setting up real-time subscription:', err);
      toast.error('Failed to set up real-time updates');
    }
  };

  const removeRealtimeSubscription = () => {
    const channel = realtimeChannelRef.current;
    if (channel) {
      console.log('Removing real-time subscription...');
      supabase.removeChannel(channel)
        .then(() => {
          console.log('Real-time subscription removed successfully');
          realtimeChannelRef.current = null;
        })
        .catch(err => {
          console.error('Error removing real-time subscription:', err);
        });
    }
  };

  const handleNewReservation = async (newRecord: any) => {
    try {
      console.log('Processing new reservation from real-time update:', newRecord);
      
      const newReservation = transformReservationRecord(newRecord);
      
      if (!newReservation) {
        console.error('Failed to transform reservation data');
        return;
      }
      
      setReservations(prevReservations => {
        const exists = prevReservations.some(res => res.id === newReservation.id);
        if (exists) {
          console.log('Reservation already exists in state, not adding duplicate');
          return prevReservations;
        }
        
        console.log('Adding new reservation to state');
        return [newReservation, ...prevReservations];
      });
      
      sendReservationNotification({
        name: newReservation.name,
        phone: newReservation.phone,
        date: newReservation.date,
        timeSlot: newReservation.timeSlot
      });
      
      toast.success('New reservation received', {
        description: `${newReservation.name} has booked for ${newReservation.date}`
      });
    } catch (err) {
      console.error('Error handling new reservation:', err);
    }
  };

  const handleReservationUpdate = (updatedRecord: any) => {
    try {
      console.log('Processing reservation update from real-time:', updatedRecord);
      
      const updatedReservation = transformReservationRecord(updatedRecord);
      
      if (!updatedReservation) {
        console.error('Failed to transform updated reservation data');
        return;
      }
      
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === updatedReservation.id ? updatedReservation : res
        )
      );
      
      toast.info('Reservation updated', {
        description: `${updatedReservation.name}'s reservation has been updated`
      });
    } catch (err) {
      console.error('Error handling reservation update:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchReservations();
      if (result.success) {
        setReservations(result.data || []);
      } else {
        setError(result.message || 'Failed to fetch reservations');
        toast.error(result.message || 'Failed to fetch reservations');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Reservation['status']) => {
    try {
      const result = await updateReservation(id, { status });
      if (result.success) {
        setReservations(prev =>
          prev.map(res => (res.id === id ? { ...res, status } : res))
        );
        toast.success('Reservation status updated successfully');
      } else {
        toast.error(result.message || 'Failed to update reservation status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Network error. Please try again.');
    }
  };

  const handleUpdate = async (id: string, updatedData: Partial<Reservation>) => {
    try {
      const result = await updateReservation(id, updatedData);
      if (result.success) {
        setReservations(prev =>
          prev.map(res => (res.id === id ? { ...res, ...updatedData } : res))
        );
        toast.success('Reservation updated successfully');
      } else {
        toast.error(result.message || 'Failed to update reservation');
      }
    } catch (err) {
      console.error('Error updating reservation:', err);
      toast.error('Network error. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logoutAdmin();
      if (result.success) {
        toast.success('Logged out successfully');
        navigate('/admin');
      } else {
        toast.error(result.message || 'Logout failed');
      }
    } catch (err) {
      console.error('Error during logout:', err);
      toast.error('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading reservations...</span>
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Reservations Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>
      
      <NotificationSettings />
      
      <ReservationTable
        reservations={reservations}
        onStatusChange={handleStatusChange}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default Dashboard;
