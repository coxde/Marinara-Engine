// ──────────────────────────────────────────────
// Route Registration
// ──────────────────────────────────────────────
import type { FastifyInstance } from "fastify";
import { chatsRoutes } from "./chats.routes.js";
import { charactersRoutes } from "./characters.routes.js";
import { lorebooksRoutes } from "./lorebooks.routes.js";
import { promptsRoutes } from "./prompts.routes.js";
import { connectionsRoutes } from "./connections.routes.js";
import { agentsRoutes } from "./agents.routes.js";
import { generateRoutes } from "./generate.routes.js";
import { importRoutes } from "./import.routes.js";
import { backgroundsRoutes } from "./backgrounds.routes.js";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(chatsRoutes, { prefix: "/api/chats" });
  await app.register(charactersRoutes, { prefix: "/api/characters" });
  await app.register(lorebooksRoutes, { prefix: "/api/lorebooks" });
  await app.register(promptsRoutes, { prefix: "/api/prompts" });
  await app.register(connectionsRoutes, { prefix: "/api/connections" });
  await app.register(agentsRoutes, { prefix: "/api/agents" });
  await app.register(generateRoutes, { prefix: "/api/generate" });
  await app.register(importRoutes, { prefix: "/api/import" });
  await app.register(backgroundsRoutes, { prefix: "/api/backgrounds" });
}
