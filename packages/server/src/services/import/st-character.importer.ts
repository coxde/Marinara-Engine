// ──────────────────────────────────────────────
// Importer: SillyTavern Character (JSON / V2 Card)
// ──────────────────────────────────────────────
import type { DB } from "../../db/connection.js";
import { createCharactersStorage } from "../storage/characters.storage.js";
import type { CharacterData } from "@rpg-engine/shared";

/**
 * Import a SillyTavern character card (JSON format).
 * Handles V1, V2, Pygmalion, and RisuAI formats.
 */
export async function importSTCharacter(raw: Record<string, unknown>, db: DB) {
  const storage = createCharactersStorage(db);

  let data: CharacterData;

  // Detect format
  if (raw.spec === "chara_card_v2" && raw.data) {
    // V2 format — use directly
    data = normalizeV2(raw.data as Record<string, unknown>);
  } else if (raw.char_name || raw.name) {
    // V1 / Pygmalion format — convert to V2
    data = convertV1toV2(raw);
  } else if (raw.type === "character" && raw.data) {
    // RisuAI format
    data = convertRisuToV2((raw.data as Record<string, unknown>) ?? {});
  } else {
    // Try treating the whole object as character data
    data = normalizeV2(raw);
  }

  const character = await storage.create(data);

  return {
    success: true,
    characterId: character?.id,
    name: data.name,
  };
}

function normalizeV2(raw: Record<string, unknown>): CharacterData {
  return {
    name: String(raw.name ?? "Unknown"),
    description: String(raw.description ?? ""),
    personality: String(raw.personality ?? ""),
    scenario: String(raw.scenario ?? ""),
    first_mes: String(raw.first_mes ?? ""),
    mes_example: String(raw.mes_example ?? ""),
    creator_notes: String(raw.creator_notes ?? ""),
    system_prompt: String(raw.system_prompt ?? ""),
    post_history_instructions: String(raw.post_history_instructions ?? ""),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    creator: String(raw.creator ?? ""),
    character_version: String(raw.character_version ?? ""),
    alternate_greetings: Array.isArray(raw.alternate_greetings)
      ? raw.alternate_greetings.map(String)
      : [],
    extensions: {
      talkativeness: Number(
        (raw.extensions as Record<string, unknown>)?.talkativeness ?? 0.5,
      ),
      fav: Boolean((raw.extensions as Record<string, unknown>)?.fav),
      world: String((raw.extensions as Record<string, unknown>)?.world ?? ""),
      depth_prompt: {
        prompt: String(
          ((raw.extensions as Record<string, unknown>)?.depth_prompt as Record<string, unknown>)
            ?.prompt ?? "",
        ),
        depth: Number(
          ((raw.extensions as Record<string, unknown>)?.depth_prompt as Record<string, unknown>)
            ?.depth ?? 4,
        ),
        role: (((raw.extensions as Record<string, unknown>)?.depth_prompt as Record<string, unknown>)
          ?.role as "system" | "user" | "assistant") ?? "system",
      },
    },
    character_book: raw.character_book as CharacterData["character_book"] ?? null,
  };
}

function convertV1toV2(raw: Record<string, unknown>): CharacterData {
  return normalizeV2({
    name: raw.char_name ?? raw.name ?? "Unknown",
    description: raw.char_persona ?? raw.description ?? "",
    personality: raw.personality ?? "",
    scenario: raw.world_scenario ?? raw.scenario ?? "",
    first_mes: raw.char_greeting ?? raw.first_mes ?? "",
    mes_example: raw.example_dialogue ?? raw.mes_example ?? "",
    creator_notes: "",
    system_prompt: "",
    post_history_instructions: "",
    tags: [],
    creator: "",
    character_version: "",
    alternate_greetings: [],
    extensions: {},
    character_book: null,
  });
}

function convertRisuToV2(raw: Record<string, unknown>): CharacterData {
  return normalizeV2({
    name: raw.name ?? "Unknown",
    description: raw.description ?? "",
    personality: raw.personality ?? "",
    scenario: raw.scenario ?? "",
    first_mes: raw.firstMessage ?? raw.first_mes ?? "",
    mes_example: raw.exampleMessage ?? raw.mes_example ?? "",
    system_prompt: raw.systemPrompt ?? "",
    creator_notes: raw.creatorNotes ?? "",
    post_history_instructions: "",
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    creator: String(raw.creator ?? ""),
    character_version: "",
    alternate_greetings: Array.isArray(raw.alternateGreetings)
      ? raw.alternateGreetings.map(String)
      : [],
    extensions: {},
    character_book: null,
  });
}
