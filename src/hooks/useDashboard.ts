
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Reservation, 
  ReservationStatus, 
  DashboardState 
} from '../types/reservation';
import { calculateStats, applyFilters } from '../utils/reservationUtils';
import { useReservationSubscription } from './useReservationSubscription';

/**
 * Main dashboard hook that combines reservation fetching, filtering, and realtime updates
 */
export const useDashboard = () => {
  const [state, setState] = useState<DashboardState>({
    reservations: [],
    filteredReservations: [],
    stats: { total: 0, confirmed: 0, pending: 0, canceled: 0, notResponding: 0 },
    searchQuery: '',
    statusFilter: 'All',
    isLoading: true,
    error: null,
    lastRefreshed: null
  });
  
  /**
   * Fetch reservations from Supabase and apply filters
   */
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
      
      const reservations: Reservation[] = data.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        date: item.date,
        timeSlot: item.time_slot,
        status: item.status as ReservationStatus,
        createdAt: item.created_at
      }));
      
      console.log('Processed reservations with statuses:', 
        reservations.map(r => ({ id: r.id, name: r.name, status: r.status })));
      
      const stats = calculateStats(reservations);
      
      const filtered = applyFilters(
        reservations, 
        state.searchQuery, 
        state.statusFilter
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
  }, [state.searchQuery, state.statusFilter]);
  
  // Manual refresh function
  const refreshData = useCallback(() => {
    fetchReservations();
  }, [fetchReservations]);
  
  // Set up realtime subscription
  useReservationSubscription({
    onInsert: (newReservation) => {
      setState(prev => {
        const updatedReservations = [newReservation, ...prev.reservations];
        
        return {
          ...prev,
          reservations: updatedReservations,
          filteredReservations: applyFilters(
            updatedReservations,
            prev.searchQuery,
            prev.statusFilter
          ),
          stats: calculateStats(updatedReservations)
        };
      });
    },
    onUpdate: (updatedReservation) => {
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
            prev.statusFilter
          ),
          stats: calculateStats(updatedReservations)
        };
      });
    },
    onDelete: (id) => {
      setState(prev => {
        const updatedReservations = prev.reservations.filter(
          reservation => reservation.id !== id
        );
        
        return {
          ...prev,
          reservations: updatedReservations,
          filteredReservations: applyFilters(
            updatedReservations,
            prev.searchQuery,
            prev.statusFilter
          ),
          stats: calculateStats(updatedReservations)
        };
      });
    }
  });
  
  // Fetch reservations on initial load
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);
  
  /**
   * Update search query and filter reservations
   */
  const setSearchQuery = (query: string) => {
    setState(prev => {
      const filtered = applyFilters(
        prev.reservations,
        query,
        prev.statusFilter
      );
      
      return {
        ...prev,
        searchQuery: query,
        filteredReservations: filtered
      };
    });
  };
  
  /**
   * Update status filter and filter reservations
   */
  const setStatusFilter = (status: ReservationStatus | 'All') => {
    setState(prev => {
      const filtered = applyFilters(
        prev.reservations,
        prev.searchQuery,
        status
      );
      
      return {
        ...prev,
        statusFilter: status,
        filteredReservations: filtered
      };
    });
  };
  
  return {
    ...state,
    setSearchQuery,
    setStatusFilter,
    refreshData
  };
};

export type { ReservationStatus, Reservation } from '../types/reservation';
