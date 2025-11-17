import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// PRODUCTION: Set ALLOWED_ORIGIN environment variable to your domain (e.g., "https://yourdomain.com")
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VoiceoverRequest {
  text: string;
  voiceStyle: 'dramatic' | 'neutral' | 'mysterious';
  speed: number;
  pitch: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, voiceStyle, speed, pitch }: VoiceoverRequest = await req.json();

    if (!text || text.length < 100) {
      throw new Error("Text is required (minimum 100 characters)");
    }

    // Calculate estimated duration based on word count and speed
    const wordCount = text.trim().split(/\s+/).length;
    const baseWPM = 150; // words per minute
    const adjustedWPM = baseWPM * (speed || 1.0);
    const estimatedDuration = Math.round((wordCount / adjustedWPM) * 60); // in seconds

    // Note: In production, integrate with TTS APIs:
    // - ElevenLabs (best quality, natural voices)
    // - Google Cloud Text-to-Speech
    // - Amazon Polly
    // - Microsoft Azure Speech
    // - OpenAI TTS

    // Check for ElevenLabs API key
    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
    let audioData: string;

    if (elevenLabsApiKey) {
      try {
        // Map voice styles to ElevenLabs voice IDs
        const voiceMap = {
          'dramatic': 'EXAVITQu4vr4xnSDxMaL', // Sarah - Warm, engaging
          'neutral': 'pNInz6obpgDQGcFmaJgB', // Adam - Clear, professional
          'mysterious': 'VR6AewLTigWG4xSOukaG' // Arnold - Deep, mysterious
        };

        const voiceId = voiceMap[voiceStyle] || voiceMap['dramatic'];

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsApiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: voiceStyle === 'dramatic' ? 0.4 : 0.6,
              similarity_boost: 0.75,
              style: voiceStyle === 'dramatic' ? 0.8 : 0.5,
              use_speaker_boost: true
            }
          })
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        audioData = `data:audio/mpeg;base64,${base64Audio}`;
      } catch (apiError) {
        console.error("ElevenLabs API error, falling back to mock:", apiError);
        audioData = generateMockAudioDataUrl(estimatedDuration);
      }
    } else {
      // Fallback to mock if no API key
      audioData = generateMockAudioDataUrl(estimatedDuration);
    }

    return new Response(
      JSON.stringify({
        success: true,
        audioData: audioData,
        duration: estimatedDuration,
        voiceStyle: voiceStyle,
        speed: speed,
        pitch: pitch,
        generatedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-voiceover:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

// Generate a mock audio data URL for development
function generateMockAudioDataUrl(duration: number): string {
  // This creates a minimal WAV file header for a silent audio file
  // In production, this would be replaced with actual audio from TTS service

  // For now, return a data URL that indicates it's a mock
  return `data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=`;
}
