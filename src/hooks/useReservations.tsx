
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { fetchReservations, updateReservation, Reservation } from '../utils/api';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);

  const clearRefreshInterval = () => {
    if (refreshIntervalRef.current) {
      console.log("Clearing existing refresh interval");
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const fetchData = useCallback(async () => {
    console.log("FETCH: Starting reservation data fetch...");
    setLoading(true);
    setError(null);

    try {
      const result = await fetchReservations();
      console.log("FETCH: Reservation data received:", result);
      
      if (result.success) {
        setReservations(result.data || []);
        setLastRefreshTime(new Date());
        console.log("FETCH: Successfully set reservations data:", result.data?.length || 0, "items");
      } else {
        console.error("FETCH: API reported error:", result.message);
        
        if (result.message === 'Not authenticated') {
          throw new Error('Not authenticated');
        }
        
        setError(result.message || 'Failed to fetch reservations');
        toast.error(result.message || 'Failed to fetch reservations');
      }
    } catch (err: any) {
      console.error('FETCH: Error fetching data:', err);
      
      if (err.message === 'Not authenticated') {
        throw err; // Re-throw for handling by the auth system
      }
      
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      console.log("FETCH: Completed fetch process, setting loading to false");
      setLoading(false);
    }
  }, []);

  // Auto-refresh data every 5 minutes when component is mounted
  useEffect(() => {
    // Initial fetch
    fetchData().catch(err => {
      console.error("Error during initial fetch:", err);
    });
    
    // Set up interval for auto-refresh
    clearRefreshInterval(); // Clear any existing interval
    
    refreshIntervalRef.current = window.setInterval(() => {
      console.log("Performing auto-refresh of reservation data");
      fetchData().catch(err => {
        console.error("Error during auto-refresh:", err);
      });
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      clearRefreshInterval();
    };
  }, [fetchData]);

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

  // Handlers for realtime updates
  const handleNewReservation = useCallback((newReservation: Reservation) => {
    console.log('Received new reservation via realtime:', newReservation);
    
    setReservations(prevReservations => {
      // Check if this reservation already exists in our state
      const exists = prevReservations.some(res => res.id === newReservation.id);
      if (exists) {
        console.log('Reservation already exists in state, not adding duplicate');
        return prevReservations;
      }
      
      console.log('Adding new reservation to state');
      const updatedReservations = [newReservation, ...prevReservations];
      return updatedReservations;
    });
    
    toast.success('New reservation received', {
      description: `${newReservation.name} has booked for ${newReservation.date}`
    });
  }, []);

  const handleReservationUpdate = useCallback((updatedReservation: Reservation) => {
    console.log('Received reservation update via realtime:', updatedReservation);
    
    setReservations(prevReservations => {
      const reservationExists = prevReservations.some(res => res.id === updatedReservation.id);
      
      if (!reservationExists) {
        console.log('Updated reservation not found in current state, adding it');
        return [updatedReservation, ...prevReservations];
      }
      
      console.log('Updating existing reservation in state');
      return prevReservations.map(res => 
        res.id === updatedReservation.id ? updatedReservation : res
      );
    });
    
    toast.info('Reservation updated', {
      description: `${updatedReservation.name}'s reservation has been updated`
    });
  }, []);

  // Handle reservation deletion from realtime
  const handleReservationDelete = useCallback((deletedId: string) => {
    console.log('Received reservation deletion via realtime:', deletedId);
    
    setReservations(prevReservations => {
      const exists = prevReservations.some(res => res.id === deletedId);
      
      if (!exists) {
        console.log('Deleted reservation not found in current state, no changes needed');
        return prevReservations;
      }
      
      console.log('Removing deleted reservation from state');
      return prevReservations.filter(res => res.id !== deletedId);
    });
    
    toast.info('Reservation deleted', {
      description: 'A reservation has been removed from the system'
    });
  }, []);

  // Manual refresh function that resets the auto-refresh timer
  const refreshData = useCallback(async () => {
    console.log("Manual refresh requested, resetting auto-refresh timer");
    
    // Clear existing interval and set a new one
    clearRefreshInterval();
    
    // Fetch data immediately
    await fetchData();
    
    // Set up new interval
    refreshIntervalRef.current = window.setInterval(() => {
      console.log("Performing auto-refresh of reservation data");
      fetchData().catch(err => {
        console.error("Error during auto-refresh:", err);
      });
    }, 5 * 60 * 1000); // 5 minutes
    
    return true; // Indicate success
  }, [fetchData]);

  return {
    reservations,
    loading,
    error,
    fetchData,
    refreshData, // New method for manual refresh
    handleStatusChange,
    handleUpdate,
    handleNewReservation,
    handleReservationUpdate,
    handleReservationDelete, // New handler for deletion events
    setReservations,
    lastRefreshTime
  };
};
