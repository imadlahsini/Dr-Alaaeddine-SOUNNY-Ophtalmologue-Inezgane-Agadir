import { useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { Reservation, ReservationStatus } from '../types/reservation';

interface UseReservationSubscriptionProps {
  onInsert: (reservation: Reservation) => void;
  onUpdate: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  isUpdating: Record<string, boolean>;
  localStatusUpdates: Record<string, ReservationStatus>;
}

/**
 * Hook for setting up realtime subscriptions to reservation changes
 */
export const useReservationSubscription = ({
  onInsert,
  onUpdate,
  onDelete,
  isUpdating,
  localStatusUpdates
}: UseReservationSubscriptionProps) => {
  const realtimeChannelRef = useRef<any>(null);
  
  useEffect(() => {
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
          
          onInsert(newReservation);
          
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
          
          // Protect our local status updates from being overridden by external updates
          if (localStatusUpdates[payload.new.id]) {
            console.log(`Preserving local status update for ${payload.new.id} over external update`);
            
            // If this update is clearing the manual_update flag, we should keep our local status
            // but allow the manual_update flag to be cleared
            if (payload.old.manual_update === true && payload.new.manual_update === null) {
              console.log(`Manual update flag cleared for ${payload.new.id}, but keeping local status`);
            }
            
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
          
          onUpdate(updatedReservation);
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'reservations'
        }, payload => {
          console.log('Reservation deleted:', payload);
          
          onDelete(payload.old.id);
          
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
  }, [onInsert, onUpdate, onDelete, isUpdating, localStatusUpdates]);
  
  return {
    realtimeChannel: realtimeChannelRef.current
  };
};
