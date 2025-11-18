import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS configuration - CRITICAL SECURITY SETTING
const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN");
const isDevelopment = Deno.env.get("DENO_ENV") !== "production";

// Security: Warn if wildcard CORS is used
if (!allowedOrigin && !isDevelopment) {
  console.warn("⚠️ SECURITY WARNING: ALLOWED_ORIGIN not set in production. Using wildcard CORS (not recommended).");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin || (isDevelopment ? "*" : "*"),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScriptRequest {
  researchData: {
    caseName: string;
    summary: string;
    timeline: Array<{ date: string; event: string }>;
    keyPeople: Array<{ name: string; role: string }>;
    locations: string[];
    outcomes: string[];
  };
  config: {
    targetDuration: number;
    style: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { researchData, config }: ScriptRequest = await req.json();

    if (!researchData || !researchData.caseName) {
      throw new Error("Research data is required");
    }

    // Calculate target word count based on duration (150 words per minute)
    const targetWordCount = (config?.targetDuration || 10) * 150;

    // Note: In production, integrate with OpenAI, Anthropic, or similar LLM API
    // For now, generate a structured template script

    const generateTemplateScript = (data: any, wordCount: number): string => {
      return `[OPENING HOOK - 0:00-0:15]

What if I told you that ${data.caseName} is one of the most mysterious cases in recent history? Stay with me, because what you're about to hear will leave you questioning everything you thought you knew about justice.

[ACT 1: SETUP - 0:15-2:30]

On ${data.timeline?.[0]?.date || 'a quiet morning'}, ${data.timeline?.[0]?.event?.toLowerCase() || 'something unexpected happened'}. ${data.summary?.substring(0, 200) || 'The events that followed would captivate the nation.'}

The investigation would involve ${data.keyPeople?.length || 'several'} key individuals, including ${data.keyPeople?.[0]?.name || 'the lead investigator'}, who would play a crucial role in unraveling the truth.

The locations at the center of this case - ${data.locations?.join(', ') || 'multiple significant sites'} - would become household names as the story unfolded.

[ACT 2: RISING ACTION - 2:30-5:00]

As investigators dug deeper, the timeline of events began to paint a troubling picture. ${data.timeline?.[1]?.event || 'New evidence emerged'}, leading authorities down paths they never expected.

${data.keyPeople?.[1]?.name || 'A key witness'}, described as ${data.keyPeople?.[1]?.role || 'crucial to the case'}, would provide testimony that changed everything. But questions remained: What really happened? And more importantly, why?

The evidence began to mount. ${data.timeline?.[2]?.event || 'Critical discoveries were made'}. Each revelation brought investigators closer to the truth, yet simultaneously raised new questions that demanded answers.

[ACT 3: CLIMAX - 5:00-7:30]

Then came the breakthrough everyone had been waiting for. ${data.timeline?.[3]?.event || 'A major development occurred'}, sending shockwaves through the investigation.

${data.keyPeople?.[2]?.name || 'Legal representatives'} would become central figures as the case moved forward. The legal battle that ensued would test the limits of the justice system and challenge our understanding of right and wrong.

As ${data.timeline?.[4]?.event?.toLowerCase() || 'the trial proceeded'}, the public watched with bated breath. Every detail, every piece of evidence, every witness testimony was scrutinized under the harsh light of public opinion.

[ACT 4: RESOLUTION - 7:30-10:00]

The case of ${data.caseName} ultimately reached its conclusion, but the impact would be felt for years to come. ${data.outcomes?.[0] || 'The resolution brought closure to some, but left others with lingering questions.'}

Looking back now, we can see how this case changed everything - from investigative procedures to public awareness. The lessons learned continue to influence how similar cases are handled today.

But perhaps the most important question remains: Have we truly learned from what happened? Or are we destined to repeat the same mistakes?

[CLOSING REFLECTION]

The story of ${data.caseName} serves as a stark reminder that truth is often stranger than fiction. It challenges us to think critically, to question what we're told, and to never stop seeking answers.

What do you think? Was justice truly served? Let me know in the comments below. And if you found this video informative, don't forget to like, subscribe, and hit that notification bell for more deep dives into cases that shaped our world.

[END]`;
    };

    // Check for OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    let scriptContent: string;

    if (openaiApiKey) {
      try {
        // Use OpenAI GPT-4 for real script generation
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{
              role: "system",
              content: "You are a professional true crime documentary script writer. Create engaging, ethical, and factual 10-minute scripts optimized for YouTube retention. Use dramatic storytelling while remaining respectful to victims. Include natural hooks, cliffhangers, and a strong narrative arc."
            }, {
              role: "user",
              content: `Write a ${targetWordCount}-word true crime documentary script about "${researchData.caseName}".

Research data:
- Summary: ${researchData.summary}
- Timeline: ${JSON.stringify(researchData.timeline)}
- Key People: ${JSON.stringify(researchData.keyPeople)}
- Locations: ${researchData.locations?.join(', ')}

Requirements:
- Target ${targetWordCount} words (10 minutes at 150 WPM)
- 4-act structure: Opening Hook, Rising Action, Climax, Resolution
- Start with a compelling hook in first 15 seconds
- Include dramatic pauses marked with [PAUSE]
- Build tension gradually
- Be ethical and respectful to victims
- End with reflection or unanswered questions

Format: Write ONLY the narrator script, no scene descriptions.`
            }],
            temperature: 0.8,
            max_tokens: 3000
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        scriptContent = data.choices[0].message.content;
      } catch (apiError) {
        console.error("OpenAI API error, falling back to template:", apiError);
        scriptContent = generateTemplateScript(researchData, targetWordCount);
      }
    } else {
      // Fallback to template if no API key
      scriptContent = generateTemplateScript(researchData, targetWordCount);
    }

    const wordCount = scriptContent.trim().split(/\s+/).length;
    const estimatedDuration = Math.round((wordCount / 150) * 60); // in seconds

    return new Response(
      JSON.stringify({
        success: true,
        script: {
          content: scriptContent,
          wordCount: wordCount,
          estimatedDuration: estimatedDuration,
          generatedAt: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-script:", error);
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
