"use client";

import { useCompletion } from "@ai-sdk/react";

export default function CompletionPage() {
  // useCompletion function to handle streaming AI response
  const {
    input,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
    error,
    setInput,
    stop, // stop the streaming request
  } = useCompletion({
    api: "/api/stream",
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {/* Display area for completion results */}
      {error && (
        <div className="p-4 mb-4 text-center text-red-500">{error.message}</div>
      )}

      {isLoading && !completion && (
        <div className="p-4 mb-4 text-center text-gray-500">Loading...</div>
      )}

      {completion && (
        <div className="p-4 mb-4 border border-zinc-300 dark:border-zinc-700 rounded shadow-sm whitespace-pre-wrap bg-zinc-100 dark:bg-zinc-900">
          {completion}
        </div>
      )}

      <form
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          setInput("");
          handleSubmit(e);
        }}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zince-700 rounded shadow-xl"
            placeholder="Ask me anything..."
            type="text"
            value={input}
            onChange={handleInputChange}
          />
          {isLoading ? (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              onClick={stop}
            >
              Stop
            </button>
          ) : (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
