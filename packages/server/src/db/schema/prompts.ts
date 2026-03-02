// ──────────────────────────────────────────────
// Schema: Prompt Presets & Sections
// ──────────────────────────────────────────────
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const promptPresets = sqliteTable("prompt_presets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  /** JSON array of section IDs in order */
  sectionOrder: text("section_order").notNull().default("[]"),
  /** JSON array of variable groups */
  variableGroups: text("variable_groups").notNull().default("[]"),
  /** JSON object of current variable values */
  variableValues: text("variable_values").notNull().default("{}"),
  /** JSON object of generation parameters */
  parameters: text("parameters").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const promptSections = sqliteTable("prompt_sections", {
  id: text("id").primaryKey(),
  presetId: text("preset_id").notNull().references(() => promptPresets.id, { onDelete: "cascade" }),
  identifier: text("identifier").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull().default(""),
  role: text("role", { enum: ["system", "user", "assistant"] }).notNull().default("system"),
  enabled: text("enabled").notNull().default("true"),
  isMarker: text("is_marker").notNull().default("false"),
  injectionPosition: text("injection_position", { enum: ["ordered", "depth"] }).notNull().default("ordered"),
  injectionDepth: integer("injection_depth").notNull().default(0),
  injectionOrder: integer("injection_order").notNull().default(100),
  wrapInXml: text("wrap_in_xml").notNull().default("false"),
  xmlTagName: text("xml_tag_name").notNull().default(""),
  forbidOverrides: text("forbid_overrides").notNull().default("false"),
});
