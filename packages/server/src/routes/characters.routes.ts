// ──────────────────────────────────────────────
// Routes: Characters & Personas
// ──────────────────────────────────────────────
import type { FastifyInstance } from "fastify";
import { createCharacterSchema } from "@rpg-engine/shared";
import { createCharactersStorage } from "../services/storage/characters.storage.js";

export async function charactersRoutes(app: FastifyInstance) {
  const storage = createCharactersStorage(app.db);

  // ── Characters ──

  app.get("/", async () => {
    return storage.list();
  });

  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const char = await storage.getById(req.params.id);
    if (!char) return reply.status(404).send({ error: "Character not found" });
    return char;
  });

  app.post("/", async (req) => {
    const input = createCharacterSchema.parse(req.body);
    return storage.create(input.data);
  });

  app.patch<{ Params: { id: string } }>("/:id", async (req) => {
    const update = createCharacterSchema.partial().parse(req.body);
    return storage.update(req.params.id, update.data ?? {});
  });

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    await storage.remove(req.params.id);
    return reply.status(204).send();
  });

  // ── Personas ──

  app.get("/personas/list", async () => {
    return storage.listPersonas();
  });

  app.get<{ Params: { id: string } }>("/personas/:id", async (req, reply) => {
    const persona = await storage.getPersona(req.params.id);
    if (!persona) return reply.status(404).send({ error: "Persona not found" });
    return persona;
  });

  app.post("/personas", async (req) => {
    const { name, description } = req.body as { name: string; description?: string };
    return storage.createPersona(name, description ?? "");
  });

  app.put<{ Params: { id: string } }>("/personas/:id/activate", async (req) => {
    await storage.setActivePersona(req.params.id);
    return { success: true };
  });

  app.delete<{ Params: { id: string } }>("/personas/:id", async (req, reply) => {
    await storage.removePersona(req.params.id);
    return reply.status(204).send();
  });
}
