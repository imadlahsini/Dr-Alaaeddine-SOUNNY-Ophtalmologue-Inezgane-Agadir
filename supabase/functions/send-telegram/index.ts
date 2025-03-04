
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for the request body
interface TelegramRequest {
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  checkConfig?: boolean;
}

// Main handler function
serve(async (req) => {
  // Handle preflight CORS request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Telegram bot token from environment variable
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID") || "1741098686";

    console.log("Request received for send-telegram function");

    // Parse request body
    const data: TelegramRequest = await req.json();
    
    // Handle configuration check request
    if (data.checkConfig) {
      console.log("Config check request received");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Configuration check completed",
          configured: !!botToken
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!botToken) {
      console.error("Telegram bot token not configured");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Telegram bot token not configured",
          needsConfiguration: true,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Bot token is configured. Chat ID:", chatId);

    // Validate required fields
    if (!data || !data.name || !data.phone || !data.date || !data.timeSlot) {
      console.error("Invalid data provided:", data);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid data provided. Required fields: name, phone, date, timeSlot",
          needsConfiguration: false,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format the message
    const message = `
<b>🎉 New Reservation!</b>

<b>👤 Name:</b> ${data.name}
<b>📱 Phone:</b> ${data.phone}
<b>📅 Date:</b> ${data.date}
<b>⏰ Time:</b> ${data.timeSlot}

<i>This reservation is currently pending confirmation.</i>
`;

    // Send message to Telegram
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    console.log(`Sending Telegram notification to chat ID: ${chatId}`);
    
    // Implement retry logic (up to 3 attempts)
    let attempt = 0;
    let success = false;
    let lastError = null;
    
    while (attempt < 3 && !success) {
      attempt++;
      console.log(`Attempt ${attempt} to send Telegram notification...`);
      
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
          }),
        });

        const responseText = await response.text();
        console.log(`Telegram API raw response: ${responseText}`);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error("Error parsing Telegram API response:", e);
          responseData = { ok: false, description: "Invalid JSON response" };
        }
        
        if (response.ok && responseData.ok) {
          success = true;
          console.log("Telegram notification sent successfully!");
        } else {
          lastError = responseData.description || `HTTP Error: ${response.status}`;
          console.error(`Failed to send Telegram notification (Attempt ${attempt}):`, lastError);
          
          // If it's an authentication error, don't retry
          if (responseData.error_code === 401) {
            console.error("Authentication error with Telegram API. Won't retry.");
            break;
          }
          
          // Add a small delay before retrying
          if (attempt < 3) {
            console.log(`Waiting before retry attempt ${attempt + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        lastError = error.message || "Network error";
        console.error(`Error during Telegram API request (Attempt ${attempt}):`, error);
        
        // Add a small delay before retrying
        if (attempt < 3) {
          console.log(`Waiting before retry attempt ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Return the result
    if (success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Telegram notification sent successfully",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      console.error(`Failed to send Telegram notification after ${attempt} attempts: ${lastError}`);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Failed to send Telegram notification after ${attempt} attempts: ${lastError}`,
          needsConfiguration: lastError?.includes("401") || false,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Unhandled error in send-telegram function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        needsConfiguration: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
