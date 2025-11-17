"use client";

import { useState } from "react";

export default function CompletionPage() {
  const [prompt, setPrompt] = useState(""); // State to hold the user's prompt
  const [completion, setCompletion] = useState(""); // State to hold the AI response
  const [isLoading, setIsLoading] = useState(false); // State to indicate loading status
  const [error, setError] = useState<string | null>(null); // State to hold any error messages

  const complete = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setPrompt("");

    try {
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setCompletion(data.text);
    } catch (error) {
      console.error("Error fetching completion:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {/* Display area for completion results */}
      {error && (
        <div className="p-4 mb-4 text-center text-red-500">{error}</div>
      )}
      
      {isLoading ? (
        <div className="p-4 mb-4 text-center text-gray-500">Loading...</div>
      ) : completion ? (
        <div className="whitespace-pre-wrap">{completion}</div>
      ) : null}

      <form
        onSubmit={complete}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zince-700 rounded shadow-xl"
            placeholder="How can I help you?"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
