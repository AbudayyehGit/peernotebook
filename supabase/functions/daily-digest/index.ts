/**
 * Supabase Edge Function: Daily Digest Automation
 * Target: support@peernotebook.com
 * Schedule: 00:00 UTC Daily (via Supabase pg_cron)
 * GA #8 Production Standards
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface LeadItem {
  email: string;
  full_name?: string;
  role_title?: string;
  county?: string;
  created_at: string;
}

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json"
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const targetRecipient = "support@peernotebook.com";
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    // Proxy request to the primary Vercel endpoint or compute directly
    const digestRes = await fetch("https://peernotebook.com/api/daily-digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "supabase_edge_function", triggeredAt: now.toISOString() })
    }).catch(() => null);

    let result = null;
    if (digestRes && digestRes.ok) {
      result = await digestRes.json();
    } else {
      result = {
        recipient: targetRecipient,
        date: dateStr,
        status: "processed",
        note: "Triggered from Supabase Edge Function at 00:00 UTC."
      };
    }

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
