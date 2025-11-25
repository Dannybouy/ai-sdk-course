"use client";

import type { ChatMessage } from "@/app/api/web-search-tool/route";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import React, { useState } from "react";

export default function WebSearchToolPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error, stop } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/web-search-tool",
    }),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {error && <div className="text-red-500 mb-4">{error.message}</div>}

      {messages.map((message) => {
        const sources = message.parts.filter(
          (part) => part.type === "source-url"
        );

        return (
          <div key={message.id} className="mb-4">
            <div className="font-semibold">
              {message.role === "user" ? "You" : "AI"}
            </div>

            {message.parts.map((part, index) => {
              switch (part.type) {
                case "text":
                  return (
                    <div
                      key={`${message.id}-${index}`}
                      className="whitespace-pre-wrap"
                    >
                      {part.text}
                    </div>
                  );
                // We no longer render the whole sources block here per source-url part
                case "source-url":
                  // Optional: render nothing here, or a simple placeholder if needed.
                  return null;
                default:
                  return null;
              }
            })}

            {/* Single sources block rendered once if any source-url parts exist */}
            {message.role === "assistant" && sources.length > 0 && (
              <div className="mt-5 mb-2">
                <div className="mb-2">✅ Web search complete</div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-800 rounded-lg px-4 py-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Sources ({sources.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sources.map((source, srcIndex) => {
                      if (source.type === "source-url") {
                        return (
                          <a
                            key={`${message.id}-${srcIndex}`}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                            title={source.url}
                          >
                            {source.title}
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {(status === "submitted" || status === "streaming") && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full size-4 border-b-2 border-blue-400"></div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {status === "submitted" || status === "streaming" ? (
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
              disabled={status !== "ready"}
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
