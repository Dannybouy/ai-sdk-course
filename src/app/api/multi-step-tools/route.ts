import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  InferUITools,
  stepCountIs,
  streamText,
  tool,
  UIDataTypes,
  UIMessage,
} from "ai";
import { z } from "zod";

const tools = {
  getLocation: tool({
    description: "Get the user's current location",
    inputSchema: z.object({
      name: z.string().describe("The name of the user"),
    }),
    execute: async ({ name }) => {
      // Dummy location data for demonstration purposes
      if (name.toLowerCase() === "alice") {
        return "San Francisco, CA";
      } else if (name.toLowerCase() === "bob") {
        return "New York, NY";
      } else {
        return "Unknown Location";
      }
    },
  }),
  getWeather: tool({
    description: "Get the weather for a location",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
    execute: async ({ city }) => {
      // Dummy weather data for demonstration purposes
      if (city.toLowerCase() === "San francisco".toLowerCase()) {
        return "The weather in San Francisco is 68°F and sunny.";
      } else if (city.toLowerCase() === "New york".toLowerCase()) {
        return "The weather in New York is 75°F and partly cloudy.";
      } else {
        return `Sorry, I don't have weather data for ${city}.`;
      }
    },
  }),
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
      stopWhen: stepCountIs(3), // Stop after 3 steps for demonstration
    });

    result.usage.then((usage) => {
      console.log({
        messagesCount: messages.length,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to generate text stream. Please try again.", {
      status: 500,
    });
  }
}
