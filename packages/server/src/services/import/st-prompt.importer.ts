// ──────────────────────────────────────────────
// Importer: SillyTavern Prompt Preset
// ──────────────────────────────────────────────
import type { DB } from "../../db/connection.js";
import { createPromptsStorage } from "../storage/prompts.storage.js";
import type { PromptVariableGroup } from "@rpg-engine/shared";

interface STPromptEntry {
  identifier: string;
  name: string;
  system_prompt?: boolean;
  role?: string;
  content?: string;
  marker?: boolean;
  enabled?: boolean;
  injection_position?: number;
  injection_depth?: number;
  injection_order?: number;
  forbid_overrides?: boolean;
}

interface STPreset {
  prompts?: STPromptEntry[];
  prompt_order?: Array<{
    character_id: number;
    order: Array<{ identifier: string; enabled: boolean }>;
  }>;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  min_p?: number;
  openai_max_tokens?: number;
  openai_max_context?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  reasoning_effort?: string;
  squash_system_messages?: boolean;
  show_thoughts?: boolean;
  [key: string]: unknown;
}

/**
 * Import a SillyTavern prompt preset JSON.
 * Parses the prompt array, variable toggle groups, and generation parameters.
 */
export async function importSTPreset(raw: Record<string, unknown>, db: DB) {
  const storage = createPromptsStorage(db);
  const preset = raw as unknown as STPreset;

  // Detect variable toggle groups from naming patterns
  const variableGroups = detectVariableGroups(preset.prompts ?? []);

  // Create the preset
  const created = await storage.create({
    name: `Imported: ${guessPresetName(raw)}`,
    description: "Imported from SillyTavern",
    variableGroups,
    variableValues: {},
    parameters: {
      temperature: preset.temperature ?? 1,
      topP: preset.top_p ?? 1,
      topK: preset.top_k ?? 0,
      minP: preset.min_p ?? 0,
      maxTokens: preset.openai_max_tokens ?? 4096,
      maxContext: preset.openai_max_context ?? 128000,
      frequencyPenalty: preset.frequency_penalty ?? 0,
      presencePenalty: preset.presence_penalty ?? 0,
      reasoningEffort: (preset.reasoning_effort as "low" | "medium" | "high") ?? null,
      squashSystemMessages: preset.squash_system_messages ?? true,
      showThoughts: preset.show_thoughts ?? true,
      stopSequences: [],
    },
  });

  if (!created) return { error: "Failed to create preset" };

  // Determine the section order from prompt_order (prefer the custom 100001 ordering)
  const orderDef = preset.prompt_order?.find((o) => o.character_id === 100001)
    ?? preset.prompt_order?.[0];
  const orderMap = new Map(
    orderDef?.order?.map((o, i) => [o.identifier, { index: i, enabled: o.enabled }]) ?? [],
  );

  // Import each prompt entry as a section
  const prompts = preset.prompts ?? [];
  let sectionsCreated = 0;

  for (const entry of prompts) {
    // Detect XML tag wrapping from naming pattern (┌ = open, └ = close)
    const isXmlWrapper = /^[┌└┎┖⌈⌊⌜⌞]/.test(entry.name);
    const hasContent = !!(entry.content?.trim());

    // Map ST role to our role
    let role: "system" | "user" | "assistant" = "system";
    if (entry.role === "user") role = "user";
    if (entry.role === "assistant") role = "assistant";

    // Determine injection position
    const injectionPosition = (entry.injection_position === 1) ? "depth" as const : "ordered" as const;

    // Check override from prompt_order
    const orderInfo = orderMap.get(entry.identifier);
    const enabled = orderInfo?.enabled ?? entry.enabled ?? true;

    await storage.createSection({
      presetId: created.id,
      identifier: entry.identifier,
      name: entry.name,
      content: entry.content ?? "",
      role,
      enabled,
      isMarker: entry.marker ?? false,
      injectionPosition,
      injectionDepth: entry.injection_depth ?? 0,
      injectionOrder: entry.injection_order ?? 100,
      wrapInXml: isXmlWrapper && hasContent,
      xmlTagName: isXmlWrapper ? extractXmlTagFromName(entry.name) : "",
      forbidOverrides: entry.forbid_overrides ?? false,
    });
    sectionsCreated++;
  }

  return {
    success: true,
    presetId: created.id,
    sectionsImported: sectionsCreated,
    variableGroups: variableGroups.length,
  };
}

/**
 * Detect variable toggle groups from ST's naming convention.
 * Patterns like "➊ Game Master", "➋ Roleplayer" with {{setvar::type::value}}
 */
function detectVariableGroups(prompts: STPromptEntry[]): PromptVariableGroup[] {
  const groups = new Map<string, PromptVariableGroup>();

  // Look for setvar patterns in content
  for (const entry of prompts) {
    if (!entry.content) continue;
    const matches = entry.content.matchAll(/\{\{setvar::(\w+)::([^}]+)\}\}/gi);
    for (const match of matches) {
      const varName = match[1]!;
      const varValue = match[2]!;
      if (!groups.has(varName)) {
        groups.set(varName, {
          name: varName,
          label: varName.charAt(0).toUpperCase() + varName.slice(1),
          options: [],
        });
      }
      const group = groups.get(varName)!;
      if (!group.options.find((o) => o.value === varValue)) {
        group.options.push({ label: entry.name.replace(/^[➊➋➌➍➎➏➐➑➀➁➂➃➄➅]\s*/, ""), value: varValue });
      }
    }
  }

  return Array.from(groups.values());
}

function extractXmlTagFromName(name: string): string {
  // Strip the bracket prefix and extract the tag name: "┌ role" → "role"
  return name.replace(/^[┌└┎┖⌈⌊⌜⌞]\s*/, "").replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
}

function guessPresetName(raw: Record<string, unknown>): string {
  if (typeof raw.name === "string") return raw.name;
  // Try to find a Read-Me prompt with a name
  const prompts = (raw.prompts ?? []) as STPromptEntry[];
  const readme = prompts.find((p) => p.name?.includes("Read-Me") || p.name?.includes("README"));
  if (readme?.content) {
    const nameMatch = readme.content.match(/(?:name|title|preset)[:\s]+["']?([^"'\n]+)/i);
    if (nameMatch) return nameMatch[1]!.trim();
  }
  return "SillyTavern Preset";
}
