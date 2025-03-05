import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

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
  const localStatusUpdatesRef = useRef<Record<string, ReservationStatus>>({});
  
  const fetchReservations = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Fetching reservations from database...');
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Raw reservation data from Supabase:', data);
      
      const reservations: Reservation[] = data.map(item => {
        const id = item.id;
        const localStatus = localStatusUpdatesRef.current[id];
        const finalStatus = localStatus || item.status as ReservationStatus;
        
        return {
          id,
          name: item.name,
          phone: item.phone,
          date: item.date,
          timeSlot: item.time_slot,
          status: finalStatus,
          createdAt: item.created_at
        };
      });
      
      console.log('Processed reservations with statuses:', 
        reservations.map(r => ({ id: r.id, name: r.name, status: r.status })));
      
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
      
      localStatusUpdatesRef.current = {};
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
      if (isUpdating[id]) {
        console.log(`Skipping update for ${id} as it's already in progress`);
        return;
      }
      
      setIsUpdating(prev => ({ ...prev, [id]: true }));
      
      console.log(`Handling status update for reservation ${id} to ${status} in useDashboard`);
      
      setState(prev => {
        const updatedReservations = prev.reservations.map(reservation => 
          reservation.id === id ? { ...reservation, status } : reservation
        );
        
        const updatedFiltered = applyFilters(
          updatedReservations,
          prev.searchQuery,
          prev.statusFilter,
          prev.dateFilter
        );
        
        return {
          ...prev,
          reservations: updatedReservations,
          filteredReservations: updatedFiltered,
          stats: calculateStats(updatedReservations)
        };
      });
      
      localStatusUpdatesRef.current[id] = status;
      
      const { error } = await supabase
        .from('reservations')
        .update({
          status,
          manual_update: true
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating status in Supabase:', error);
        toast.error('Failed to update status, please try again');
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data, error: checkError } = await supabase
        .from('reservations')
        .select('status, manual_update')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.warn('Error verifying status update:', checkError);
      } else if (data.status !== status) {
        console.warn(`Status verification failed: Database has ${data.status}, but UI expected ${status}`);
        console.log(`Keeping local status update for ${id} as ${status} despite database having ${data.status}`);
      } else {
        console.log(`Verified: Database status for ${id} is ${data.status} as expected`);
        delete localStatusUpdatesRef.current[id];
      }
    } catch (error) {
      console.error('Error handling status update in useDashboard:', error);
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
      
      console.log('Setting up realtime subscription for reservations...');
      
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
          
          if (isUpdating[payload.new.id]) {
            console.log(`Ignoring external update for ${payload.new.id} as it was triggered locally`);
            return;
          }
          
          if (localStatusUpdatesRef.current[payload.new.id]) {
            console.log(`Preserving local status update for ${payload.new.id} over external update`);
            return;
          }
          
          const updatedReservation: Reservation = {
            id: payload.new.id,
            name: payload.new.name,
            phone: payload.new.phone,
            date: payload.new.date,
            timeSlot: payload.new.time_slot,
            status: payload.new.status as ReservationStatus,
            createdAt: payload.new.created_at
          };
          
          console.log(`External update for reservation ${updatedReservation.id}, new status: ${updatedReservation.status}`);
          
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
            console.log('Realtime subscription active for reservations table');
          }
        });
      
      realtimeChannelRef.current = channel;
    };
    
    setupRealtimeSubscription();
    
    return () => {
      if (realtimeChannelRef.current) {
        console.log('Cleaning up realtime subscription');
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
