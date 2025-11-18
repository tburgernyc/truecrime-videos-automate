import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

interface StoryboardRequest {
  script: string;
  caseName: string;
  visualStyle: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { script, caseName, visualStyle }: StoryboardRequest = await req.json();

    if (!script || script.length < 100) {
      throw new Error("Valid script is required (minimum 100 characters)");
    }

    // Parse script into scenes based on structure markers
    // In production, use AI to intelligently break down the script
    const scriptSections = script.split(/\[.*?\]/g).filter(s => s.trim().length > 50);
    const scenesPerSection = Math.ceil(scriptSections.length / 8); // Target ~8-12 scenes

    const generateScenes = (scriptText: string, caseTitle: string) => {
      const scenes = [];

      // Generate enough scenes to cover 10 minutes (~600 seconds)
      // Target: 50-60 scenes at 10-12 seconds each
      const targetSceneCount = 55;
      const baseSceneDuration = 11; // seconds per scene

      // Scene templates with varied moods, angles, and durations
      const sceneTemplates = [
        { mood: "mysterious", angle: "Medium Close-Up", durationMod: -1 },
        { mood: "calm", angle: "Wide Shot", durationMod: 1 },
        { mood: "tense", angle: "Medium Shot", durationMod: 0 },
        { mood: "suspenseful", angle: "Close-Up", durationMod: -2 },
        { mood: "dramatic", angle: "Over-the-Shoulder", durationMod: 1 },
        { mood: "intense", angle: "Dutch Angle", durationMod: 0 },
        { mood: "shocking", angle: "Extreme Close-Up", durationMod: -1 },
        { mood: "somber", angle: "Medium Shot", durationMod: 1 },
        { mood: "reflective", angle: "Wide Shot", durationMod: 0 },
        { mood: "contemplative", angle: "Medium Close-Up", durationMod: -1 }
      ];

      // Generate scenes by cycling through templates
      const sections = [];
      for (let i = 0; i < targetSceneCount; i++) {
        const template = sceneTemplates[i % sceneTemplates.length];
        sections.push({
          id: `scene-${i + 1}`,
          duration: baseSceneDuration + template.durationMod,
          mood: template.mood,
          angle: template.angle
        });
      }

      sections.forEach((section, idx) => {
        const scriptExcerpt = scriptSections[idx]
          ? scriptSections[idx].substring(0, 150).trim() + "..."
          : `Scene ${idx + 1} narration from ${caseTitle}`;

        scenes.push({
          sceneId: `scene-${String(idx + 1).padStart(2, '0')}`,
          duration: section.duration,
          scriptExcerpt: scriptExcerpt,
          visualPrompt: `${visualStyle}. ${section.mood} claymation scene showing ${getCameraDescription(section.angle)}. Color palette: moody teal and amber. Cinematic lighting with dramatic shadows.`,
          cameraAngle: section.angle,
          cameraMovement: getCameraMovement(idx),
          lighting: getLighting(section.mood),
          mood: section.mood,
          characters: getCharacters(idx),
          setting: getSettings(idx, caseTitle),
          editorNotes: `Focus on ${section.mood} atmosphere. Maintain consistent claymation style.`,
          previewImage: null // In production, generate with DALL-E, Midjourney API, or Stability AI
        });
      });

      return scenes;
    };

    const getCameraDescription = (angle: string): string => {
      const descriptions: Record<string, string> = {
        "Wide Shot": "establishing the environment and context",
        "Medium Shot": "character interactions and emotional beats",
        "Close-Up": "emotional intensity and detail",
        "Medium Close-Up": "personal connection with subjects",
        "Extreme Close-Up": "critical details and tension",
        "Over-the-Shoulder": "conversation and confrontation",
        "Dutch Angle": "unease and disorientation"
      };
      return descriptions[angle] || "the scene composition";
    };

    const getCameraMovement = (sceneIndex: number): string => {
      const movements = ["Slow Push In", "Static", "Slow Pan Right", "Slow Pull Out", "Handheld", "Slow Dolly", "Crane Up"];
      return movements[sceneIndex % movements.length];
    };

    const getLighting = (mood: string): string => {
      const lightingMap: Record<string, string> = {
        "mysterious": "Low-key with strong shadows",
        "calm": "Soft natural lighting",
        "tense": "High contrast side lighting",
        "suspenseful": "Dramatic rim lighting",
        "dramatic": "Strong directional key light",
        "intense": "High contrast harsh lighting",
        "shocking": "Sharp overhead lighting",
        "somber": "Dim ambient lighting",
        "reflective": "Soft window lighting",
        "contemplative": "Golden hour warm tones"
      };
      return lightingMap[mood] || "Balanced three-point lighting";
    };

    const getCharacters = (sceneIndex: number): string[] => {
      const characterSets = [
        ["Narrator presence"],
        ["Victim", "Location"],
        ["Investigators"],
        ["Key witness", "Detective"],
        ["Suspect", "Police officer"],
        ["Lawyer", "Defendant"],
        ["Judge", "Courtroom"],
        ["Investigators", "Evidence"],
        ["Community members"],
        ["Narrator presence"]
      ];
      return characterSets[sceneIndex] || ["Characters"];
    };

    const getSettings = (sceneIndex: number, title: string): string => {
      const settings = [
        "Dark studio background with title card",
        "Crime scene location exterior",
        "Police station interior",
        "Interview room",
        "Evidence analysis room",
        "Courtroom",
        "Courtroom during testimony",
        "News broadcast setting",
        "Community location",
        "Reflective ending backdrop"
      ];
      return settings[sceneIndex] || "Relevant location";
    };

    const scenes = generateScenes(script, caseName);
    const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

    // Generate preview images for scenes using Stability AI with parallel processing
    const stabilityApiKey = Deno.env.get("STABILITY_API_KEY");

    if (stabilityApiKey) {
      console.log("Generating images with Stability AI for", scenes.length, "scenes");

      // Helper function to generate a single image
      const generateImage = async (scene: any, index: number) => {
        try {
          // Enhanced prompt for claymation aesthetic
          const claymationPrompt = `claymation stop-motion animation style, ${scene.visualPrompt}, clay figures, plasticine characters, handcrafted miniature set, studio lighting, textured clay surfaces, fingerprint details visible, artisanal craft aesthetic, true crime documentary scene, moody atmosphere`;

          const negativePrompt = "realistic, photographic, 3D render, CGI, digital art, painting, illustration, cartoon, anime, blurry, low quality";

          const formData = new FormData();
          formData.append("prompt", claymationPrompt);
          formData.append("negative_prompt", negativePrompt);
          formData.append("output_format", "jpeg");
          formData.append("aspect_ratio", "16:9");

          const imageResponse = await fetch(
            "https://api.stability.ai/v2beta/stable-image/generate/core",
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${stabilityApiKey}`,
                "Accept": "image/*",
              },
              body: formData,
            }
          );

          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            const arrayBuffer = await imageBlob.arrayBuffer();
            // Use Deno's standard encoding method instead of browser's btoa()
            const base64Image = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(arrayBuffer))));
            scene.previewImage = `data:image/jpeg;base64,${base64Image}`;
            console.log(`✓ Generated image for scene ${index + 1}/${scenes.length}`);
          } else {
            const errorText = await imageResponse.text();
            console.error(`Failed to generate image for scene ${scene.sceneId}:`, errorText);
            scene.previewImage = null; // Will use placeholder
          }
        } catch (error) {
          console.error(`Error generating image for scene ${scene.sceneId}:`, error);
          scene.previewImage = null; // Will use placeholder
        }
      };

      // Process images in parallel batches with concurrency limit
      const CONCURRENCY_LIMIT = 10;
      const batches = [];

      for (let i = 0; i < scenes.length; i += CONCURRENCY_LIMIT) {
        const batch = scenes.slice(i, i + CONCURRENCY_LIMIT);
        batches.push(batch);
      }

      // Process each batch sequentially, but items within batch run in parallel
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchPromises = batch.map((scene, localIndex) => {
          const globalIndex = batchIndex * CONCURRENCY_LIMIT + localIndex;
          return generateImage(scene, globalIndex);
        });

        await Promise.all(batchPromises);

        // Small delay between batches to respect rate limits
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`Completed batch ${batchIndex + 1}/${batches.length}`);
      }

      console.log(`✓ Completed generating ${scenes.length} images`);
    } else {
      console.log("No STABILITY_API_KEY found, using placeholder images");
    }

    return new Response(
      JSON.stringify({
        success: true,
        storyboard: {
          scenes: scenes,
          totalScenes: scenes.length,
          totalDuration: totalDuration,
          globalStyle: visualStyle,
          generatedAt: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-storyboard:", error);
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
