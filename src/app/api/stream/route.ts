import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    const result = streamText({
      model: google("gemini-2.0-flash"),
      prompt,
    });

    result.usage.then((usage) => {
      console.log({
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error generating text stream:", error);
    return new Response("Failed to generate text stream. Please try again.", {
      status: 500,
    });
  }
}
