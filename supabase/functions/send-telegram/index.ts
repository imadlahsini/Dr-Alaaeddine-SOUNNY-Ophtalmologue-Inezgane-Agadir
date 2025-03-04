
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
      console.log("Config check request received");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Configuration check completed",
          configured: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    // Format the message
    const message = `
🎉 New Reservation!

👤 Name: ${data.name}
📱 Phone: ${data.phone}
📅 Date: ${data.date}
⏰ Time: ${data.timeSlot}

This reservation is currently pending confirmation.
`;

    // Directly use the Telegram API URL as requested by the user
    const encodedMessage = encodeURIComponent(message);
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;
    
    console.log("Using direct Telegram API URL approach");
    console.log("Message to send:", message.substring(0, 100) + "...");
    
    try {
      console.log("Sending request to Telegram API...");
      const response = await fetch(telegramApiUrl);
      const responseData = await response.json();
      
      console.log("Telegram API response:", JSON.stringify(responseData));
      
      if (response.ok && responseData.ok) {
        console.log("Message sent successfully!");
        return new Response(
          JSON.stringify({
            success: true,
            message: "Telegram notification sent successfully"
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        console.error("Failed to send message:", responseData);
        return new Response(
          JSON.stringify({
            success: false,
            message: `Failed to send message: ${responseData.description || "Unknown error"}`,
            telegramResponse: responseData
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      console.error("Error sending Telegram message:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error sending Telegram message: ${error instanceof Error ? error.message : String(error)}`
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
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
