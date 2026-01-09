
import { GoogleGenAI } from "@google/genai";
import { AIResponse, GeoLocation } from '../types.ts';

export const geminiService = {
  /**
   * Use Gemini 2.5 Flash with Maps grounding to find office coordinates
   */
  lookupOffice: async (query: string, userLoc?: GeoLocation): Promise<AIResponse> => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API Key is missing. Please configure it in environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (userLoc) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLoc.latitude,
              longitude: userLoc.longitude
            }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find the specific address and information for this office: "${query}". Provide a helpful summary.`,
        config,
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const urls = groundingChunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({
          title: c.maps.title || 'View on Maps',
          uri: c.maps.uri
        }));

      return {
        text: response.text || "No details found for this office.",
        groundingUrls: urls
      };
    } catch (error: any) {
      console.error("Gemini Lookup Error:", error);
      return { 
        text: `Error: ${error.message || "Failed to connect to Gemini API. Please check your network and API key."}`,
        groundingUrls: []
      };
    }
  },

  /**
   * Use Gemini Pro to analyze attendance patterns
   */
  analyzeAttendance: async (history: any[]): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze these office attendance logs and provide a short summary of consistency and average hours if possible: ${JSON.stringify(history)}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional HR analyst. Provide concise, helpful summaries."
        }
      });
      return response.text || "No analysis available.";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "Failed to analyze data. Please try again later.";
    }
  }
};
