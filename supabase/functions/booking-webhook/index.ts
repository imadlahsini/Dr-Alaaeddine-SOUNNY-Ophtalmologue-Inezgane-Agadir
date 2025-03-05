
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

    // IMPORTANT FIX: properly handle manual updates vs webhook updates
    if (type === 'UPDATE' && body.old) {
      const statusChanged = body.old.status !== record.status;
      
      // If this update has the manual_update flag set, it's from the dashboard UI
      if (record.manual_update === true) {
        console.log(`Manual update detected for ID ${record.id} (${body.old.status} -> ${record.status}). Processing...`);
        
        // Clear the manual_update flag but don't change the status that was manually set
        const { error } = await supabaseAdmin
          .from('reservations')
          .update({ manual_update: null })
          .eq('id', record.id);
          
        if (error) {
          console.error(`Error clearing manual_update flag: ${error.message}`);
          throw error;
        }
        
        console.log(`Cleared manual_update flag for ID: ${record.id}, preserving status: ${record.status}`);
        
        // Skip webhook processing for manual updates
        const webhookResponse = {
          success: true,
          message: 'Manual update processed, webhook notification skipped'
        };
        
        return new Response(JSON.stringify(webhookResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      // Handle external automatic updates (not from dashboard)
      const isStatusOnlyChange = 
        body.old.name === record.name && 
        body.old.phone === record.phone && 
        body.old.date === record.date && 
        body.old.time_slot === record.time_slot &&
        body.old.status !== record.status;
      
      // We consider it automatic if only status changed and manual_update is NOT true
      if (isStatusOnlyChange && record.manual_update !== true) {
        console.log(`Possible automatic status change detected (${body.old.status} -> ${record.status}). Validating...`);
        
        // IMPORTANT: Check if this update came from an external system
        console.log(`Processing external status update for ID: ${record.id}`);
      }
    }
      
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
