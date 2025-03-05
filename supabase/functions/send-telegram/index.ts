
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  TelegramRequest, 
  formatTelegramMessage, 
  sendTelegramMessage, 
  validateTelegramRequest,
  handleConfigCheck
} from "./telegramUtils.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Use the hardcoded bot token and chat ID as specified by the user
    const botToken = "7568197664:AAH42WusrtFjIZv3DjUfAAzz4jBLdqseD2k";
    const chatId = "6024686458";

    console.log("Using bot token:", botToken.substring(0, 10) + "...");
    console.log("Using chat ID:", chatId);

    // Parse request body with robust error handling
    let data: TelegramRequest | null = null;
    let bodyText = "";
    
    try {
      // Get request body as text first to inspect it
      bodyText = await req.text();
      
      console.log("Raw request body length:", bodyText?.length || 0);
      if (bodyText && bodyText.length > 0) {
        console.log("Raw request body preview:", bodyText.substring(0, Math.min(500, bodyText.length)));
      } else {
        console.error("Empty or null request body detected");
        throw new Error("Empty request body");
      }
      
      // Try to parse JSON
      if (bodyText.trim() === '') {
        throw new Error("Empty request body");
      }
      
      data = JSON.parse(bodyText);
      
      // Validate that data was parsed correctly
      if (data === null || typeof data !== 'object') {
        throw new Error("Parsed data is not an object");
      }
      
      console.log("Parsed request data:", JSON.stringify(data));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Request parsing error: ${parseError.message}`,
          bodyPreview: bodyText ? bodyText.substring(0, 100) + "..." : "empty"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Handle configuration check request
    if (data?.checkConfig) {
      return handleConfigCheck();
    }

    // Validate required fields
    const { isValid, missingFields } = validateTelegramRequest(data);
    if (!isValid) {
      console.error("Invalid data provided. Missing fields:", missingFields.join(", "));
      
      return new Response(
        JSON.stringify({
          success: false,
          message: `Invalid data provided. Missing fields: ${missingFields.join(", ")}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format and send the message
    const message = formatTelegramMessage(data);
    return await sendTelegramMessage(botToken, chatId, message);
    
  } catch (error) {
    console.error("Unhandled error in send-telegram function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
