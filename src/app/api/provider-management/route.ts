import { convertToModelMessages, streamText, UIMessage } from "ai";
import { google } from "./models";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: google.languageModel("fast"),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to generate text stream. Please try again.", {
      status: 500,
    });
  }
}
