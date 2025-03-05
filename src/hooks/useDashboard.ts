import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

export type ReservationStatus = 'Pending' | 'Confirmed' | 'Canceled' | 'Not Responding';

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  status: ReservationStatus;
  createdAt?: string;
}

interface Stats {
  total: number;
  confirmed: number;
  pending: number;
  canceled: number;
  notResponding: number;
}

interface DashboardState {
  reservations: Reservation[];
  filteredReservations: Reservation[];
  stats: Stats;
  searchQuery: string;
  statusFilter: ReservationStatus | 'All';
  dateFilter: string | null;
  isLoading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
}

export const useDashboard = () => {
  const [state, setState] = useState<DashboardState>({
    reservations: [],
    filteredReservations: [],
    stats: { total: 0, confirmed: 0, pending: 0, canceled: 0, notResponding: 0 },
    searchQuery: '',
    statusFilter: 'All',
    dateFilter: null,
    isLoading: true,
    error: null,
    lastRefreshed: null
  });
  
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const realtimeChannelRef = useRef<any>(null);
  
  const fetchReservations = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const reservations: Reservation[] = data.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        date: item.date,
        timeSlot: item.time_slot,
        status: item.status as ReservationStatus,
        createdAt: item.created_at
      }));
      
      const stats = calculateStats(reservations);
      
      const filtered = applyFilters(
        reservations, 
        state.searchQuery, 
        state.statusFilter, 
        state.dateFilter
      );
      
      setState(prev => ({
        ...prev,
        reservations,
        filteredReservations: filtered,
        stats,
        isLoading: false,
        lastRefreshed: new Date()
      }));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load reservations',
        isLoading: false
      }));
      toast.error('Failed to load reservations');
    }
  }, [state.searchQuery, state.statusFilter, state.dateFilter]);
  
  const calculateStats = (reservations: Reservation[]): Stats => {
    return {
      total: reservations.length,
      confirmed: reservations.filter(r => r.status === 'Confirmed').length,
      pending: reservations.filter(r => r.status === 'Pending').length,
      canceled: reservations.filter(r => r.status === 'Canceled').length,
      notResponding: reservations.filter(r => r.status === 'Not Responding').length
    };
  };
  
  const applyFilters = (
    reservations: Reservation[],
    searchQuery: string,
    statusFilter: ReservationStatus | 'All',
    dateFilter: string | null
  ): Reservation[] => {
    return reservations.filter(reservation => {
      const matchesSearch = 
        !searchQuery || 
        reservation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.phone.includes(searchQuery);
      
      const matchesStatus = 
        statusFilter === 'All' || 
        reservation.status === statusFilter;
      
      const matchesDate = 
        !dateFilter || 
        reservation.date === dateFilter;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };
  
  const setSearchQuery = (query: string) => {
    setState(prev => {
      const filtered = applyFilters(
        prev.reservations,
        query,
        prev.statusFilter,
        prev.dateFilter
      );
      
      return {
        ...prev,
        searchQuery: query,
        filteredReservations: filtered
      };
    });
  };
  
  const setStatusFilter = (status: ReservationStatus | 'All') => {
    setState(prev => {
      const filtered = applyFilters(
        prev.reservations,
        prev.searchQuery,
        status,
        prev.dateFilter
      );
      
      return {
        ...prev,
        statusFilter: status,
        filteredReservations: filtered
      };
    });
  };
  
  const setDateFilter = (date: string | null) => {
    setState(prev => {
      const filtered = applyFilters(
        prev.reservations,
        prev.searchQuery,
        prev.statusFilter,
        date
      );
      
      return {
        ...prev,
        dateFilter: date,
        filteredReservations: filtered
      };
    });
  };
  
  const updateReservationStatus = async (id: string, status: ReservationStatus) => {
    try {
      if (isUpdating[id]) return;
      
      setIsUpdating(prev => ({ ...prev, [id]: true }));
      
      console.log(`[STATUS UPDATE] Starting process for reservation ${id} - changing status to ${status}`);
      
      // Optimistically update the UI first
      setState(prev => {
        const updatedReservations = prev.reservations.map(reservation => 
          reservation.id === id ? { ...reservation, status } : reservation
        );
        
        return {
          ...prev,
          reservations: updatedReservations,
          filteredReservations: applyFilters(
            updatedReservations,
            prev.searchQuery,
            prev.statusFilter,
            prev.dateFilter
          ),
          stats: calculateStats(updatedReservations)
        };
      });
      
      // Then update in Supabase - with retries
      const maxRetries = 3;
      let currentTry = 0;
      let updateSuccessful = false;
      let updateData = null;
      let lastError = null;
      
      while (currentTry < maxRetries && !updateSuccessful) {
        currentTry++;
        console.log(`[STATUS UPDATE] Attempt ${currentTry}/${maxRetries} - Sending update to Supabase for reservation ${id}`);
        
        try {
          const { data, error } = await supabase
            .from('reservations')
            .update({ status })
            .eq('id', id)
            .select();
          
          if (error) {
            console.error(`[STATUS UPDATE] Supabase error on attempt ${currentTry}:`, error);
            lastError = error;
            // Wait a bit before trying again
            if (currentTry < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 500 * currentTry));
            }
          } else {
            updateData = data;
            updateSuccessful = true;
            console.log(`[STATUS UPDATE] Success on attempt ${currentTry}`);
          }
        } catch (err) {
          console.error(`[STATUS UPDATE] Exception on attempt ${currentTry}:`, err);
          lastError = err;
          // Wait a bit before trying again
          if (currentTry < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500 * currentTry));
          }
        }
      }
      
      if (!updateSuccessful) {
        throw new Error(`Failed to update after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
      }
      
      console.log(`[STATUS UPDATE] Supabase update response:`, updateData);
      
      // Verify the update was successful
      if (!updateData || updateData.length === 0) {
        console.warn(`[STATUS UPDATE] No data returned from update operation for reservation ${id}`);
        // Manually fetch the reservation to confirm if update worked
        const { data: checkData, error: checkError } = await supabase
          .from('reservations')
          .select('*')
          .eq('id', id)
          .single();
          
        if (checkError) {
          console.error('[STATUS UPDATE] Error checking reservation status:', checkError);
        } else {
          console.log(`[STATUS UPDATE] Current database status for reservation ${id}:`, checkData?.status);
          
          if (checkData?.status !== status) {
            console.error(`[STATUS UPDATE] Status mismatch! Expected: ${status}, Got: ${checkData?.status}`);
            throw new Error('Database status does not match expected value');
          } else {
            console.log(`[STATUS UPDATE] Verified: status was correctly updated to ${status}`);
          }
        }
      } else {
        console.log(`[STATUS UPDATE] Successfully updated reservation ${id} status to ${status} in database`);
        
        // Double-check that returned status matches what we set
        const returnedStatus = updateData[0]?.status;
        if (returnedStatus !== status) {
          console.error(`[STATUS UPDATE] Status mismatch in response! Expected: ${status}, Got: ${returnedStatus}`);
        }
      }
      
      toast.success(`Reservation status updated to ${status}`);
    } catch (error) {
      console.error('[STATUS UPDATE] Error updating reservation status:', error);
      toast.error('Failed to update reservation status');
      
      // Revert the optimistic update and refresh data from server
      console.log('[STATUS UPDATE] Reverting optimistic update and refreshing data');
      fetchReservations();
    } finally {
      setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
  };
  
  useEffect(() => {
    fetchReservations();
    
    const setupRealtimeSubscription = () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
      
      const channel = supabase
        .channel('reservation-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'reservations'
        }, payload => {
          console.log('New reservation received:', payload);
          
          const newReservation: Reservation = {
            id: payload.new.id,
            name: payload.new.name,
            phone: payload.new.phone,
            date: payload.new.date,
            timeSlot: payload.new.time_slot,
            status: payload.new.status as ReservationStatus,
            createdAt: payload.new.created_at
          };
          
          setState(prev => {
            const updatedReservations = [newReservation, ...prev.reservations];
            
            return {
              ...prev,
              reservations: updatedReservations,
              filteredReservations: applyFilters(
                updatedReservations,
                prev.searchQuery,
                prev.statusFilter,
                prev.dateFilter
              ),
              stats: calculateStats(updatedReservations)
            };
          });
          
          toast.success(`New reservation from ${newReservation.name}`, {
            description: `For ${newReservation.date} at ${newReservation.timeSlot}`
          });
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservations'
        }, payload => {
          console.log('Reservation updated:', payload);
          
          if (isUpdating[payload.new.id]) return;
          
          const updatedReservation: Reservation = {
            id: payload.new.id,
            name: payload.new.name,
            phone: payload.new.phone,
            date: payload.new.date,
            timeSlot: payload.new.time_slot,
            status: payload.new.status as ReservationStatus,
            createdAt: payload.new.created_at
          };
          
          setState(prev => {
            const updatedReservations = prev.reservations.map(reservation => 
              reservation.id === updatedReservation.id ? updatedReservation : reservation
            );
            
            return {
              ...prev,
              reservations: updatedReservations,
              filteredReservations: applyFilters(
                updatedReservations,
                prev.searchQuery,
                prev.statusFilter,
                prev.dateFilter
              ),
              stats: calculateStats(updatedReservations)
            };
          });
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'reservations'
        }, payload => {
          console.log('Reservation deleted:', payload);
          
          setState(prev => {
            const updatedReservations = prev.reservations.filter(
              reservation => reservation.id !== payload.old.id
            );
            
            return {
              ...prev,
              reservations: updatedReservations,
              filteredReservations: applyFilters(
                updatedReservations,
                prev.searchQuery,
                prev.statusFilter,
                prev.dateFilter
              ),
              stats: calculateStats(updatedReservations)
            };
          });
          
          toast.info('A reservation has been deleted');
        })
        .subscribe(status => {
          console.log('Realtime subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Realtime subscription active');
          }
        });
      
      realtimeChannelRef.current = channel;
    };
    
    setupRealtimeSubscription();
    
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [fetchReservations]);
  
  return {
    ...state,
    setSearchQuery,
    setStatusFilter,
    setDateFilter,
    updateReservationStatus,
    refreshData: fetchReservations
  };
};
