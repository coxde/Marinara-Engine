// ──────────────────────────────────────────────
// Routes: Prompts
// ──────────────────────────────────────────────
import type { FastifyInstance } from "fastify";
import { createPromptPresetSchema, createPromptSectionSchema } from "@rpg-engine/shared";
import { createPromptsStorage } from "../services/storage/prompts.storage.js";

export async function promptsRoutes(app: FastifyInstance) {
  const storage = createPromptsStorage(app.db);

  app.get("/", async () => {
    return storage.list();
  });

  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const preset = await storage.getById(req.params.id);
    if (!preset) return reply.status(404).send({ error: "Preset not found" });
    return preset;
  });

  app.post("/", async (req) => {
    const input = createPromptPresetSchema.parse(req.body);
    return storage.create(input);
  });

  app.patch<{ Params: { id: string } }>("/:id", async (req) => {
    return storage.update(req.params.id, req.body as Record<string, unknown>);
  });

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    await storage.remove(req.params.id);
    return reply.status(204).send();
  });

  // ── Sections ──

  app.get<{ Params: { id: string } }>("/:id/sections", async (req) => {
    return storage.listSections(req.params.id);
  });

  app.post<{ Params: { id: string } }>("/:id/sections", async (req) => {
    const input = createPromptSectionSchema.parse({
      ...(req.body as Record<string, unknown>),
      presetId: req.params.id,
    });
    return storage.createSection(input);
  });

  app.patch<{ Params: { presetId: string; sectionId: string } }>(
    "/:presetId/sections/:sectionId",
    async (req) => {
      return storage.updateSection(req.params.sectionId, req.body as Record<string, unknown>);
    },
  );

  app.delete<{ Params: { presetId: string; sectionId: string } }>(
    "/:presetId/sections/:sectionId",
    async (req, reply) => {
      await storage.removeSection(req.params.sectionId);
      return reply.status(204).send();
    },
  );
}
