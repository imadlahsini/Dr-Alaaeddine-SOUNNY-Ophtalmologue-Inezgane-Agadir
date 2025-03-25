
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
    
    // Simplified data format for Google Sheets to ensure compatibility
    const sheetsData = {
      id: record.id,
      name: record.name,
      phone: record.phone,
      date: record.date,
      timeSlot: record.time_slot,
      status: record.status,
      createdAt: new Date(record.created_at).toISOString(),
      eventType: type
    };
    
    try {
      console.log('Data being sent to Google Sheets:', JSON.stringify(sheetsData));
      
      const googleSheetsResponse = await fetch(googleAppsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetsData),
        redirect: 'follow',
      });
      
      const responseText = await googleSheetsResponse.text();
      console.log(`Google Sheets response status: ${googleSheetsResponse.status}`);
      console.log(`Google Sheets response body: ${responseText}`);
      
      if (!googleSheetsResponse.ok) {
        console.error(`Google Sheets error: ${googleSheetsResponse.status} ${responseText}`);
      } else {
        console.log('Successfully sent booking to Google Sheets:', responseText);
      }
    } catch (googleError) {
      // Log detailed error but don't fail the entire function
      console.error('Error sending data to Google Sheets:', googleError);
      console.error('Error details:', googleError.message);
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
