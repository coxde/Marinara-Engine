// ──────────────────────────────────────────────
// Routes: Chats
// ──────────────────────────────────────────────
import type { FastifyInstance } from "fastify";
import { createChatSchema, createMessageSchema } from "@rpg-engine/shared";
import { createChatsStorage } from "../services/storage/chats.storage.js";

export async function chatsRoutes(app: FastifyInstance) {
  const storage = createChatsStorage(app.db);

  // List all chats
  app.get("/", async () => {
    return storage.list();
  });

  // Get single chat
  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const chat = await storage.getById(req.params.id);
    if (!chat) return reply.status(404).send({ error: "Chat not found" });
    return chat;
  });

  // Create chat
  app.post("/", async (req) => {
    const input = createChatSchema.parse(req.body);
    return storage.create(input);
  });

  // Update chat
  app.patch<{ Params: { id: string } }>("/:id", async (req) => {
    const data = createChatSchema.partial().parse(req.body);
    return storage.update(req.params.id, data);
  });

  // Delete chat
  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    await storage.remove(req.params.id);
    return reply.status(204).send();
  });

  // ── Messages ──

  // List messages for a chat
  app.get<{ Params: { id: string } }>("/:id/messages", async (req) => {
    return storage.listMessages(req.params.id);
  });

  // Create message
  app.post<{ Params: { id: string } }>("/:id/messages", async (req) => {
    const input = createMessageSchema.parse({ ...(req.body as Record<string, unknown>), chatId: req.params.id });
    return storage.createMessage(input);
  });

  // Delete message
  app.delete<{ Params: { chatId: string; messageId: string } }>(
    "/:chatId/messages/:messageId",
    async (req, reply) => {
      await storage.removeMessage(req.params.messageId);
      return reply.status(204).send();
    },
  );

  // ── Swipes ──

  // List swipes for a message
  app.get<{ Params: { chatId: string; messageId: string } }>(
    "/:chatId/messages/:messageId/swipes",
    async (req) => {
      return storage.getSwipes(req.params.messageId);
    },
  );

  // Add a swipe
  app.post<{ Params: { chatId: string; messageId: string } }>(
    "/:chatId/messages/:messageId/swipes",
    async (req) => {
      const { content } = req.body as { content: string };
      return storage.addSwipe(req.params.messageId, content);
    },
  );

  // Set active swipe
  app.put<{ Params: { chatId: string; messageId: string } }>(
    "/:chatId/messages/:messageId/active-swipe",
    async (req) => {
      const { index } = req.body as { index: number };
      return storage.setActiveSwipe(req.params.messageId, index);
    },
  );
}
