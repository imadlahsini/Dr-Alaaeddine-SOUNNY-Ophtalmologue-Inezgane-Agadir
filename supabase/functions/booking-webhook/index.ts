
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

    // Use the new Make.com webhook URL
    const webhookUrl = "https://hook.eu2.make.com/9c4dr3a86xj41ela17ayumkauefcsmgt";
    
    console.log(`Sending booking data to Make.com webhook: ${webhookUrl}`);
    console.log('Booking data being sent:', JSON.stringify(bookingData));
    
    // Send to Make.com webhook
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

    console.log('Successfully sent booking to Make.com webhook:', await webhookResponse.text());

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
