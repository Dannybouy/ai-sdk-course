import { UIMessage } from "ai";
import { z } from "zod";

// We need to define the metadata structure that will be attached to each message.

export const messageMetadataSchema = z.object({
  createdAt: z.number().optional(),
  totalTokens: z.number().optional(),
});

// This type represents the metadata we will attach to each message.
export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

// We extend the UIMessage type to include our MessageMetadata.
export type MyUIMessage = UIMessage<MessageMetadata>;
