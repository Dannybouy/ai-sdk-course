import { google } from "@ai-sdk/google";
import { cosineSimilarity, embed, embedMany } from "ai";
import { movies } from "./movies";

export async function POST(req: Request) {
  const { query } = await req.json();

  // Embed movie descriptions
  const { embeddings: MovieEmbeddings } = await embedMany({
    model: google.textEmbedding("gemini-embedding-001"),
    values: movies.map((movie) => movie.description),
  });

  // Embed user query
  const { embedding: QueryEmbedding } = await embed({
    model: google.textEmbedding("gemini-embedding-001"),
    value: query,
  });

  // Calculate cosine similarities
  const moviesWithScores = movies.map((movie, index) => {
    const similarity = cosineSimilarity(QueryEmbedding, MovieEmbeddings[index]);

    return { ...movie, similarity };
  });

  // Sort movies by similarity score in descending order
  moviesWithScores.sort((a, b) => b.similarity - a.similarity);

  const threshold = 0.7
  const relevantMoviesResults = moviesWithScores.filter(movie => movie.similarity >= threshold);

  const topResults = relevantMoviesResults.slice(0, 3);

  return Response.json({ results: topResults });
}
