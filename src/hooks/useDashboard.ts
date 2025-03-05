
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
  
  // Fetch all reservations
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
      
      // Transform data to match our interface
      const reservations: Reservation[] = data.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        date: item.date,
        timeSlot: item.time_slot,
        status: item.status as ReservationStatus,
        createdAt: item.created_at
      }));
      
      // Calculate stats
      const stats = calculateStats(reservations);
      
      // Apply initial filters
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
  
  // Calculate stats from reservations
  const calculateStats = (reservations: Reservation[]): Stats => {
    return {
      total: reservations.length,
      confirmed: reservations.filter(r => r.status === 'Confirmed').length,
      pending: reservations.filter(r => r.status === 'Pending').length,
      canceled: reservations.filter(r => r.status === 'Canceled').length,
      notResponding: reservations.filter(r => r.status === 'Not Responding').length
    };
  };
  
  // Apply filters to reservations
  const applyFilters = (
    reservations: Reservation[],
    searchQuery: string,
    statusFilter: ReservationStatus | 'All',
    dateFilter: string | null
  ): Reservation[] => {
    return reservations.filter(reservation => {
      // Search filter
      const matchesSearch = 
        !searchQuery || 
        reservation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.phone.includes(searchQuery);
      
      // Status filter
      const matchesStatus = 
        statusFilter === 'All' || 
        reservation.status === statusFilter;
      
      // Date filter
      const matchesDate = 
        !dateFilter || 
        reservation.date === dateFilter;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };
  
  // Set up search filter
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
  
  // Set up status filter
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
  
  // Set up date filter
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
  
  // Update reservation status
  const updateReservationStatus = async (id: string, status: ReservationStatus) => {
    try {
      // Skip if already updating
      if (isUpdating[id]) return;
      
      // Set updating flag
      setIsUpdating(prev => ({ ...prev, [id]: true }));
      
      // Optimistic update
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
      
      // Send the update to the server
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`Reservation status updated to ${status}`);
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error('Failed to update reservation status');
      
      // Revert optimistic update on error
      fetchReservations();
    } finally {
      // Clear updating flag
      setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
  };
  
  // Set up realtime subscription
  useEffect(() => {
    // Initialize the reservation data
    fetchReservations();
    
    // Set up realtime subscription
    const setupRealtimeSubscription = () => {
      // Remove any existing channel
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
          
          // Format the new reservation
          const newReservation: Reservation = {
            id: payload.new.id,
            name: payload.new.name,
            phone: payload.new.phone,
            date: payload.new.date,
            timeSlot: payload.new.time_slot,
            status: payload.new.status as ReservationStatus,
            createdAt: payload.new.created_at
          };
          
          // Add the new reservation to state
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
          
          // Show notification
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
          
          // Skip if we're currently updating this reservation (to avoid duplicate updates)
          if (isUpdating[payload.new.id]) return;
          
          // Format the updated reservation
          const updatedReservation: Reservation = {
            id: payload.new.id,
            name: payload.new.name,
            phone: payload.new.phone,
            date: payload.new.date,
            timeSlot: payload.new.time_slot,
            status: payload.new.status as ReservationStatus,
            createdAt: payload.new.created_at
          };
          
          // Update the reservation in state
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
          
          // Remove the deleted reservation from state
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
    
    // Clean up subscription on unmount
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
