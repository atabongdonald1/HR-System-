import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async analyzeCV(cvText: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this CV and provide a structured assessment for a global hiring engine.
      Focus on skills match, experience relevance, and cultural fit.
      CV Text: ${cvText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experienceYears: { type: Type.NUMBER },
            hireScore: { type: Type.NUMBER, description: "0-100 score" },
            summary: { type: Type.STRING },
            behavioralIndicators: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "role", "skills", "experienceYears", "hireScore", "summary"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async generateJobDescription(role: string, region: string = "UAE") {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a high-quality job description for the role of ${role} in ${region}.
      Include salary benchmarks for the region, required skills, and screening questions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            salaryBenchmark: {
              type: Type.OBJECT,
              properties: {
                min: { type: Type.NUMBER },
                max: { type: Type.NUMBER },
                currency: { type: Type.STRING }
              }
            },
            screeningQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async getHRRecommendation(query: string, context: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are NEXA-HR, an autonomous HR Intelligence System.
      Context: ${JSON.stringify(context)}
      User Query: ${query}
      
      Provide a precise, structured recommendation with reasoning and action steps.`,
    });
    return response.text;
  },

  async sourceCandidates(jobPosts: any[], params?: { location?: string; skills?: string[] }) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are NEXA-SOURCE, an Autonomous Talent Sourcing Intelligence Agent.
      Your mission is to source highly relevant candidates for these active job positions:
      ${JSON.stringify(jobPosts)}
      
      ${params?.location ? `Focus on candidates located in or willing to relocate to: ${params.location}` : ""}
      ${params?.skills?.length ? `Prioritize candidates with these specific skills: ${params.skills.join(", ")}` : ""}

      For each job, identify 2-3 top-tier candidates. 
      Prioritize GCC experience for hospitality/logistics roles.
      Return a list of candidates with full details including scoring (0-100).`,
      config: {
        // ... existing config ...
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              experience: { type: Type.NUMBER },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: { type: Type.STRING },
              hireScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              behavioralIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              source: { type: Type.STRING }
            },
            required: ["name", "role", "email", "experience", "skills", "hireScore", "summary"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  },

  async collectCVs(jobPosts: any[]) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are NEXA-COLLECT, a fully autonomous CV Aggregation and Talent Ingestion System.
      Your mission is to continuously collect and normalize CVs for these active job postings:
      ${JSON.stringify(jobPosts)}
      
      Identify 5-8 qualified candidates (Score >= 65) from various sources (LinkedIn, Indeed, Bayt, etc.).
      Prioritize GCC experience and candidates from Philippines, India, Nepal, or Africa for hospitality/logistics.
      Return a structured list of candidate profiles.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              experience: { type: Type.NUMBER },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: { type: Type.STRING },
              hireScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              behavioralIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              source: { type: Type.STRING }
            },
            required: ["name", "role", "email", "experience", "skills", "hireScore", "summary", "source"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }
};
