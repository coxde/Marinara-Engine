// ──────────────────────────────────────────────
// Storage: Agent Configs
// ──────────────────────────────────────────────
import { eq, desc } from "drizzle-orm";
import type { DB } from "../../db/connection.js";
import { agentConfigs } from "../../db/schema/index.js";
import { newId, now } from "../../utils/id-generator.js";
import type { CreateAgentConfigInput } from "@rpg-engine/shared";

export function createAgentsStorage(db: DB) {
  return {
    async list() {
      return db.select().from(agentConfigs).orderBy(desc(agentConfigs.updatedAt));
    },

    async getById(id: string) {
      const rows = await db.select().from(agentConfigs).where(eq(agentConfigs.id, id));
      return rows[0] ?? null;
    },

    async getByType(type: string) {
      const rows = await db.select().from(agentConfigs).where(eq(agentConfigs.type, type));
      return rows[0] ?? null;
    },

    async create(input: CreateAgentConfigInput) {
      const id = newId();
      const timestamp = now();
      await db.insert(agentConfigs).values({
        id,
        type: input.type,
        name: input.name,
        description: input.description ?? "",
        phase: input.phase,
        enabled: String(input.enabled ?? true),
        connectionId: input.connectionId ?? null,
        promptTemplate: input.promptTemplate ?? "",
        settings: JSON.stringify(input.settings ?? {}),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return this.getById(id);
    },

    async update(id: string, data: Partial<CreateAgentConfigInput>) {
      const updateFields: Record<string, unknown> = { updatedAt: now() };
      if (data.name !== undefined) updateFields.name = data.name;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.phase !== undefined) updateFields.phase = data.phase;
      if (data.enabled !== undefined) updateFields.enabled = String(data.enabled);
      if (data.connectionId !== undefined) updateFields.connectionId = data.connectionId;
      if (data.promptTemplate !== undefined) updateFields.promptTemplate = data.promptTemplate;
      if (data.settings !== undefined) updateFields.settings = JSON.stringify(data.settings);
      await db.update(agentConfigs).set(updateFields).where(eq(agentConfigs.id, id));
      return this.getById(id);
    },

    async remove(id: string) {
      await db.delete(agentConfigs).where(eq(agentConfigs.id, id));
    },
  };
}
