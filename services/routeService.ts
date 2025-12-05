
import { GoogleGenAI, Type } from "@google/genai";
import { CommuteData } from "../types";

export interface RouteAnalysisResult {
  data: CommuteData;
  rawMapText: string;
}

export async function analyzeRoute(origin: string, destination: string): Promise<RouteAnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = ai.models;

  // Step 1: Grounded Search for Route Info
  const prompt = `
    I need to commute from "${origin}" to "${destination}" in the Greater Toronto Area (GTA).
    
    Please use Google Maps to:
    1. Find the driving distance (in km) and estimated driving duration considering current traffic.
    2. Identify if there is a GO Transit or public transit route available. Estimate the duration for that.
    3. Provide the result as a clear summary.
  `;

  const mapResult = await model.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
    }
  });

  const mapText = mapResult.text || "No route information available.";
  const groundingChunks = mapResult.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sourceUrls = groundingChunks
    .map(chunk => chunk.web?.uri || chunk.maps?.uri || "")
    .filter(uri => uri !== "");

  // Step 2: Extraction to JSON for calculations
  const extractPrompt = `
    Analyze the following route description and extract the data into JSON.
    
    Route Description:
    "${mapText}"

    If any value is missing, make a best estimate based on typical GTA travel.
    If transit duration is not mentioned, estimate it as 1.5x driving time.
  `;

  const extractResult = await model.generateContent({
    model: "gemini-2.5-flash",
    contents: extractPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          distanceKm: { type: Type.NUMBER, description: "Driving distance in Kilometers" },
          drivingTimeMins: { type: Type.NUMBER, description: "Driving time in minutes" },
          transitTimeMins: { type: Type.NUMBER, description: "Public transit/GO train time in minutes" },
          transitSummary: { type: Type.STRING, description: "Short summary of the transit route found" }
        },
        required: ["distanceKm", "drivingTimeMins", "transitTimeMins"]
      }
    }
  });

  const parsedData = JSON.parse(extractResult.text);

  return {
    data: {
      ...parsedData,
      sourceUrls
    },
    rawMapText: mapText
  };
}
