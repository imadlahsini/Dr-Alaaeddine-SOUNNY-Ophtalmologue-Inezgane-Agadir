
import { useEffect, useRef, useState } from 'react';
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRY_ATTEMPTS = 5;
  
  useEffect(() => {
    const setupRealtimeSubscription = () => {
      // Clear any previous channel
      if (realtimeChannelRef.current) {
        try {
          supabase.removeChannel(realtimeChannelRef.current);
        } catch (error) {
          console.error('Error removing previous channel:', error);
        }
      }
      
      setConnectionStatus('connecting');
      console.log('Setting up realtime subscription for reservations...');
      
      // Set up the new channel
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
          
          // Show a status update notification if status changed
          if (payload.old.status !== payload.new.status) {
            console.log(`Status changed: ${payload.old.status} → ${payload.new.status}`);
            toast.info(`Reservation status updated`, {
              description: `${updatedReservation.name}: ${payload.old.status} → ${payload.new.status}`
            });
          }
          
          console.log(`Calling onUpdate for reservation ${updatedReservation.id}, status: ${updatedReservation.status}`);
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
            setConnectionStatus('connected');
            retryCountRef.current = 0; // Reset retry counter on successful connection
            
            // Clear any pending retry attempts
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
              retryTimeoutRef.current = null;
            }
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to realtime changes:', status);
            setConnectionStatus('disconnected');
            
            // Retry logic with exponential backoff
            if (retryCountRef.current < MAX_RETRY_ATTEMPTS) { // Maximum 5 retry attempts
              const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000); // Max 30s delay
              console.log(`Will retry connection in ${retryDelay}ms (attempt ${retryCountRef.current + 1}/${MAX_RETRY_ATTEMPTS})`);
              
              retryTimeoutRef.current = setTimeout(() => {
                console.log(`Retrying connection (attempt ${retryCountRef.current + 1}/${MAX_RETRY_ATTEMPTS})...`);
                retryCountRef.current += 1;
                setupRealtimeSubscription();
              }, retryDelay);
            } else {
              toast.error('Failed to connect to realtime updates', {
                description: 'Status updates may not be reflected immediately. Please refresh the page.'
              });
            }
          }
        });
      
      realtimeChannelRef.current = channel;
    };
    
    setupRealtimeSubscription();
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      if (realtimeChannelRef.current) {
        console.log('Cleaning up realtime subscription');
        try {
          supabase.removeChannel(realtimeChannelRef.current);
        } catch (error) {
          console.error('Error cleaning up realtime subscription:', error);
        }
      }
    };
  }, [onInsert, onUpdate, onDelete]);
  
  return {
    realtimeChannel: realtimeChannelRef.current,
    connectionStatus
  };
};
