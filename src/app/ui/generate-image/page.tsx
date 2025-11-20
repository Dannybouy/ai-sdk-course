"use client";

import Image from "next/image";
import { useState } from "react";

export default function GenerateImagePage() {
  const [prompt, setPrompt] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setImageSrc(null);
    setPrompt("");
    setError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setImageSrc(`data:image/png;base64,${data}`);
    } catch (error) {
      console.log("Error generating image:", error);
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
    <div className="flex flex-col w-full max-w-2xl pt-12 pb-24 mx-auto">
      {/* Page content goes here */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="relative w-full aspect-square mb-20">
        {isLoading ? (
          <div className="w-full h-full animate-pulse bg-gray-300 rounded-lg" />
        ) : (
          imageSrc && (
            <Image
              src={imageSrc}
              alt="Generated image"
              className="w-full h-full object-cover rounded-lg shadow-lg"
              width={1024}
              height={1024}
            />
          )
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zince-700 rounded shadow-xl"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            Generate
          </button>
        </div>
      </form>
    </div>
  );
}
