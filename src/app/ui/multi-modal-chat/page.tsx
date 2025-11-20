"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import { useRef, useState } from "react";

export default function MultiModalChatPage() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/multi-modal-chat",
    }),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ text: input, files });
    setInput("");
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className="flex flex-col w-full max-w-md pt-12 pb-36 mx-auto stretch">
      {/* Display area for chat messages */}
      {error && <div className="text-red-500 mb-4">{error.message}</div>}

      {messages.map((message) => (
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
              case "file":
                if (part.mediaType?.startsWith("image/")) {
                  return (
                    <Image
                      key={`${message.id}-${index}`}
                      src={part.url}
                      alt={part.filename ?? `attachment-${index}`}
                      width={500}
                      height={500}
                    />
                  );
                }
                if (part.mediaType?.startsWith("application/pdf")) {
                  // an iframe is good way to display pdfs
                  return (
                    <iframe
                      key={`${message.id}-${index}`}
                      src={part.url}
                      title={part.filename ?? `attachment-${index}`}
                      width={500}
                      height={500}
                    ></iframe>
                  );
                }
                return null;
              default:
                return null;
            }
          })}
        </div>
      ))}

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
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              {files && files.length > 0
                ? `${files.length} file(s) selected`
                : "Attach files"}
            </label>
            <input
              type="file"
              name="file-upload"
              id="file-upload"
              className="hidden"
              accept={"image/*,application/pdf"}
              ref={fileInputRef}
              multiple
              onChange={(event) => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zince-700 rounded shadow-xl"
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
        </div>
      </form>
    </div>
  );
}
