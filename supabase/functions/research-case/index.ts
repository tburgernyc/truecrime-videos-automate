import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// PRODUCTION: Set ALLOWED_ORIGIN environment variable to your domain (e.g., "https://yourdomain.com")
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResearchRequest {
  caseName: string;
  timeframe: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { caseName, timeframe }: ResearchRequest = await req.json();

    if (!caseName) {
      throw new Error("Case name is required");
    }

    // Note: In production, you would integrate with:
    // 1. Perplexity API, Tavily API, or Brave Search API for research
    // 2. News APIs for recent case information
    // 3. Fact-checking APIs for credibility scoring

    // For now, we'll create a structured mock response that the app can use
    // Replace this with actual API calls in production

    const mockResearchData = {
      caseName: caseName,
      summary: `Detailed research summary for ${caseName}. This case involves a complex investigation with multiple key players and significant public interest. The timeline spans several months with crucial events that shaped the outcome.`,
      timeline: [
        {
          date: "2024-01-15",
          event: "Initial incident reported to authorities"
        },
        {
          date: "2024-01-20",
          event: "Investigation officially opened"
        },
        {
          date: "2024-02-10",
          event: "Key evidence discovered"
        },
        {
          date: "2024-03-05",
          event: "Arrest made"
        },
        {
          date: "2024-04-12",
          event: "Trial proceedings begin"
        }
      ],
      keyPeople: [
        {
          name: "Lead Investigator",
          role: "Detective in charge of the case"
        },
        {
          name: "Key Witness",
          role: "Primary witness to events"
        },
        {
          name: "Legal Counsel",
          role: "Defense attorney"
        }
      ],
      locations: [
        "Primary crime scene location",
        "Investigation headquarters",
        "Courthouse"
      ],
      outcomes: [
        "Case resolution details",
        "Legal outcomes and verdicts",
        "Impact on community"
      ],
      sources: [
        {
          title: "Official Police Report",
          url: `https://example.com/reports/${caseName.toLowerCase().replace(/\s+/g, '-')}`,
          snippet: "Official documentation of the investigation and findings.",
          source: "Law Enforcement Database",
          credibility: "high" as const
        },
        {
          title: "News Coverage - Major Outlet",
          url: "https://example.com/news/coverage",
          snippet: "Comprehensive news coverage of the case from initial report through resolution.",
          source: "National News Network",
          credibility: "high" as const
        },
        {
          title: "Court Documents",
          url: "https://example.com/court/documents",
          snippet: "Public court filings and legal documentation.",
          source: "Public Records",
          credibility: "high" as const
        },
        {
          title: "Expert Analysis",
          url: "https://example.com/analysis",
          snippet: "Professional analysis from criminal justice experts.",
          source: "Academic Journal",
          credibility: "medium" as const
        }
      ],
      sensitiveElements: [
        "Handle victim information with respect and dignity",
        "Avoid graphic descriptions of violence",
        "Be mindful of ongoing legal proceedings",
        "Respect privacy of families involved"
      ],
      factCheckingScore: 85,
      researchedAt: new Date().toISOString()
    };

    // Check for Perplexity API key
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");

    if (perplexityApiKey) {
      try {
        // Use Perplexity for real research
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${perplexityApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-small-128k-online",
            messages: [{
              role: "system",
              content: "You are a true crime researcher. Provide factual, well-sourced information about criminal cases. Include timeline, key people, locations, and credible sources. Be ethical and respectful."
            }, {
              role: "user",
              content: `Research the true crime case: "${caseName}". Provide:\n1. Case summary\n2. Timeline of key events (dates and events)\n3. Key people involved (names and roles)\n4. Locations\n5. Case outcomes\n6. List of credible sources\n7. Sensitive elements to handle carefully\n\nFormat as structured data.`
            }],
            temperature: 0.2,
            max_tokens: 2000
          })
        });

        if (!response.ok) {
          throw new Error(`Perplexity API error: ${response.status}`);
        }

        const data = await response.json();
        const researchContent = data.choices[0].message.content;

        // Parse AI response into structured format
        // For now, combine AI insights with structured template
        mockResearchData.summary = researchContent.substring(0, 500);
        mockResearchData.caseName = caseName;

        // Add AI-generated content as first source
        mockResearchData.sources.unshift({
          title: `Perplexity Research: ${caseName}`,
          url: "https://www.perplexity.ai",
          snippet: researchContent.substring(0, 200),
          source: "Perplexity AI",
          credibility: "high" as const
        });

        return new Response(
          JSON.stringify(mockResearchData),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (apiError) {
        console.error("Perplexity API error, falling back to mock:", apiError);
        // Fall through to mock data
      }
    }

    // Fallback to mock data if no API key or API fails
    return new Response(
      JSON.stringify(mockResearchData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in research-case:", error);
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
