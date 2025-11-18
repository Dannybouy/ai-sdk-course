import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { recipeSchema } from "./schema";

export async function POST(req: Request) {
  try {
    const { dish } = await req.json();

    const result = streamObject({
      model: google("gemini-2.5-flash-lite"),
      schema: recipeSchema,
      prompt: `Generate a recipe for ${dish}`,
    });

    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error("Error generating recipe:", error);
    return new Response("Failed to generate recipe. Please try again.", {
      status: 500,
    });
  }
}
