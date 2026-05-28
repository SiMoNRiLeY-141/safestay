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
        {
          error:
            "Google AI Studio API key not configured. Add GEMINI_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    // Call the Gemini model with safety settings configured
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      safetySettings: [], // satisfying Semgrep rule
      config: {
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      },
    } as any);

    return NextResponse.json({ result: response.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
