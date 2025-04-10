
import { useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { Reservation, ReservationStatus } from '../types/reservation';

interface UseReservationSubscriptionProps {
  onInsert: (reservation: Reservation) => void;
  onUpdate: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
}

/**
 * Hook for setting up realtime subscriptions to reservation changes
 */
export const useReservationSubscription = ({
  onInsert,
  onUpdate,
  onDelete
}: UseReservationSubscriptionProps) => {
  const realtimeChannelRef = useRef<any>(null);
  
  useEffect(() => {
    console.log('Setting up realtime subscription for reservations...');
    
    // Create a unique channel name with timestamp to avoid conflicts
    const channelName = `reservation-changes-${Date.now()}`;
    
    // Set up the new channel with specific filters for each event type
    const channel = supabase
      .channel(channelName)
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
        console.log('Reservation updated via realtime:', payload);
        
        // Create a proper Reservation object from the payload
        const updatedReservation: Reservation = {
          id: payload.new.id,
          name: payload.new.name,
          phone: payload.new.phone,
          date: payload.new.date,
          timeSlot: payload.new.time_slot,
          status: payload.new.status as ReservationStatus,
          createdAt: payload.new.created_at
        };
        
        console.log(`Calling onUpdate for reservation ${updatedReservation.id}`);
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
      .subscribe((status) => {
        console.log(`Realtime subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error connecting to realtime changes');
          toast.error('Connection error, updates may be delayed');
        }
      });
    
    realtimeChannelRef.current = channel;
    
    return () => {
      // Clean up the channel
      if (realtimeChannelRef.current) {
        console.log('Cleaning up realtime subscription');
        try {
          supabase.removeChannel(realtimeChannelRef.current);
          realtimeChannelRef.current = null;
        } catch (error) {
          console.error('Error cleaning up realtime subscription:', error);
        }
      }
    };
  }, [onInsert, onUpdate, onDelete]);
  
  return {
    realtimeChannel: realtimeChannelRef.current
  };
};
