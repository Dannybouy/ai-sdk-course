import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  try {
    const result = await generateText({
      model: google("gemini-2.5-flash-image-preview"),
      prompt,
    });

    for (const file of result.files) {
      if (file.mediaType.startsWith("image/")) {
        return Response.json(file.uint8Array);
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response("Failed to generate image. Please try again.", {
      status: 500,
    });
  }
}
