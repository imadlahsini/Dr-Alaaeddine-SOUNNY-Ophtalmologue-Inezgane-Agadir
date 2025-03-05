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
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCleaningUpRef = useRef(false);
  
  useEffect(() => {
    // Connection timeout to prevent being stuck in "connecting" forever
    const CONNECTION_TIMEOUT_MS = 10000; // 10 seconds timeout
    
    // Set a timeout to mark as disconnected if we don't connect within the timeout period
    connectionTimeoutRef.current = setTimeout(() => {
      if (connectionStatus === 'connecting' && !isCleaningUpRef.current) {
        console.log('Connection timeout reached, marking as disconnected');
        setConnectionStatus('disconnected');
        toast.error('Connection timeout', {
          description: 'Could not establish realtime connection. Updates may be delayed.'
        });
      }
    }, CONNECTION_TIMEOUT_MS);
    
    // Function to set up the realtime subscription
    const setupRealtimeSubscription = () => {
      // Prevent setup if we're in the process of cleaning up
      if (isCleaningUpRef.current) {
        return;
      }
      
      // Clear any previous channel before setting up a new one
      if (realtimeChannelRef.current) {
        try {
          console.log('Removing previous channel before setting up a new one');
          supabase.removeChannel(realtimeChannelRef.current);
          realtimeChannelRef.current = null;
        } catch (error) {
          console.error('Error removing previous channel:', error);
        }
      }
      
      console.log('Setting up realtime subscription for reservations...');
      
      // Create a unique channel name with timestamp to avoid conflicts
      const channelName = `reservation-changes-${Date.now()}`;
      
      // Set up the new channel
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
          
          // Clear the connection timeout since we received a response
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
          
          if (status === 'SUBSCRIBED') {
            console.log('Realtime subscription active for reservations table');
            setConnectionStatus('connected');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Failed to subscribe to realtime changes:', status);
            setConnectionStatus('disconnected');
            
            // No retry logic here - keeping it simple
            // If the user wants to retry, they can use the refresh button
            if (status === 'CHANNEL_ERROR') {
              toast.error('Failed to connect to realtime updates', {
                description: 'Status updates may not be reflected immediately. Please refresh the page.'
              });
            }
          }
        });
      
      realtimeChannelRef.current = channel;
    };
    
    // Start the subscription process immediately - no need to check if the table is in the publication
    setupRealtimeSubscription();
    
    return () => {
      // Mark that we're cleaning up to prevent new subscriptions from being created
      isCleaningUpRef.current = true;
      
      // Clear any pending timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
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
  }, [onInsert, onUpdate, onDelete, connectionStatus]);
  
  return {
    realtimeChannel: realtimeChannelRef.current,
    connectionStatus
  };
};
