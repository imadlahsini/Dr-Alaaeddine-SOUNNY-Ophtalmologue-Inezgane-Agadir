import { useState, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Reservation, ReservationStatus } from '../types/reservation';
import { toast } from 'sonner';

/**
 * Hook for managing reservation status updates
 */
export const useReservationStatusUpdate = () => {
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const localStatusUpdatesRef = useRef<Record<string, ReservationStatus>>({});
  
  /**
   * Update a reservation's status in Supabase and track local changes
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
      
      console.log(`Handling status update for reservation ${id} to ${status}`);
      
      // Track status update locally in case of network issues
      localStatusUpdatesRef.current[id] = status;
      
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
        toast.error('Failed to update status, please try again');
        throw error;
      }
      
      // Add a short delay before verifying to allow webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify the status update was successful
      const { data, error: checkError } = await supabase
        .from('reservations')
        .select('status, manual_update')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.warn('Error verifying status update:', checkError);
        toast.error('Unable to verify status update');
      } else if (data.status !== status) {
        console.warn(`Status verification failed: Database has ${data.status}, but UI expected ${status}`);
        console.log(`Keeping local status update for ${id} as ${status} despite database having ${data.status}`);
        
        // Retry the update with a stronger approach - this is a fallback
        const { error: retryError } = await supabase
          .from('reservations')
          .update({
            status,
            manual_update: true
          })
          .eq('id', id);
          
        if (retryError) {
          console.error('Error in retry update:', retryError);
        } else {
          console.log(`Retried status update for ${id}`);
          // Keep the local status reference until next verification
        }
      } else {
        console.log(`Verified: Database status for ${id} is ${data.status} as expected`);
        delete localStatusUpdatesRef.current[id];
        toast.success(`Status updated to ${status}`);
      }
      
      // Call the success callback
      onSuccess(id, status);
    } catch (error) {
      console.error('Error handling status update:', error);
      toast.error('Error updating status');
    } finally {
      setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
  };
  
  return {
    updateReservationStatus,
    isUpdating,
    localStatusUpdates: localStatusUpdatesRef.current
  };
};
