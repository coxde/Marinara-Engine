// ──────────────────────────────────────────────
// Storage: Characters
// ──────────────────────────────────────────────
import { eq, desc } from "drizzle-orm";
import type { DB } from "../../db/connection.js";
import { characters, personas } from "../../db/schema/index.js";
import { newId, now } from "../../utils/id-generator.js";
import type { CharacterData } from "@rpg-engine/shared";

export function createCharactersStorage(db: DB) {
  return {
    // ── Characters ──

    async list() {
      return db.select().from(characters).orderBy(desc(characters.updatedAt));
    },

    async getById(id: string) {
      const rows = await db.select().from(characters).where(eq(characters.id, id));
      return rows[0] ?? null;
    },

    async create(data: CharacterData, avatarPath?: string) {
      const id = newId();
      const timestamp = now();
      await db.insert(characters).values({
        id,
        data: JSON.stringify(data),
        avatarPath: avatarPath ?? null,
        spriteFolderPath: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return this.getById(id);
    },

    async update(id: string, data: Partial<CharacterData>, avatarPath?: string) {
      const existing = await this.getById(id);
      if (!existing) return null;
      const currentData = JSON.parse(existing.data) as CharacterData;
      const merged = { ...currentData, ...data };
      await db
        .update(characters)
        .set({
          data: JSON.stringify(merged),
          ...(avatarPath !== undefined && { avatarPath }),
          updatedAt: now(),
        })
        .where(eq(characters.id, id));
      return this.getById(id);
    },

    async remove(id: string) {
      await db.delete(characters).where(eq(characters.id, id));
    },

    // ── Personas ──

    async listPersonas() {
      return db.select().from(personas).orderBy(desc(personas.updatedAt));
    },

    async getPersona(id: string) {
      const rows = await db.select().from(personas).where(eq(personas.id, id));
      return rows[0] ?? null;
    },

    async createPersona(name: string, description: string, avatarPath?: string) {
      const id = newId();
      const timestamp = now();
      await db.insert(personas).values({
        id,
        name,
        description,
        avatarPath: avatarPath ?? null,
        isActive: "false",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return this.getPersona(id);
    },

    async setActivePersona(id: string) {
      // Deactivate all
      await db.update(personas).set({ isActive: "false" });
      // Activate the one
      await db.update(personas).set({ isActive: "true", updatedAt: now() }).where(eq(personas.id, id));
    },

    async removePersona(id: string) {
      await db.delete(personas).where(eq(personas.id, id));
    },
  };
}
