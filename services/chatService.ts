
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  parts: { text: string }[];
}

export interface ChatResponse {
  text: string;
  intent?: 'FAQ' | 'Booking_Status' | 'Cancellation' | 'Refund' | 'Complaint' | 'Talk_To_Human';
  entities?: {
    bookingId?: string;
    issueType?: string;
    ticketId?: string;
  };
}

const SYSTEM_INSTRUCTION = `
You are the "AI Travel Agent Help & Grievance Assistant". 
Your role is to assist users with FAQs, bookings, cancellations, refunds, and complaints.

Operational Rules:
1. PERSONA: Be professional, empathetic, and efficient, similar to support agents on MakeMyTrip or Airbnb.
2. ENTITY EXTRACTION: Always look for Booking IDs (format: TX followed by 4-6 digits, e.g., TX1234).
3. INTENT CLASSIFICATION: Classify the user's intent into: FAQ, Booking_Status, Cancellation, Refund, Complaint, or Talk_To_Human.
4. REFUNDS: If a user asks about a refund for a specific ID, simulate a check and inform them it's "Processing" or "Completed".
5. COMPLAINTS: If a user has a grievance, provide a simulated Ticket ID (e.g., CASE-9923).
6. ESCALATION: If the user is very frustrated or explicitly asks for a human, set the intent to 'Talk_To_Human'.
7. FORMATTING: Use clear, concise language. Use bullet points for steps.

Response Format:
Always respond with JSON containing the 'text' to show the user and the detected 'intent' and 'entities'.
`;

export async function sendSupportMessage(history: ChatMessage[], newMessage: string): Promise<ChatResponse> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...history, { role: 'user', parts: [{ text: newMessage }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          intent: { 
            type: Type.STRING, 
            enum: ['FAQ', 'Booking_Status', 'Cancellation', 'Refund', 'Complaint', 'Talk_To_Human'] 
          },
          entities: {
            type: Type.OBJECT,
            properties: {
              bookingId: { type: Type.STRING },
              issueType: { type: Type.STRING },
              ticketId: { type: Type.STRING }
            }
          }
        },
        required: ['text']
      }
    }
  });

  return JSON.parse(response.text || '{"text": "I am having trouble processing that request."}');
}
