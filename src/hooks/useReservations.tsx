
import { useState } from 'react';
import { toast } from 'sonner';
import { fetchReservations, updateReservationStatus, createReservation } from '../utils/api';
import { Reservation } from '../types/reservation';

export const useReservations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchReservations();
      
      if (result.success && result.data) {
        setReservations(result.data);
      } else {
        setError(result.message || 'Unknown error');
        toast.error(result.message || 'Failed to load reservations');
      }
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError('Failed to load reservations');
      toast.error('Failed to load reservations');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Reservation['status']) => {
    try {
      const result = await updateReservationStatus(id, status);
      
      if (result.success) {
        // Update local state (though real-time subscription should handle this)
        setReservations(prevReservations => 
          prevReservations.map(reservation => 
            reservation.id === id 
              ? { ...reservation, status } 
              : reservation
          )
        );
        
        toast.success(result.message);
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (err) {
      console.error('Error updating reservation status:', err);
      toast.error('Failed to update reservation status');
      return false;
    }
  };

  return {
    reservations,
    isLoading,
    error,
    loadReservations,
    updateStatus
  };
};
