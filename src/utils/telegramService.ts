
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

    // Ensure all required fields are provided and are strings
    const safeData = {
      name: String(reservationData.name || ""),
      phone: String(reservationData.phone || ""),
      date: String(reservationData.date || ""),
      timeSlot: String(reservationData.timeSlot || "")
    };

    // Stringifying with careful error handling
    let payload;
    try {
      payload = JSON.stringify(safeData);
      console.log("Prepared notification payload:", payload);
      console.log("Payload length:", payload.length);
    } catch (err) {
      console.error("Error stringifying payload:", err);
      return {
        success: false,
        message: "Error preparing notification data",
        needsConfiguration: false
      };
    }
    
    // Call the Supabase Edge Function with proper parameters
    const startTime = Date.now();
    
    console.log("Invoking edge function with content type:", 'application/json');
    const { data, error } = await supabase.functions.invoke("send-telegram", {
      body: payload,
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: errorMessage || "Unknown error",
      needsConfiguration: errorMessage.includes("not configured") || false
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
    const configCheckPayload = JSON.stringify({ checkConfig: true });
    console.log("Checking configuration with payload:", configCheckPayload);
    
    const { data, error } = await supabase.functions.invoke("send-telegram", {
      body: configCheckPayload,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (error) {
      console.error("Error checking Telegram configuration:", error);
      return { 
        configured: false, 
        message: error.message || "Error checking configuration" 
      };
    }
    
    console.log("Configuration check response:", data);
    
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
