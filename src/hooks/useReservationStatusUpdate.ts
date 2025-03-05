
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { ReservationStatus } from '../types/reservation';
import { toast } from 'sonner';

/**
 * Hook for managing reservation status updates - simplified version
 */
export const useReservationStatusUpdate = () => {
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  
  /**
   * Update a reservation's status in Supabase
   */
  const updateReservationStatus = async (
    id: string, 
    status: ReservationStatus,
    onSuccess: (id: string, status: ReservationStatus) => void
  ) => {
    try {
      if (isUpdating[id]) {
        console.log(`Skipping update for ${id} as it's already in progress`);
        return;
      }
      
      setIsUpdating(prev => ({ ...prev, [id]: true }));
      
      console.log(`Updating reservation ${id} to ${status}`);
      
      // Set manual_update flag to true to indicate this is a UI-driven update
      const { error } = await supabase
        .from('reservations')
        .update({
          status,
          manual_update: true
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating status in Supabase:', error);
        toast.error('Failed to update status');
        throw error;
      }
      
      // Call the success callback immediately for responsiveness
      onSuccess(id, status);
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error handling status update:', error);
      toast.error('Error updating status');
    } finally {
      setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
  };
  
  return {
    updateReservationStatus,
    isUpdating
  };
};
