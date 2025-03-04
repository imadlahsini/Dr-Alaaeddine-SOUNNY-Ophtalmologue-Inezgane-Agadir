import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { fetchReservations, updateReservation, Reservation } from '../utils/api';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);
  const updatingReservationsRef = useRef<Set<string>>(new Set()); // Track reservations being updated
  const isMountedRef = useRef(true); // Track if component is mounted
  const fetchInProgressRef = useRef(false); // Prevent concurrent fetches

  const clearRefreshInterval = () => {
    if (refreshIntervalRef.current) {
      console.log("Clearing existing refresh interval");
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearRefreshInterval();
    };
  }, []);

  const fetchData = useCallback(async () => {
    // Skip if fetch already in progress
    if (fetchInProgressRef.current) {
      console.log("FETCH: Already fetching data, skipping duplicate request");
      return;
    }
    
    // Skip if component is unmounted
    if (!isMountedRef.current) {
      console.log("FETCH: Component unmounted, skipping fetch");
      return;
    }
    
    console.log("FETCH: Starting reservation data fetch...");
    fetchInProgressRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchReservations();
      console.log("FETCH: Reservation data received:", result);
      
      // Skip update if component unmounted during fetch
      if (!isMountedRef.current) {
        console.log("FETCH: Component unmounted during fetch, skipping state update");
        return;
      }
      
      if (result.success) {
        // Store the current updating IDs before updating state
        const currentlyUpdating = Array.from(updatingReservationsRef.current);
        console.log("FETCH: Currently updating reservation IDs:", currentlyUpdating);
        
        // If we have some reservations currently being updated, we need to preserve their local state
        if (currentlyUpdating.length > 0 && reservations.length > 0) {
          // Merge incoming data with locally modified data for items being updated
          const mergedData = result.data?.map(newRes => {
            // If this reservation is being updated, use our local version
            if (currentlyUpdating.includes(newRes.id)) {
              const localVersion = reservations.find(r => r.id === newRes.id);
              if (localVersion) {
                console.log(`FETCH: Preserving local changes for reservation ${newRes.id}`);
                return localVersion;
              }
            }
            return newRes;
          }) || [];
          
          setReservations(mergedData);
        } else {
          // No active updates, just use the fresh data
          setReservations(result.data || []);
        }
        
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
      
      if (isMountedRef.current) {
        setError('Network error. Please try again.');
        toast.error('Network error. Please try again.');
      }
    } finally {
      console.log("FETCH: Completed fetch process, setting loading to false");
      fetchInProgressRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [reservations]);

  // Auto-refresh data every 5 minutes when component is mounted
  useEffect(() => {
    // Initial fetch
    if (isMountedRef.current && !fetchInProgressRef.current) {
      fetchData().catch(err => {
        console.error("Error during initial fetch:", err);
      });
    }
    
    // Set up interval for auto-refresh
    clearRefreshInterval(); // Clear any existing interval
    
    refreshIntervalRef.current = window.setInterval(() => {
      if (isMountedRef.current && !fetchInProgressRef.current && document.visibilityState !== 'hidden') {
        console.log("Performing auto-refresh of reservation data");
        fetchData().catch(err => {
          console.error("Error during auto-refresh:", err);
        });
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    // Handle visibility changes to avoid refresh when tab is not visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMountedRef.current && !fetchInProgressRef.current) {
        console.log("Tab became visible, refreshing data");
        fetchData().catch(err => {
          console.error("Error during visibility refresh:", err);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearRefreshInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  const handleStatusChange = async (id: string, status: Reservation['status']) => {
    // Prevent duplicate requests
    if (updatingReservationsRef.current.has(id)) {
      console.log(`Already updating reservation ${id}, ignoring duplicate request`);
      return;
    }
    
    console.log(`Starting status update for reservation ${id} to ${status}`);
    updatingReservationsRef.current.add(id);
    
    // Optimistically update UI state
    setReservations(prev =>
      prev.map(res => (res.id === id ? { ...res, status } : res))
    );
    
    try {
      console.log(`Sending API request to update reservation ${id} status to ${status}`);
      const result = await updateReservation(id, { status });
      
      if (result.success) {
        console.log(`Reservation ${id} status successfully updated on server`);
        toast.success('Reservation status updated successfully');
        
        // No need to update local state again since we did it optimistically
      } else {
        console.error(`Failed to update reservation ${id} status:`, result.message);
        toast.error(result.message || 'Failed to update reservation status');
        
        // Revert the optimistic update
        setReservations(prev =>
          prev.map(res => {
            if (res.id === id) {
              // Try to find the original state
              const originalRes = reservations.find(r => r.id === id);
              return originalRes || res; // Fallback to current if original not found
            }
            return res;
          })
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Network error. Please try again.');
      
      // Revert the optimistic update
      setReservations(prev =>
        prev.map(res => {
          if (res.id === id) {
            // Try to find the original state
            const originalRes = reservations.find(r => r.id === id);
            return originalRes || res; // Fallback to current if original not found
          }
          return res;
        })
      );
    } finally {
      console.log(`Completed update process for reservation ${id}`);
      updatingReservationsRef.current.delete(id);
    }
  };

  const handleUpdate = async (id: string, updatedData: Partial<Reservation>) => {
    if (updatingReservationsRef.current.has(id)) {
      console.log(`Already updating reservation ${id}, ignoring duplicate request`);
      return;
    }
    
    console.log(`Starting update for reservation ${id} with data:`, updatedData);
    updatingReservationsRef.current.add(id);
    
    // Optimistically update UI state
    setReservations(prev =>
      prev.map(res => (res.id === id ? { ...res, ...updatedData } : res))
    );
    
    try {
      console.log(`Sending API request to update reservation ${id}`);
      const result = await updateReservation(id, updatedData);
      
      if (result.success) {
        console.log(`Reservation ${id} successfully updated on server`);
        toast.success('Reservation updated successfully');
        
        // No need to update local state again since we did it optimistically
      } else {
        console.error(`Failed to update reservation ${id}:`, result.message);
        toast.error(result.message || 'Failed to update reservation');
        
        // Revert the optimistic update
        setReservations(prev =>
          prev.map(res => {
            if (res.id === id) {
              // Try to find the original state
              const originalRes = reservations.find(r => r.id === id);
              return originalRes || res; // Fallback to current if original not found
            }
            return res;
          })
        );
      }
    } catch (err) {
      console.error('Error updating reservation:', err);
      toast.error('Network error. Please try again.');
      
      // Revert the optimistic update
      setReservations(prev =>
        prev.map(res => {
          if (res.id === id) {
            // Try to find the original state
            const originalRes = reservations.find(r => r.id === id);
            return originalRes || res; // Fallback to current if original not found
          }
          return res;
        })
      );
    } finally {
      console.log(`Completed update process for reservation ${id}`);
      updatingReservationsRef.current.delete(id);
    }
  };

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
    
    // Skip if we're currently updating this reservation ourselves
    if (updatingReservationsRef.current.has(updatedReservation.id)) {
      console.log(`Ignoring realtime update for reservation ${updatedReservation.id} as we're currently updating it`);
      return;
    }
    
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

  const refreshData = useCallback(async () => {
    console.log("Manual refresh requested, resetting auto-refresh timer");
    
    // Skip if component unmounted
    if (!isMountedRef.current) {
      console.log("REFRESH: Component unmounted, skipping refresh");
      return false;
    }
    
    // Skip if fetch already in progress
    if (fetchInProgressRef.current) {
      console.log("REFRESH: Already fetching data, skipping duplicate request");
      return false;
    }
    
    // Clear existing interval and set a new one
    clearRefreshInterval();
    
    // Fetch data immediately
    try {
      await fetchData();
      
      // Set up new interval (only if component still mounted)
      if (isMountedRef.current) {
        refreshIntervalRef.current = window.setInterval(() => {
          if (isMountedRef.current && !fetchInProgressRef.current && document.visibilityState !== 'hidden') {
            console.log("Performing auto-refresh of reservation data");
            fetchData().catch(err => {
              console.error("Error during auto-refresh:", err);
            });
          }
        }, 5 * 60 * 1000); // 5 minutes
      }
      
      return true; // Indicate success
    } catch (error) {
      console.error("Error during manual refresh:", error);
      return false;
    }
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
    handleReservationDelete,
    setReservations,
    lastRefreshTime
  };
};
