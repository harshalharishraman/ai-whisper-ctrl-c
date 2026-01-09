
import { GoogleGenAI, Type } from "@google/genai";
import { Trip, ExploreData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STORAGE_KEY_SAVED_TRIPS = 'ai_travel_saved_trips';
const STORAGE_KEY_ACTIVITY = 'ai_travel_explore_activity';

export function saveTrip(userId: number, trip: Trip): void {
  const saved = localStorage.getItem(STORAGE_KEY_SAVED_TRIPS);
  const trips: (Trip & { user_id: number })[] = saved ? JSON.parse(saved) : [];
  
  // Check if trip already saved
  if (trips.some(t => t.id === trip.id)) return;

  trips.push({ ...trip, user_id: userId, createdAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY_SAVED_TRIPS, JSON.stringify(trips));
  logActivity(userId, 'save_trip', { destination: trip.destination });
}

export function getSavedTrips(userId: number): Trip[] {
  const saved = localStorage.getItem(STORAGE_KEY_SAVED_TRIPS);
  if (!saved) return [];
  const trips: (Trip & { user_id: number })[] = JSON.parse(saved);
  return trips.filter(t => t.user_id === userId).sort((a, b) => 
    new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
  );
}

export function deleteSavedTrip(userId: number, tripId: string): void {
  const saved = localStorage.getItem(STORAGE_KEY_SAVED_TRIPS);
  if (!saved) return;
  const trips: (Trip & { user_id: number })[] = JSON.parse(saved);
  const filtered = trips.filter(t => !(t.user_id === userId && t.id === tripId));
  localStorage.setItem(STORAGE_KEY_SAVED_TRIPS, JSON.stringify(filtered));
}

export function logActivity(userId: number, action: string, meta: any): void {
  const saved = localStorage.getItem(STORAGE_KEY_ACTIVITY);
  const activities = saved ? JSON.parse(saved) : [];
  activities.push({ user_id: userId, action, meta, created_at: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(activities.slice(-50))); // Keep last 50
}

export async function getPersonalizedExplore(interests: string[]): Promise<ExploreData> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on user interests: ${interests.join(', ')}, recommend 3 travel destinations and 3 trending global destinations for 2024.`,
    config: {
      systemInstruction: "You are a travel recommendation engine. Provide structured JSON recommendations.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommended: { type: Type.ARRAY, items: { type: Type.STRING } },
          trending: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['recommended', 'trending']
      }
    }
  });

  const data = JSON.parse(response.text || '{"recommended": [], "trending": []}');
  return {
    ...data,
    recentlyViewed: ['Kyoto', 'Manali'] // Mocked recently viewed
  };
}
