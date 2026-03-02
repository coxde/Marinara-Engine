// ──────────────────────────────────────────────
// Schema: Characters & Personas
// ──────────────────────────────────────────────
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const characters = sqliteTable("characters", {
  id: text("id").primaryKey(),
  /** Full CharacterData V2 as JSON */
  data: text("data").notNull(),
  avatarPath: text("avatar_path"),
  spriteFolderPath: text("sprite_folder_path"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const personas = sqliteTable("personas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  avatarPath: text("avatar_path"),
  isActive: text("is_active").notNull().default("false"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
