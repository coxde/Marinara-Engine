// ──────────────────────────────────────────────
// React Query: Generation (streaming)
// ──────────────────────────────────────────────
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api-client";
import { useChatStore } from "../stores/chat.store";
import { chatKeys } from "./use-chats";

/**
 * Hook that handles streaming generation.
 * Returns a function to trigger generation which streams tokens
 * into the chat store and invalidates messages on completion.
 */
export function useGenerate() {
  const qc = useQueryClient();
  const { setStreaming, appendStreamBuffer, clearStreamBuffer, addMessage } = useChatStore();

  const generate = useCallback(
    async (params: {
      chatId: string;
      connectionId: string | null;
      presetId?: string;
      lorebookIds?: string[];
      userMessage?: string;
    }) => {
      setStreaming(true);
      clearStreamBuffer();

      try {
        let fullText = "";
        for await (const token of api.stream("/generate", params)) {
          fullText += token;
          appendStreamBuffer(token);
        }

        // Invalidate messages to pick up saved messages from backend
        await qc.invalidateQueries({
          queryKey: chatKeys.messages(params.chatId),
        });
      } catch (error) {
        console.error("Generation error:", error);
        throw error;
      } finally {
        setStreaming(false);
        clearStreamBuffer();
      }
    },
    [qc, setStreaming, appendStreamBuffer, clearStreamBuffer],
  );

  return { generate };
}
