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

interface RenderRequest {
  scenes: Array<{
    id: string;
    imageUrl: string;
    duration: number;
    transition: string;
    order: number;
  }>;
  audioUrl: string | null;
  settings: {
    resolution: "1080p" | "4k";
    fps: 30 | 60;
  };
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

    const { scenes, audioUrl, settings }: RenderRequest = await req.json();

    // Validate input
    if (!scenes || scenes.length === 0) {
      throw new Error("Scenes are required");
    }

    // Calculate total duration
    const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

    // Generate unique render ID
    const renderId = crypto.randomUUID();

    // Create render job in database
    const { error: dbError } = await supabaseClient
      .from("render_jobs")
      .insert({
        id: renderId,
        status: "processing",
        progress: 0,
        scenes: scenes,
        audio_url: audioUrl,
        resolution: settings.resolution,
        fps: settings.fps,
        total_duration: totalDuration,
        created_at: new Date().toISOString(),
      });

    if (dbError) throw dbError;

    // Start background rendering process
    // Note: In a production environment, you would trigger an async job here
    // Options include:
    // 1. Use a video rendering API (Shotstack, Remotion Lambda, etc.)
    // 2. Use a job queue (Supabase Edge Functions with long-running tasks)
    // 3. Use a separate video processing service

    // Example: Using Shotstack API (you'll need to add SHOTSTACK_API_KEY to your secrets)
    const shotstackApiKey = Deno.env.get("SHOTSTACK_API_KEY");

    if (shotstackApiKey) {
      try {
        // Build Shotstack timeline
        const timeline = buildShotstackTimeline(scenes, audioUrl, settings);

        console.log("Submitting render to Shotstack...");
        const shotstackResponse = await fetch("https://api.shotstack.io/stage/render", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": shotstackApiKey,
          },
          body: JSON.stringify({
            timeline,
            output: {
              format: "mp4",
              resolution: settings.resolution === "4k" ? "uhd" : "hd",
              fps: settings.fps,
              quality: "high",
            },
          }),
        });

        if (!shotstackResponse.ok) {
          const errorText = await shotstackResponse.text();
          throw new Error(`Shotstack API error (${shotstackResponse.status}): ${errorText}`);
        }

        const shotstackData = await shotstackResponse.json();

        if (shotstackData.success && shotstackData.response?.id) {
          // Update render job with external render ID
          await supabaseClient
            .from("render_jobs")
            .update({
              external_render_id: shotstackData.response.id,
              status: "processing"
            })
            .eq("id", renderId);

          console.log(`✓ Shotstack render started with ID: ${shotstackData.response.id}`);
        } else {
          throw new Error("Invalid Shotstack response structure");
        }
      } catch (shotstackError) {
        console.error("Shotstack API error:", shotstackError);
        // Update render job to failed status
        await supabaseClient
          .from("render_jobs")
          .update({
            status: "failed",
            error_message: shotstackError.message
          })
          .eq("id", renderId);
        throw shotstackError;
      }
    } else {
      // Mock rendering for development/testing
      // Simulate processing by updating progress over time (fire and forget)
      simulateRenderProgress(supabaseClient, renderId, totalDuration).catch(err =>
        console.error('Simulation error:', err)
      );
    }

    return new Response(
      JSON.stringify({
        status: "processing",
        renderId: renderId,
        message: "Video rendering started",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in render-video:", error);
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

function buildShotstackTimeline(scenes: any[], audioUrl: string | null, settings: any) {
  // Map transition names to Shotstack transition types
  const transitionMap: Record<string, string> = {
    'fade': 'fade',
    'dissolve': 'fade', // Shotstack uses 'fade' for dissolve
    'cut': 'none',
    'wipe': 'wipe',
    'slide': 'slideLeft',
  };

  let currentTime = 0;
  const clips = scenes
    .sort((a, b) => a.order - b.order) // Ensure scenes are in correct order
    .map((scene, index) => {
      const clip = {
        asset: {
          type: "image" as const,
          src: scene.imageUrl,
        },
        start: currentTime,
        length: scene.duration,
        fit: "cover" as const,
        scale: 1,
        position: "center" as const,
        transition: {
          in: index === 0 ? "fade" : (transitionMap[scene.transition] || "fade"),
          out: "none" as const,
        },
      };

      currentTime += scene.duration;
      return clip;
    });

  const tracks: any[] = [
    {
      clips: clips,
    },
  ];

  // Add audio track if provided
  if (audioUrl) {
    tracks.push({
      clips: [
        {
          asset: {
            type: "audio",
            src: audioUrl,
            volume: 1.0,
          },
          start: 0,
          length: currentTime,
        },
      ],
    });
  }

  return {
    background: "#000000",
    tracks: tracks,
  };
}

async function simulateRenderProgress(supabaseClient: any, renderId: string, totalDuration: number) {
  // This is a mock function for development
  // In production, this would be handled by the actual rendering service

  // Simulate completion after a delay (not recommended for production)
  // You would typically use a webhook or polling mechanism instead
  setTimeout(async () => {
    await supabaseClient
      .from("render_jobs")
      .update({
        status: "completed",
        progress: 100,
        video_url: `https://example.com/renders/${renderId}.mp4`, // Mock URL
        completed_at: new Date().toISOString(),
      })
      .eq("id", renderId);
  }, 10000); // Simulate 10 second render
}
