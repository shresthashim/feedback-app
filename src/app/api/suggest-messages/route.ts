import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const prompt = "Create a random message for a anyone as a feedback. (one sentence)";

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not defined");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = (await model.generateContent(prompt)).response.text();
    return NextResponse.json(
      {
        success: true,
        message: "Messages suggested successfully",
        result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to suggest messages",
      },
      {
        status: 500,
      }
    );
  }
}
