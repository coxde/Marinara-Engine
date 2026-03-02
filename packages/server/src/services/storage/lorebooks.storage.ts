// ──────────────────────────────────────────────
// Storage: Lorebooks
// ──────────────────────────────────────────────
import { eq, desc } from "drizzle-orm";
import type { DB } from "../../db/connection.js";
import { lorebooks, lorebookEntries } from "../../db/schema/index.js";
import { newId, now } from "../../utils/id-generator.js";
import type { CreateLorebookInput, CreateLorebookEntryInput } from "@rpg-engine/shared";

export function createLorebooksStorage(db: DB) {
  return {
    async list() {
      return db.select().from(lorebooks).orderBy(desc(lorebooks.updatedAt));
    },

    async getById(id: string) {
      const rows = await db.select().from(lorebooks).where(eq(lorebooks.id, id));
      return rows[0] ?? null;
    },

    async create(input: CreateLorebookInput) {
      const id = newId();
      const timestamp = now();
      await db.insert(lorebooks).values({
        id,
        name: input.name,
        description: input.description ?? "",
        scanDepth: input.scanDepth ?? 2,
        tokenBudget: input.tokenBudget ?? 2048,
        recursiveScanning: String(input.recursiveScanning ?? false),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return this.getById(id);
    },

    async remove(id: string) {
      await db.delete(lorebooks).where(eq(lorebooks.id, id));
    },

    // ── Entries ──

    async listEntries(lorebookId: string) {
      return db
        .select()
        .from(lorebookEntries)
        .where(eq(lorebookEntries.lorebookId, lorebookId))
        .orderBy(lorebookEntries.order);
    },

    async getEntry(id: string) {
      const rows = await db.select().from(lorebookEntries).where(eq(lorebookEntries.id, id));
      return rows[0] ?? null;
    },

    async createEntry(input: CreateLorebookEntryInput) {
      const id = newId();
      const timestamp = now();
      await db.insert(lorebookEntries).values({
        id,
        lorebookId: input.lorebookId,
        name: input.name,
        content: input.content ?? "",
        keys: JSON.stringify(input.keys ?? []),
        secondaryKeys: JSON.stringify(input.secondaryKeys ?? []),
        enabled: String(input.enabled ?? true),
        constant: String(input.constant ?? false),
        selective: String(input.selective ?? false),
        selectiveLogic: input.selectiveLogic ?? "and",
        probability: input.probability ?? null,
        scanDepth: input.scanDepth ?? null,
        matchWholeWords: String(input.matchWholeWords ?? false),
        caseSensitive: String(input.caseSensitive ?? false),
        position: input.position ?? 0,
        depth: input.depth ?? 4,
        order: input.order ?? 100,
        role: input.role ?? "system",
        sticky: input.sticky ?? null,
        cooldown: input.cooldown ?? null,
        delay: input.delay ?? null,
        group: input.group ?? "",
        groupWeight: input.groupWeight ?? null,
        category: input.category ?? "uncategorized",
        relationships: JSON.stringify(input.relationships ?? {}),
        dynamicState: JSON.stringify(input.dynamicState ?? {}),
        activationConditions: JSON.stringify(input.activationConditions ?? []),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return this.getEntry(id);
    },

    async removeEntry(id: string) {
      await db.delete(lorebookEntries).where(eq(lorebookEntries.id, id));
    },
  };
}
