
import { supabase } from './client';

/**
 * Enables realtime functionality for the reservations table
 * This only needs to be called once during app initialization
 */
export const enableRealtimeForReservations = async () => {
  try {
    // Call the Supabase function to enable realtime for the reservations table
    const { error } = await supabase.rpc('enable_realtime_for_table', {
      table_name: 'reservations'
    });
    
    if (error) {
      console.error('Error enabling realtime for reservations:', error);
      return false;
    }
    
    console.log('Successfully enabled realtime for reservations table');
    return true;
  } catch (error) {
    console.error('Failed to enable realtime for reservations:', error);
    return false;
  }
};
