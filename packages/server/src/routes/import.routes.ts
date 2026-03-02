// ──────────────────────────────────────────────
// Routes: Import (SillyTavern data)
// ──────────────────────────────────────────────
import type { FastifyInstance } from "fastify";
import { importSTChat } from "../services/import/st-chat.importer.js";
import { importSTCharacter } from "../services/import/st-character.importer.js";
import { importSTPreset } from "../services/import/st-prompt.importer.js";
import { importSTLorebook } from "../services/import/st-lorebook.importer.js";

export async function importRoutes(app: FastifyInstance) {
  /** Import a SillyTavern JSONL chat file. */
  app.post("/st-chat", async (req) => {
    const data = await req.file();
    if (!data) return { error: "No file uploaded" };
    const content = await data.toBuffer();
    return importSTChat(content.toString("utf-8"), app.db);
  });

  /** Import a SillyTavern character (JSON body). */
  app.post("/st-character", async (req) => {
    return importSTCharacter(req.body as Record<string, unknown>, app.db);
  });

  /** Import a SillyTavern prompt preset (JSON body). */
  app.post("/st-preset", async (req) => {
    return importSTPreset(req.body as Record<string, unknown>, app.db);
  });

  /** Import a SillyTavern World Info / lorebook (JSON body). */
  app.post("/st-lorebook", async (req) => {
    return importSTLorebook(req.body as Record<string, unknown>, app.db);
  });
}
