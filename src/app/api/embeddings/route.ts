import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Generate a text embedding for multiple input texts/Array
    console.log("Request body:", body);

    if (Array.isArray(body.text)) {
      const { values, embeddings, usage } = await embedMany({
        model: google.textEmbedding("gemini-embedding-001"),
        values: body.text,
        maxParallelCalls: 5,
      });

      return Response.json({
        values,
        embeddings,
        usage,
        dimensions: embeddings[0].length,
        count: embeddings.length,
      });
    }

    // Generate a text embedding for a single input text
    const { value, embedding, usage } = await embed({
      model: google.textEmbedding("gemini-embedding-001"),
      value: body.text,
    });

    return Response.json({
      value,
      embedding,
      usage,
      dimensions: embedding.length,
    });
  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Response("Failed to generate embedding. Please try again.", {
      status: 500,
    });
  }
}
