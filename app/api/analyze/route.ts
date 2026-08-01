import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const { prompt } = body;

    if (typeof prompt !== "string" || prompt.length === 0 || prompt.length > 12_000) {
      return NextResponse.json({ error: "Invalid analysis request" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "AI analysis is unavailable right now.",
        },
        { status: 500 }
      );
    }

    // Call the Gemini model with safety settings configured
    const response = await new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }).models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      },
    });

    return NextResponse.json({ result: response.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
