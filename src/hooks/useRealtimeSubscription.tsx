
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Reservation, transformReservationRecord } from '../utils/api';

interface UseRealtimeSubscriptionProps {
  onNewReservation: (newReservation: Reservation) => void;
  onReservationUpdate: (updatedReservation: Reservation) => void;
  onReservationDelete: (deletedId: string) => void;
}

export const useRealtimeSubscription = ({ 
  onNewReservation, 
  onReservationUpdate,
  onReservationDelete
}: UseRealtimeSubscriptionProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const channelRef = useRef<any>(null);
  const toastShownRef = useRef(false); // Prevent duplicate toasts

  useEffect(() => {
    console.log('Setting up real-time subscription hook...');
    
    const setupSubscription = () => {
      try {
        if (channelRef.current) {
          console.log('Removing existing subscription before setting up a new one');
          removeSubscription();
        }
        
        console.log('Creating new realtime channel subscription');
        const channel = supabase
          .channel('schema-db-changes')
          .on('postgres_changes', 
            {
              event: 'INSERT',
              schema: 'public',
              table: 'reservations'
            }, 
            (payload) => {
              console.log('New reservation received via real-time:', payload);
              
              if (payload.new && typeof payload.new === 'object') {
                const newReservation = transformReservationRecord(payload.new);
                if (newReservation) {
                  onNewReservation(newReservation);
                }
              }
            }
          )
          .on('postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'reservations'
            },
            (payload) => {
              console.log('Reservation update received via real-time:', payload);
              
              if (payload.new && typeof payload.new === 'object') {
                const updatedReservation = transformReservationRecord(payload.new);
                if (updatedReservation) {
                  onReservationUpdate(updatedReservation);
                }
              }
            }
          )
          .on('postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'reservations'
            },
            (payload) => {
              console.log('Reservation deletion received via real-time:', payload);
              
              if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
                const deletedId = payload.old.id as string;
                onReservationDelete(deletedId);
              }
            }
          )
          .subscribe((status) => {
            console.log('Real-time subscription status:', status);
            
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to real-time updates');
              setIsSubscribed(true);
              
              // Only show toast once per session
              if (!toastShownRef.current) {
                toast.success('Real-time updates activated');
                toastShownRef.current = true;
              }
            } else if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
              console.error('Subscription timed out');
              setIsSubscribed(false);
              toast.error('Real-time updates timed out');
              toastShownRef.current = false; // Reset so we can show again on reconnect
            } else if (status === REALTIME_SUBSCRIBE_STATES.CLOSED) {
              console.error('Subscription closed');
              setIsSubscribed(false);
              toastShownRef.current = false; // Reset so we can show again on reconnect
            } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
              console.error('Channel error occurred');
              setIsSubscribed(false);
              toast.error('Connection error with real-time service');
              toastShownRef.current = false; // Reset so we can show again on reconnect
              
              // Try to reconnect in 5 seconds
              setTimeout(() => {
                setupSubscription();
              }, 5000);
            }
          });
        
        channelRef.current = channel;
        console.log('Real-time subscription setup complete', channel);
      } catch (err) {
        console.error('Error setting up real-time subscription:', err);
        toast.error('Failed to set up real-time updates');
        setIsSubscribed(false);
        toastShownRef.current = false; // Reset so we can show again on reconnect
      }
    };

    setupSubscription();
    
    return () => {
      removeSubscription();
    };
  }, [onNewReservation, onReservationUpdate, onReservationDelete]);

  const removeSubscription = () => {
    const channel = channelRef.current;
    if (channel) {
      console.log('Removing real-time subscription...');
      supabase.removeChannel(channel)
        .then(() => {
          console.log('Real-time subscription removed successfully');
          channelRef.current = null;
          setIsSubscribed(false);
          toastShownRef.current = false; // Reset so we can show again on reconnect
        })
        .catch(err => {
          console.error('Error removing real-time subscription:', err);
        });
    }
  };

  return { isSubscribed, removeSubscription };
};
