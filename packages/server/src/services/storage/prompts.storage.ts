// ──────────────────────────────────────────────
// Storage: Prompt Presets & Sections
// ──────────────────────────────────────────────
import { eq, desc } from "drizzle-orm";
import type { DB } from "../../db/connection.js";
import { promptPresets, promptSections } from "../../db/schema/index.js";
import { newId, now } from "../../utils/id-generator.js";
import type { CreatePromptPresetInput, CreatePromptSectionInput } from "@rpg-engine/shared";
import { DEFAULT_GENERATION_PARAMS } from "@rpg-engine/shared";

export function createPromptsStorage(db: DB) {
  return {
    async list() {
      return db.select().from(promptPresets).orderBy(desc(promptPresets.updatedAt));
    },

    async getById(id: string) {
      const rows = await db.select().from(promptPresets).where(eq(promptPresets.id, id));
      return rows[0] ?? null;
    },

    async create(input: CreatePromptPresetInput) {
      const id = newId();
      const timestamp = now();
      await db.insert(promptPresets).values({
        id,
        name: input.name,
        description: input.description ?? "",
        sectionOrder: JSON.stringify([]),
        variableGroups: JSON.stringify(input.variableGroups ?? []),
        variableValues: JSON.stringify(input.variableValues ?? {}),
        parameters: JSON.stringify(input.parameters ?? DEFAULT_GENERATION_PARAMS),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return this.getById(id);
    },

    async update(id: string, data: Partial<CreatePromptPresetInput & { sectionOrder: string[] }>) {
      const updateFields: Record<string, unknown> = { updatedAt: now() };
      if (data.name !== undefined) updateFields.name = data.name;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.sectionOrder !== undefined) updateFields.sectionOrder = JSON.stringify(data.sectionOrder);
      if (data.variableGroups !== undefined) updateFields.variableGroups = JSON.stringify(data.variableGroups);
      if (data.variableValues !== undefined) updateFields.variableValues = JSON.stringify(data.variableValues);
      if (data.parameters !== undefined) updateFields.parameters = JSON.stringify(data.parameters);
      await db.update(promptPresets).set(updateFields).where(eq(promptPresets.id, id));
      return this.getById(id);
    },

    async remove(id: string) {
      await db.delete(promptPresets).where(eq(promptPresets.id, id));
    },

    // ── Sections ──

    async listSections(presetId: string) {
      return db
        .select()
        .from(promptSections)
        .where(eq(promptSections.presetId, presetId))
        .orderBy(promptSections.injectionOrder);
    },

    async getSection(id: string) {
      const rows = await db.select().from(promptSections).where(eq(promptSections.id, id));
      return rows[0] ?? null;
    },

    async createSection(input: CreatePromptSectionInput) {
      const id = newId();
      await db.insert(promptSections).values({
        id,
        presetId: input.presetId,
        identifier: input.identifier,
        name: input.name,
        content: input.content ?? "",
        role: input.role ?? "system",
        enabled: String(input.enabled ?? true),
        isMarker: String(input.isMarker ?? false),
        injectionPosition: input.injectionPosition ?? "ordered",
        injectionDepth: input.injectionDepth ?? 0,
        injectionOrder: input.injectionOrder ?? 100,
        wrapInXml: String(input.wrapInXml ?? false),
        xmlTagName: input.xmlTagName ?? "",
        forbidOverrides: String(input.forbidOverrides ?? false),
      });
      // Add to preset's section order
      const preset = await this.getById(input.presetId);
      if (preset) {
        const order = JSON.parse(preset.sectionOrder as string) as string[];
        order.push(id);
        await this.update(input.presetId, { sectionOrder: order });
      }
      return this.getSection(id);
    },

    async updateSection(id: string, data: Partial<CreatePromptSectionInput>) {
      const updateFields: Record<string, unknown> = {};
      if (data.name !== undefined) updateFields.name = data.name;
      if (data.content !== undefined) updateFields.content = data.content;
      if (data.role !== undefined) updateFields.role = data.role;
      if (data.enabled !== undefined) updateFields.enabled = String(data.enabled);
      if (data.injectionPosition !== undefined) updateFields.injectionPosition = data.injectionPosition;
      if (data.injectionDepth !== undefined) updateFields.injectionDepth = data.injectionDepth;
      if (data.injectionOrder !== undefined) updateFields.injectionOrder = data.injectionOrder;
      if (data.wrapInXml !== undefined) updateFields.wrapInXml = String(data.wrapInXml);
      if (data.xmlTagName !== undefined) updateFields.xmlTagName = data.xmlTagName;
      if (data.forbidOverrides !== undefined) updateFields.forbidOverrides = String(data.forbidOverrides);
      await db.update(promptSections).set(updateFields).where(eq(promptSections.id, id));
      return this.getSection(id);
    },

    async removeSection(id: string) {
      const section = await this.getSection(id);
      if (section) {
        // Remove from preset's section order
        const preset = await this.getById(section.presetId);
        if (preset) {
          const order = (JSON.parse(preset.sectionOrder as string) as string[]).filter((sid) => sid !== id);
          await this.update(section.presetId, { sectionOrder: order });
        }
      }
      await db.delete(promptSections).where(eq(promptSections.id, id));
    },
  };
}
