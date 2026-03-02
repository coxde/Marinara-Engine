// ──────────────────────────────────────────────
// Prompt Zod Schemas
// ──────────────────────────────────────────────
import { z } from "zod";

export const promptRoleSchema = z.enum(["system", "user", "assistant"]);

export const injectionPositionSchema = z.enum(["ordered", "depth"]);

export const generationParametersSchema = z.object({
  temperature: z.number().min(0).max(2).default(1),
  topP: z.number().min(0).max(1).default(1),
  topK: z.number().int().min(0).default(0),
  minP: z.number().min(0).max(1).default(0),
  maxTokens: z.number().int().min(1).default(4096),
  maxContext: z.number().int().min(1).default(128000),
  frequencyPenalty: z.number().min(-2).max(2).default(0),
  presencePenalty: z.number().min(-2).max(2).default(0),
  reasoningEffort: z.enum(["low", "medium", "high"]).nullable().default(null),
  squashSystemMessages: z.boolean().default(true),
  showThoughts: z.boolean().default(true),
  stopSequences: z.array(z.string()).default([]),
});

export const promptVariableOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const promptVariableGroupSchema = z.object({
  name: z.string(),
  label: z.string(),
  options: z.array(promptVariableOptionSchema),
});

export const createPromptPresetSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().default(""),
  variableGroups: z.array(promptVariableGroupSchema).default([]),
  variableValues: z.record(z.string()).default({}),
  parameters: generationParametersSchema.default({}),
});

export const createPromptSectionSchema = z.object({
  presetId: z.string(),
  identifier: z.string(),
  name: z.string().min(1).max(200),
  content: z.string().default(""),
  role: promptRoleSchema.default("system"),
  enabled: z.boolean().default(true),
  isMarker: z.boolean().default(false),
  injectionPosition: injectionPositionSchema.default("ordered"),
  injectionDepth: z.number().int().min(0).default(0),
  injectionOrder: z.number().int().default(100),
  wrapInXml: z.boolean().default(false),
  xmlTagName: z.string().default(""),
  forbidOverrides: z.boolean().default(false),
});

export type CreatePromptPresetInput = z.infer<typeof createPromptPresetSchema>;
export type CreatePromptSectionInput = z.infer<typeof createPromptSectionSchema>;
export type GenerationParametersInput = z.infer<typeof generationParametersSchema>;
