
import { GoogleGenAI } from "@google/genai";
import { AIResponse, GeoLocation } from '../types';

export const geminiService = {
  /**
   * Use Gemini 2.5 Flash with Maps grounding to find office coordinates
   */
  lookupOffice: async (query: string, userLoc?: GeoLocation): Promise<AIResponse> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
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

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find the specific address and GPS coordinates (latitude and longitude) for this office location: "${query}". Please format the result clearly so I can extract the coordinates.`,
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
        text: response.text || "Couldn't find coordinates.",
        groundingUrls: urls
      };
    } catch (error) {
      console.error("Gemini Error:", error);
      return { text: "Error searching for office location." };
    }
  },

  /**
   * Use Gemini Pro to analyze attendance patterns
   */
  analyzeAttendance: async (history: any[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const prompt = `Analyze these office attendance logs and provide a short summary of consistency and average hours if possible: ${JSON.stringify(history)}`;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional HR analyst. Provide concise, helpful summaries."
        }
      });
      return response.text || "No analysis available.";
    } catch (error) {
      return "Failed to analyze data.";
    }
  }
};
