
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

    // New approach: Send directly to a JSONBIN.io bin for storage
    // This is a simple, reliable way to store JSON data without complex integrations
    const JSONBIN_API_KEY = Deno.env.get('JSONBIN_API_KEY') ?? '';
    const JSONBIN_BIN_ID = Deno.env.get('JSONBIN_BIN_ID') ?? '';
    
    if (JSONBIN_API_KEY && JSONBIN_BIN_ID) {
      try {
        console.log('Sending booking data to JSONBin.io for storage');
        
        // First, get the current bin data
        const getBinResponse = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
          method: 'GET',
          headers: {
            'X-Master-Key': JSONBIN_API_KEY,
          }
        });
        
        if (!getBinResponse.ok) {
          throw new Error(`JSONBin.io GET error: ${getBinResponse.status}`);
        }
        
        const binData = await getBinResponse.json();
        const bookings = Array.isArray(binData.record) ? binData.record : [];
        
        // Add new booking and update the bin
        bookings.push({
          ...bookingData,
          timestamp: new Date().toISOString() // Add timestamp for sorting
        });
        
        const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': JSONBIN_API_KEY,
          },
          body: JSON.stringify(bookings)
        });
        
        if (!updateResponse.ok) {
          throw new Error(`JSONBin.io PUT error: ${updateResponse.status}`);
        }
        
        console.log('Successfully stored booking in JSONBin.io');
      } catch (jsonbinError) {
        console.error('Error storing data in JSONBin.io:', jsonbinError.message);
        if (jsonbinError.stack) {
          console.error('Stack trace:', jsonbinError.stack);
        }
      }
    } else {
      console.log('JSONBin.io integration disabled: missing API key or bin ID');
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
