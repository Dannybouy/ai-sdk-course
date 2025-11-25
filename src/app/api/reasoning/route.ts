import { google, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash-preview-09-2025"),
      messages: convertToModelMessages(messages),
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 8192, // in characters
            includeThoughts: true,
          },
        } satisfies GoogleGenerativeAIProviderOptions,
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to generate text stream. Please try again.", {
      status: 500,
    });
  }
}
