
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { Reservation, ReservationStatus } from '../types/reservation';
import { useReservationSubscription } from './useReservationSubscription';

/**
 * Main dashboard hook that combines reservation fetching, filtering, and realtime updates
 */
export const useDashboard = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  /**
   * Fetch reservations from Supabase and apply filters
   */
  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching reservations from database...');
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Raw reservation data from Supabase:', data);
      
      const processedReservations: Reservation[] = data.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        date: item.date,
        timeSlot: item.time_slot,
        status: item.status as ReservationStatus, // Cast the status to ReservationStatus type
        createdAt: item.created_at
      }));
      
      setReservations(processedReservations);
      applyFilters(processedReservations, searchQuery);
      setIsLoading(false);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Failed to load reservations');
      setIsLoading(false);
      toast.error('Failed to load reservations');
    }
  }, [searchQuery]);
  
  // Apply filters based on search query
  const applyFilters = (reservationList: Reservation[], query: string) => {
    if (!query) {
      setFilteredReservations(reservationList);
      return;
    }
    
    const filtered = reservationList.filter(reservation => {
      return reservation.name.toLowerCase().includes(query.toLowerCase()) ||
             reservation.phone.includes(query);
    });
    
    setFilteredReservations(filtered);
  };
  
  // Manual refresh function
  const refreshData = useCallback(() => {
    fetchReservations();
  }, [fetchReservations]);
  
  // Set up realtime subscription
  useReservationSubscription({
    onInsert: (newReservation) => {
      setReservations(prev => {
        const updatedReservations = [newReservation, ...prev];
        applyFilters(updatedReservations, searchQuery);
        return updatedReservations;
      });
    },
    onUpdate: (updatedReservation) => {
      setReservations(prev => {
        const updatedReservations = prev.map(reservation => 
          reservation.id === updatedReservation.id ? updatedReservation : reservation
        );
        applyFilters(updatedReservations, searchQuery);
        return updatedReservations;
      });
    },
    onDelete: (id) => {
      setReservations(prev => {
        const updatedReservations = prev.filter(
          reservation => reservation.id !== id
        );
        applyFilters(updatedReservations, searchQuery);
        return updatedReservations;
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
  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    applyFilters(reservations, query);
  };
  
  return {
    reservations,
    filteredReservations,
    searchQuery,
    isLoading,
    error,
    lastRefreshed,
    setSearchQuery: handleSetSearchQuery,
    refreshData
  };
};

export type { Reservation } from '../types/reservation';
