
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
  
  // Prevent multiple toast notifications using session storage
  // instead of refs which don't persist between page refreshes
  const hasShownToast = () => {
    return sessionStorage.getItem('realtime_toast_shown') === 'true';
  };
  
  const markToastShown = () => {
    sessionStorage.setItem('realtime_toast_shown', 'true');
    
    // Clear the toast flag after 1 hour to avoid permanent blocking
    setTimeout(() => {
      sessionStorage.removeItem('realtime_toast_shown');
    }, 60 * 60 * 1000); // 1 hour
  };

  useEffect(() => {
    // Prevent setting up multiple subscriptions
    const setupId = Math.random().toString(36).substring(7);
    console.log(`Setting up real-time subscription hook... (ID: ${setupId})`);
    
    const setupSubscription = () => {
      try {
        if (channelRef.current) {
          console.log('Removing existing subscription before setting up a new one');
          removeSubscription();
        }
        
        console.log(`Creating new realtime channel subscription (ID: ${setupId})`);
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
            console.log(`Real-time subscription status (ID: ${setupId}):`, status);
            
            if (status === 'SUBSCRIBED') {
              console.log(`Successfully subscribed to real-time updates (ID: ${setupId})`);
              setIsSubscribed(true);
              
              // Only show toast once per session using session storage
              if (!hasShownToast()) {
                toast.success('Real-time updates activated');
                markToastShown();
              }
            } else if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
              console.error('Subscription timed out');
              setIsSubscribed(false);
              sessionStorage.removeItem('realtime_toast_shown');
            } else if (status === REALTIME_SUBSCRIBE_STATES.CLOSED) {
              console.error('Subscription closed');
              setIsSubscribed(false);
              sessionStorage.removeItem('realtime_toast_shown');
            } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
              console.error('Channel error occurred');
              setIsSubscribed(false);
              toast.error('Connection error with real-time service');
              sessionStorage.removeItem('realtime_toast_shown');
              
              // Try to reconnect in 5 seconds
              setTimeout(() => {
                if (document.visibilityState !== 'hidden') {
                  console.log('Attempting to reconnect after error...');
                  setupSubscription();
                }
              }, 5000);
            }
          });
        
        channelRef.current = channel;
        console.log(`Real-time subscription setup complete (ID: ${setupId})`, channel);
      } catch (err) {
        console.error(`Error setting up real-time subscription (ID: ${setupId}):`, err);
        toast.error('Failed to set up real-time updates');
        setIsSubscribed(false);
        sessionStorage.removeItem('realtime_toast_shown');
      }
    };

    // Only set up subscription if document is visible
    if (document.visibilityState !== 'hidden') {
      setupSubscription();
    }
    
    // Handle visibility changes to reconnect when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !channelRef.current) {
        console.log('Tab became visible, setting up real-time subscription...');
        setupSubscription();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        })
        .catch(err => {
          console.error('Error removing real-time subscription:', err);
        });
    }
  };

  return { isSubscribed, removeSubscription };
};
