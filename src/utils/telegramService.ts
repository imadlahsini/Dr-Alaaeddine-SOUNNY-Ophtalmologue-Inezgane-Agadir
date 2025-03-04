
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
  needsConfiguration?: boolean;
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
    
    // Call the Supabase Edge Function with proper parameters
    const startTime = Date.now();
    
    // The issue is here - we were using an 'options' property which doesn't exist
    // in the FunctionInvokeOptions type. We need to use only supported parameters.
    const { data, error } = await supabase.functions.invoke("send-telegram", {
      body: reservationData,
      // Removing the 'options' object as it's causing the TypeScript error
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const endTime = Date.now();
    console.log(`Edge function call completed in ${endTime - startTime}ms`);
    
    if (error) {
      console.error("Error calling Supabase Edge Function:", error);
      return {
        success: false,
        message: error.message || "Error sending notification",
        needsConfiguration: error.message?.includes("not configured") || false
      };
    }
    
    console.log("Received response from Edge Function:", data);
    
    // Return the result from the Edge Function
    return {
      success: !!data?.success,
      message: data?.message || "Unknown response from notification service",
      needsConfiguration: !!data?.needsConfiguration
    };
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      needsConfiguration: false
    };
  }
};

/**
 * Checks if Telegram notification is configured
 * Returns true if the bot token is configured
 */
export const checkTelegramConfig = async (): Promise<{
  configured: boolean;
  message: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke("send-telegram", {
      body: { checkConfig: true }
    });
    
    if (error) {
      console.error("Error checking Telegram configuration:", error);
      return { 
        configured: false, 
        message: error.message || "Error checking configuration" 
      };
    }
    
    return { 
      configured: !!data?.configured,
      message: data?.message || "Configuration check completed"
    };
  } catch (error) {
    console.error("Error checking Telegram configuration:", error);
    return {
      configured: false,
      message: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
