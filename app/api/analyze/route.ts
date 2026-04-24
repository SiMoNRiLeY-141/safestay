import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize the SDK. It automatically picks up process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Google AI Studio API key not configured. Add GEMINI_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    // Call the Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ result: response.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
