import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// CORS configuration - CRITICAL SECURITY SETTING
const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN");
const isDevelopment = Deno.env.get("DENO_ENV") !== "production";

if (!allowedOrigin && !isDevelopment) {
  console.warn("⚠️ SECURITY WARNING: ALLOWED_ORIGIN not set in production. Using wildcard CORS (not recommended).");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin || (isDevelopment ? "*" : "*"),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusRequest {
  renderId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { renderId }: StatusRequest = await req.json();

    if (!renderId) {
      throw new Error("renderId is required");
    }

    // Get render job from database
    const { data: renderJob, error: dbError } = await supabaseClient
      .from("render_jobs")
      .select("*")
      .eq("id", renderId)
      .single();

    if (dbError) throw dbError;
    if (!renderJob) throw new Error("Render job not found");

    // If using external rendering service, check status there
    const shotstackApiKey = Deno.env.get("SHOTSTACK_API_KEY");

    if (shotstackApiKey && renderJob.external_render_id) {
      try {
        // Use stage endpoint for development, switch to v1 for production
        const shotstackResponse = await fetch(
          `https://api.shotstack.io/stage/render/${renderJob.external_render_id}`,
          {
            headers: {
              "x-api-key": shotstackApiKey,
              "Accept": "application/json",
            },
          }
        );

        if (!shotstackResponse.ok) {
          throw new Error(`Shotstack status check failed: ${shotstackResponse.status}`);
        }

        const shotstackData = await shotstackResponse.json();

        if (shotstackData.success && shotstackData.response) {
          const externalStatus = shotstackData.response.status;
          const externalProgress = shotstackData.response.progress || 0;

          // Map Shotstack status to our status
          let status = "processing";
          let videoUrl = null;

          if (externalStatus === "done") {
            status = "done";
            videoUrl = shotstackData.response.url;
          } else if (externalStatus === "failed") {
            status = "failed";
          } else if (externalStatus === "rendering") {
            status = "processing";
          }

          // Update database with latest status
          await supabaseClient
            .from("render_jobs")
            .update({
              status: status,
              progress: Math.round(externalProgress * 100),
              video_url: videoUrl,
              completed_at: status === "done" ? new Date().toISOString() : null,
            })
            .eq("id", renderId);

          return new Response(
            JSON.stringify({
              status: status,
              progress: Math.round(externalProgress * 100),
              videoUrl: videoUrl,
              renderId: renderId,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }
      } catch (error) {
        console.error("Error checking Shotstack status:", error);
        // Fall through to use database status
      }
    }

    // Return database status
    return new Response(
      JSON.stringify({
        status: renderJob.status,
        progress: renderJob.progress || 0,
        videoUrl: renderJob.video_url,
        renderId: renderId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-render-status:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
