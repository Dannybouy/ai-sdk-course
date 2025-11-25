import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import type { MyUIMessage } from "./types";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: MyUIMessage[] } = await req.json();
    const result = streamText({
      model: google("gemini-2.0-flash-lite"),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === "start") {
          return {
            createdAt: Date.now(),
          };
        }
        if (part.type === "finish") {
          console.log("tokens usage:", part.totalUsage);
          return {
            totalTokens: part.totalUsage.totalTokens,
          };
        }
      },
    });
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to generate text stream. Please try again.", {
      status: 500,
    });
  }
}
