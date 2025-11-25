import { google } from "@ai-sdk/google";
import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";
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

// ---- Add a typed placeholder for the MCP tool (types only) ----
const mcpToolTypesForTypingOnly = {
  getStockPrice: tool({
    description: "Get the current stock price for a given ticker symbol",
    inputSchema: z.object({
      name: z
        .string()
        .describe("The stock ticker symbol, e.g., AAPL for Apple Inc."),
    }),
    // Optional: tighten output typing if you want to use it in the UI
    // Otherwise use z.any()
    outputSchema: z
      .object({
        price: z.string().optional(),
        change: z.string().optional(),
      })
      .or(z.string())
      .optional(),
    // Will never be called at runtime (overridden by MCP). Throw to be safe.
    execute: async () => {
      throw new Error(
        "Placeholder execute(): real implementation comes from MCP at runtime."
      );
    },
  }),
} as const;

// Build a merged tools object just for typing ChatMessage
type AllToolsForTyping = typeof tools & typeof mcpToolTypesForTypingOnly;

// Strongly-typed tools and message
export type ChatTools = InferUITools<AllToolsForTyping>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const mcpClient = await createMCPClient({
      transport: {
        type: "http",
        url: "https://app.mockmcp.com/servers/D7D74BMgTpqv/mcp",
        headers: {
          Authorization:
            "Bearer mcp_m2m_wLHDz50nASR_OWT--pXR_N_3JzMDuP40acluR0HlhHM_f5f562727ef2abea",
        },
      },
    });

    const mcpTools = await mcpClient.tools({
      schemas: {
        getStockPrice: {
          description: "Get the current stock price for a given ticker symbol",
          inputSchema: z.object({
            name: z
              .string()
              .describe("The stock ticker symbol, e.g., AAPL for Apple Inc."),
          }),
        },
      },
    });

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
      // Runtime tools: use the real MCP tool plus your local tools.
      // We don’t pass the typing-only placeholder.
      tools: { ...mcpTools, ...tools },
      stopWhen: stepCountIs(2),
      onFinish: async () => {
        await mcpClient.close();
      },
      onError: async (error) => {
        await mcpClient.close();
        console.error("Error during streaming", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to generate text stream. Please try again.", {
      status: 500,
    });
  }
}
