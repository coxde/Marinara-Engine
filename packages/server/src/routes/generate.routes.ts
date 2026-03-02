// ──────────────────────────────────────────────
// Routes: Generation (SSE Streaming)
// ──────────────────────────────────────────────
import type { FastifyInstance } from "fastify";
import { generateRequestSchema } from "@rpg-engine/shared";
import { createChatsStorage } from "../services/storage/chats.storage.js";
import { createConnectionsStorage } from "../services/storage/connections.storage.js";
import { createLLMProvider } from "../services/llm/provider-registry.js";

export async function generateRoutes(app: FastifyInstance) {
  const chats = createChatsStorage(app.db);
  const connections = createConnectionsStorage(app.db);

  /**
   * POST /api/generate
   * Streams AI generation via Server-Sent Events.
   */
  app.post("/", async (req, reply) => {
    const input = generateRequestSchema.parse(req.body);

    // Resolve the chat
    const chat = await chats.getById(input.chatId);
    if (!chat) {
      return reply.status(404).send({ error: "Chat not found" });
    }

    // Save user message (if provided)
    if (input.userMessage) {
      await chats.createMessage({
        chatId: input.chatId,
        role: "user",
        characterId: null,
        content: input.userMessage,
      });
    }

    // Resolve connection
    const connId = input.connectionId ?? chat.connectionId;
    if (!connId) {
      return reply.status(400).send({ error: "No API connection configured for this chat" });
    }
    const conn = await connections.getWithKey(connId);
    if (!conn) {
      return reply.status(400).send({ error: "API connection not found" });
    }

    // Resolve base URL — fall back to provider default if empty
    let baseUrl = conn.baseUrl;
    if (!baseUrl) {
      const { PROVIDERS } = await import("@rpg-engine/shared");
      const providerDef = PROVIDERS[conn.provider as keyof typeof PROVIDERS];
      baseUrl = providerDef?.defaultBaseUrl ?? "";
    }
    if (!baseUrl) {
      return reply.status(400).send({ error: "No base URL configured for this connection" });
    }

    // Set up SSE headers
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    try {
      // Get messages for context
      const chatMessages = await chats.listMessages(input.chatId);

      // Build simple prompt (will be enhanced with full prompt assembler later)
      const promptMessages = chatMessages.map((m: any) => ({
        role: m.role === "narrator" ? ("system" as const) : (m.role as "user" | "assistant" | "system"),
        content: m.content,
      }));

      // Create provider and stream
      const provider = createLLMProvider(conn.provider, baseUrl, conn.apiKey);
      let fullResponse = "";

      for await (const chunk of provider.chat(promptMessages, {
        model: conn.model,
        temperature: 1,
        maxTokens: 4096,
        stream: true,
      })) {
        fullResponse += chunk;
        reply.raw.write(`data: ${JSON.stringify({ type: "token", data: chunk })}\n\n`);
      }

      // Save assistant message
      const characterIds: string[] = JSON.parse(chat.characterIds as string);
      await chats.createMessage({
        chatId: input.chatId,
        role: "assistant",
        characterId: characterIds[0] ?? null,
        content: fullResponse,
      });

      // Signal completion
      reply.raw.write(`data: ${JSON.stringify({ type: "done", data: "" })}\n\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      reply.raw.write(`data: ${JSON.stringify({ type: "error", data: message })}\n\n`);
    } finally {
      reply.raw.end();
    }
  });
}
