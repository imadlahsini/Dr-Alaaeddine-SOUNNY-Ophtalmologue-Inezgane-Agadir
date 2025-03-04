
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
    // Log request details for debugging
    console.log("Request received:", {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
    });

    // Get the Telegram bot token and chat ID from environment variables
    // The bot token "7568197664:AAH42WusrtFjIZv3DjUfAAzz4jBLdqseD2k" should be stored as a Supabase secret
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID") || "6024686458"; // Use provided chat ID as fallback

    console.log("Request received for send-telegram function");
    console.log("Bot token configured:", !!botToken);
    console.log("Chat ID configured:", chatId);

    // Parse request body with robust error handling
    let data: TelegramRequest | null = null;
    let bodyText = "";
    
    try {
      // Get request body as text first to inspect it
      bodyText = await req.text();
      
      console.log("Raw request body length:", bodyText?.length || 0);
      if (bodyText && bodyText.length > 0) {
        // Only log a preview if body exists and is not empty
        console.log("Raw request body preview:", bodyText.substring(0, Math.min(500, bodyText.length)));
      } else {
        console.error("Empty or null request body detected");
        throw new Error("Empty request body");
      }
      
      // Try to parse JSON with additional safeguards
      try {
        if (bodyText.trim() === '') {
          throw new Error("Empty request body");
        }
        
        data = JSON.parse(bodyText);
        
        // Validate that data was parsed correctly
        if (data === null || typeof data !== 'object') {
          throw new Error("Parsed data is not an object");
        }
        
        console.log("Parsed request data:", JSON.stringify(data));
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        console.error("Failed to parse body:", bodyText);
        throw new Error(`Invalid JSON: ${jsonError.message}`);
      }
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Request parsing error: ${parseError.message}`,
          needsConfiguration: false,
          bodyPreview: bodyText ? bodyText.substring(0, 100) + "..." : "empty",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Handle configuration check request
    if (data?.checkConfig) {
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
      const missingFields = [];
      if (!data) missingFields.push("data");
      else {
        if (!data.name) missingFields.push("name");
        if (!data.phone) missingFields.push("phone");
        if (!data.date) missingFields.push("date");
        if (!data.timeSlot) missingFields.push("timeSlot");
      }
      
      console.error("Invalid data provided. Missing fields:", missingFields.join(", "));
      console.error("Received data:", data ? JSON.stringify(data) : "null");
      
      return new Response(
        JSON.stringify({
          success: false,
          message: `Invalid data provided. Missing fields: ${missingFields.join(", ")}`,
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
    console.log("Message content:", message.substring(0, 100) + "...");
    
    // Implement retry logic (up to 3 attempts)
    let attempt = 0;
    let success = false;
    let lastError = null;
    let responseText = "";
    
    while (attempt < 3 && !success) {
      attempt++;
      console.log(`Attempt ${attempt} to send Telegram notification...`);
      
      try {
        // Prepare the request body for Telegram API
        const telegramPayload = JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        });
        
        console.log(`Telegram API request payload length: ${telegramPayload.length}`);
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: telegramPayload,
        });

        responseText = await response.text();
        console.log(`Telegram API raw response (${response.status}): ${responseText}`);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error("Error parsing Telegram API response:", e);
          console.error("Raw response was:", responseText);
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
      console.error("Last API response:", responseText);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: `Failed to send Telegram notification after ${attempt} attempts: ${lastError}`,
          needsConfiguration: lastError?.includes("401") || false,
          lastResponse: responseText.substring(0, 200) + "...",
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
