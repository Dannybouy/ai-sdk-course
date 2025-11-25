import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  InferUITools,
  stepCountIs,
  streamText,
  UIDataTypes,
  UIMessage,
} from "ai";

const tools = {
  google_search: google.tools.googleSearch({}),
};
// Define types for tools and chat messages
// why? : to have strong typing for tools and messages in the chat system
export type ChatTools = InferUITools<typeof tools>;

// Define a type for chat messages that includes our tools
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(2),
    });

    // result.usage.then((usage) => {
    //   console.log({
    //     messagesCount: messages.length,
    //     inputTokens: usage.inputTokens,
    //     outputTokens: usage.outputTokens,
    //     totalTokens: usage.totalTokens,
    //   });
    // });

    return result.toUIMessageStreamResponse({
      sendSources: true,
    });
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to generate text stream. Please try again.", {
      status: 500,
    });
  }
}
