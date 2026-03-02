// ──────────────────────────────────────────────
// Schema: Lorebooks & Entries
// ──────────────────────────────────────────────
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const lorebooks = sqliteTable("lorebooks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  scanDepth: integer("scan_depth").notNull().default(2),
  tokenBudget: integer("token_budget").notNull().default(2048),
  recursiveScanning: text("recursive_scanning").notNull().default("false"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const lorebookEntries = sqliteTable("lorebook_entries", {
  id: text("id").primaryKey(),
  lorebookId: text("lorebook_id").notNull().references(() => lorebooks.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull().default(""),
  /** JSON array of primary keywords */
  keys: text("keys").notNull().default("[]"),
  /** JSON array of secondary keywords */
  secondaryKeys: text("secondary_keys").notNull().default("[]"),

  enabled: text("enabled").notNull().default("true"),
  constant: text("constant").notNull().default("false"),
  selective: text("selective").notNull().default("false"),
  selectiveLogic: text("selective_logic", { enum: ["and", "or", "not"] }).notNull().default("and"),
  probability: integer("probability"),
  scanDepth: integer("scan_depth"),
  matchWholeWords: text("match_whole_words").notNull().default("false"),
  caseSensitive: text("case_sensitive").notNull().default("false"),

  position: integer("position").notNull().default(0),
  depth: integer("depth").notNull().default(4),
  order: integer("order").notNull().default(100),
  role: text("role", { enum: ["system", "user", "assistant"] }).notNull().default("system"),

  sticky: integer("sticky"),
  cooldown: integer("cooldown"),
  delay: integer("delay"),
  group: text("group").notNull().default(""),
  groupWeight: integer("group_weight"),

  // Engine extensions
  category: text("category").notNull().default("uncategorized"),
  /** JSON object { entryId: relationshipType } */
  relationships: text("relationships").notNull().default("{}"),
  /** JSON object for dynamic state */
  dynamicState: text("dynamic_state").notNull().default("{}"),
  /** JSON array of activation conditions */
  activationConditions: text("activation_conditions").notNull().default("[]"),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
