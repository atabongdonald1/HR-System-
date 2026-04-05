import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

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

  async generatePolicy(policyName: string, context: string = "UAE Labor Law 2024") {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a comprehensive HR policy for: ${policyName}.
      Context: ${context} (Federal Decree-Law No. 33 of 2021).
      Include:
      1. Title
      2. Version Number (e.g., v1.0 2024)
      3. Purpose and Scope
      4. Detailed Policy Content (using Markdown for formatting)
      5. Compliance Summary (how it meets UAE regulations)
      6. Legal Notes (specific references to UAE Federal Decree-Law No. 33 of 2021)
      Ensure it is professional and legally sound for the UAE region.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            version: { type: Type.STRING },
            content: { type: Type.STRING, description: "Full policy text in markdown format." },
            summary: { type: Type.STRING },
            complianceNotes: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async getHRRecommendation(query: string, context: any) {
    const tools: FunctionDeclaration[] = [
      {
        name: "analyzeCandidateCV",
        description: "Analyze a candidate's CV text to extract skills, experience, and scores.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            cvText: { type: Type.STRING, description: "The full text of the CV." }
          },
          required: ["cvText"]
        }
      },
      {
        name: "generateJobPost",
        description: "Generate a complete job description and requirements for a new role.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING, description: "The job title." },
            region: { type: Type.STRING, description: "Target region (e.g., Dubai, Riyadh)." }
          },
          required: ["role"]
        }
      },
      {
        name: "sourceTalent",
        description: "Activate NEXA-SOURCE to find candidates for active job posts.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING, description: "Target location for sourcing." },
            skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific skills to look for." }
          }
        }
      },
      {
        name: "checkCompliance",
        description: "Check HR actions or policies against UAE Labor Law or international standards.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: "The HR action or policy to check." }
          },
          required: ["action"]
        }
      },
      {
        name: "generatePolicy",
        description: "Generate a new HR policy or update an existing one based on UAE regulations.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            policyName: { type: Type.STRING, description: "The name of the policy to generate (e.g., Remote Work Policy)." },
            context: { type: Type.STRING, description: "Specific legal or company context." }
          },
          required: ["policyName"]
        }
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are NEXA-HR, an autonomous HR Intelligence System.
      Your mission is to manage the workforce lifecycle with precision and efficiency.
      
      Current Context:
      - Candidates: ${context.candidates?.length || 0}
      - Employees: ${context.employees?.length || 0}
      - Active Jobs: ${context.jobs?.length || 0}
      - Region: ${context.region || 'UAE'}
      
      User Query: ${query}
      
      Provide a precise, structured recommendation. If you need to perform an action (like analyzing a CV or generating a JD), use the available tools.`,
      config: {
        tools: [{ functionDeclarations: tools }]
      }
    });
    return response;
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
