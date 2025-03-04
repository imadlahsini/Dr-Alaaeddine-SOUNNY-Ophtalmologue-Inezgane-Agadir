
/**
 * Telegram Notification Service
 * Sends notifications to Telegram when new reservations are made
 * Uses a Supabase Edge Function for secure API communication
 */

import { supabase } from '../utils/api';

interface ReservationData {
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
}

interface TelegramResult {
  success: boolean;
  message: string;
  needsConfiguration: boolean;
}

/**
 * Sends a notification to Telegram about a new reservation
 * Uses a Supabase Edge Function for secure API communication
 */
export const sendTelegramNotification = async (
  reservationData: ReservationData
): Promise<TelegramResult> => {
  try {
    // Validate reservation data
    if (!reservationData || !reservationData.name || !reservationData.phone) {
      console.error("Invalid reservation data provided:", reservationData);
      return {
        success: false,
        message: "Invalid reservation data provided",
        needsConfiguration: false
      };
    }

    console.log("Sending notification via Supabase Edge Function:", reservationData);
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("send-telegram", {
      body: reservationData
    });
    
    if (error) {
      console.error("Error calling Supabase Edge Function:", error);
      return {
        success: false,
        message: error.message || "Error sending notification",
        needsConfiguration: error.message?.includes("not configured") || false
      };
    }
    
    // Return the result from the Edge Function
    return data as TelegramResult;
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      needsConfiguration: false
    };
  }
};
