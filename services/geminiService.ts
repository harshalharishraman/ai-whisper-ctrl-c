
import { GoogleGenAI, Type } from "@google/genai";
import { ResearcherOutput, DayPlan, BudgetTier } from "../types";

// Initialize the Google GenAI client with the mandatory API_KEY environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Researcher Agent: Fetches potential places, hotels, and transport for a destination.
 */
export async function researchDestination(destination: string, interests: string[]): Promise<ResearcherOutput> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Research a trip to ${destination} for someone interested in ${interests.join(', ')}. 
    Provide a list of 8 top places to visit, 3 hotel options (economy, mid, luxury), and typical transport types. 
    Include estimated base costs in local currency equivalents (assuming 1 USD = 80 units for consistency).`,
    config: {
      // Define the persona and task scope using systemInstruction.
      systemInstruction: "You are a detailed-oriented travel researcher. Provide structured data for destinations, accommodations, and transportation.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestedPlaces: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                baseCost: { type: Type.NUMBER, description: 'Base entrance or activity fee' },
                description: { type: Type.STRING }
              },
              required: ['name', 'baseCost', 'description']
            }
          },
          suggestedHotels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                baseCostPerNight: { type: Type.NUMBER },
                description: { type: Type.STRING }
              },
              required: ['name', 'baseCostPerNight', 'description']
            }
          },
          transportOptions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                baseCostPerDay: { type: Type.NUMBER }
              },
              required: ['type', 'baseCostPerDay']
            }
          }
        },
        required: ['suggestedPlaces', 'suggestedHotels', 'transportOptions']
      }
    }
  });

  // Access the generated text content directly via the .text property.
  return JSON.parse(response.text || '{}');
}

/**
 * Planner Agent: Organizes researched data into a logical day-wise itinerary.
 */
export async function planItinerary(
  destination: string,
  numDays: number,
  researchData: ResearcherOutput,
  budgetTier: BudgetTier
): Promise<DayPlan[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Organize the following researched data into a logical ${numDays}-day itinerary for ${destination}. 
    Budget Tier: ${budgetTier}.
    
    Data:
    Places: ${JSON.stringify(researchData.suggestedPlaces)}
    Hotels: ${JSON.stringify(researchData.suggestedHotels)}
    Transport: ${JSON.stringify(researchData.transportOptions)}`,
    config: {
      // Use systemInstruction to enforce strict operational rules and the agent's persona.
      systemInstruction: `You are a professional travel planner. 
      Rules:
      - Group nearby places together to optimize travel routes.
      - Assign realistic activities per day.
      - Output day-wise plans with specific costs.
      - Each day must include specific costs for hotel, food, transport, and activities based on the provided research data.
      - Scale food and hotel costs appropriately according to the '${budgetTier}' budget tier.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.NUMBER },
            date: { type: Type.STRING },
            places: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
            cost: {
              type: Type.OBJECT,
              properties: {
                hotel: { type: Type.NUMBER },
                food: { type: Type.NUMBER },
                transport: { type: Type.NUMBER },
                activities: { type: Type.NUMBER }
              },
              required: ['hotel', 'food', 'transport', 'activities']
            }
          },
          required: ['day', 'places', 'description', 'cost']
        }
      }
    }
  });

  // Extract text property from GenerateContentResponse and parse it.
  return JSON.parse(response.text || '[]');
}
