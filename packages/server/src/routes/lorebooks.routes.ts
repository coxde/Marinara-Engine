// ──────────────────────────────────────────────
// Routes: Lorebooks
// ──────────────────────────────────────────────
import type { FastifyInstance } from "fastify";
import { createLorebookSchema, createLorebookEntrySchema } from "@rpg-engine/shared";
import { createLorebooksStorage } from "../services/storage/lorebooks.storage.js";

export async function lorebooksRoutes(app: FastifyInstance) {
  const storage = createLorebooksStorage(app.db);

  app.get("/", async () => {
    return storage.list();
  });

  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const lb = await storage.getById(req.params.id);
    if (!lb) return reply.status(404).send({ error: "Lorebook not found" });
    return lb;
  });

  app.post("/", async (req) => {
    const input = createLorebookSchema.parse(req.body);
    return storage.create(input);
  });

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    await storage.remove(req.params.id);
    return reply.status(204).send();
  });

  // ── Entries ──

  app.get<{ Params: { id: string } }>("/:id/entries", async (req) => {
    return storage.listEntries(req.params.id);
  });

  app.post<{ Params: { id: string } }>("/:id/entries", async (req) => {
    const input = createLorebookEntrySchema.parse({
      ...(req.body as Record<string, unknown>),
      lorebookId: req.params.id,
    });
    return storage.createEntry(input);
  });

  app.delete<{ Params: { lorebookId: string; entryId: string } }>(
    "/:lorebookId/entries/:entryId",
    async (req, reply) => {
      await storage.removeEntry(req.params.entryId);
      return reply.status(204).send();
    },
  );
}
