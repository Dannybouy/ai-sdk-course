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
  getWeather: tool({
    description: "Get the weather for a location",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
    execute: async ({ city }) => {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${
          process.env.WEATHER_API_KEY
        }&q=${encodeURIComponent(city)}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data for ${city}`);
      }
      const data = await response.json();
      const weatherData = {
        location: {
          name: data.location.name,
          // region: data.location.region,
          country: data.location.country,
          localtime: data.location.localtime,
        },
        current: {
          temp_c: data.current.temp_c,
          condition: {
            text: data.current.condition.text,
            code: data.current.condition.code,
          },
        },
      };
      return weatherData;
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

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to generate text stream. Please try again.", {
      status: 500,
    });
  }
}
