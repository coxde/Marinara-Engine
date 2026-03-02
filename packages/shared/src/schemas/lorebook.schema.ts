// ──────────────────────────────────────────────
// Lorebook Zod Schemas
// ──────────────────────────────────────────────
import { z } from "zod";

export const lorebookCategorySchema = z.enum([
  "location", "character", "item", "lore",
  "quest", "event", "system", "uncategorized",
]);

export const selectiveLogicSchema = z.enum(["and", "or", "not"]);

export const activationConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(["equals", "not_equals", "contains", "not_contains", "gt", "lt"]),
  value: z.string(),
});

export const createLorebookSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().default(""),
  scanDepth: z.number().int().min(0).default(2),
  tokenBudget: z.number().int().min(0).default(2048),
  recursiveScanning: z.boolean().default(false),
});

export const createLorebookEntrySchema = z.object({
  lorebookId: z.string(),
  name: z.string().min(1).max(200),
  content: z.string().default(""),
  keys: z.array(z.string()).default([]),
  secondaryKeys: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
  constant: z.boolean().default(false),
  selective: z.boolean().default(false),
  selectiveLogic: selectiveLogicSchema.default("and"),
  probability: z.number().nullable().default(null),
  scanDepth: z.number().nullable().default(null),
  matchWholeWords: z.boolean().default(false),
  caseSensitive: z.boolean().default(false),
  position: z.number().int().min(0).max(1).default(0),
  depth: z.number().int().min(0).default(4),
  order: z.number().int().default(100),
  role: z.enum(["system", "user", "assistant"]).default("system"),
  sticky: z.number().nullable().default(null),
  cooldown: z.number().nullable().default(null),
  delay: z.number().nullable().default(null),
  group: z.string().default(""),
  groupWeight: z.number().nullable().default(null),
  category: lorebookCategorySchema.default("uncategorized"),
  relationships: z.record(z.string()).default({}),
  dynamicState: z.record(z.unknown()).default({}),
  activationConditions: z.array(activationConditionSchema).default([]),
});

export type CreateLorebookInput = z.infer<typeof createLorebookSchema>;
export type CreateLorebookEntryInput = z.infer<typeof createLorebookEntrySchema>;
