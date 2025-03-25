
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the request body
    const body = await req.json();
    const { record, type } = body;

    console.log(`Webhook received ${type} event for record:`, record);
      
    // Format the data to send to the webhook
    const bookingData = {
      id: record.id,
      name: record.name,
      phone: record.phone,
      date: record.date,
      timeSlot: record.time_slot,
      status: record.status,
      createdAt: record.created_at,
      eventType: type
    };

    // Get webhook URL from environment variable, with fallback
    const webhookUrl = Deno.env.get('WEBHOOK_URL') ?? "https://winu.app.n8n.cloud/webhook/8feeb3e5-0491-4c35-99ce-d3527c13cd59";
    
    console.log(`Sending booking data to webhook: ${webhookUrl}`);
    console.log('Booking data being sent:', JSON.stringify(bookingData));
    
    // Send to n8n webhook (existing functionality)
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook error: ${webhookResponse.status} ${await webhookResponse.text()}`);
    }

    console.log('Successfully sent booking to webhook:', await webhookResponse.text());

    // New functionality: Send to Google Sheets via Google Apps Script
    const googleAppsScriptUrl = "https://script.google.com/macros/s/AKfycbwbSbaWW__Gvi6LUMCvkHk6TWSgNzBqb9NvN4ONXckV8yg0wSXszL9sXU7HmGQMGi7X/exec";
    
    console.log(`Sending booking data to Google Sheets via Apps Script: ${googleAppsScriptUrl}`);
    
    // Format data specifically for Google Apps Script
    // Convert ALL values to strings to avoid type issues
    const sheetsData = {
      id: String(record.id),
      name: String(record.name),
      phone: String(record.phone),
      date: String(record.date),
      time_slot: String(record.time_slot), // Note: using time_slot instead of timeSlot
      status: String(record.status),
      created_at: String(record.created_at), // Note: using created_at instead of createdAt
      event_type: String(type) // Note: using event_type instead of eventType
    };
    
    try {
      console.log('Data being sent to Google Sheets:', JSON.stringify(sheetsData));
      
      // Try direct POST as form-encoded data
      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(sheetsData)) {
        formData.append(key, value);
      }
      
      console.log(`Sending data to Google Sheets as form data`);
      const googleResponse = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      const responseText = await googleResponse.text();
      console.log(`Google Sheets response status: ${googleResponse.status}`);
      console.log(`Google Sheets response: ${responseText}`);
      
      if (!googleResponse.ok) {
        console.error(`Google Sheets error: ${googleResponse.status} ${responseText}`);
      } else {
        console.log('Successfully sent booking to Google Sheets');
      }
    } catch (googleError) {
      console.error('Error sending data to Google Sheets:', googleError.message);
      if (googleError.stack) {
        console.error('Stack trace:', googleError.stack);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
