// ──────────────────────────────────────────────
// Importer: SillyTavern World Info / Lorebook
// ──────────────────────────────────────────────
import type { DB } from "../../db/connection.js";
import { createLorebooksStorage } from "../storage/lorebooks.storage.js";
import type { CreateLorebookEntryInput } from "@rpg-engine/shared";

interface STWorldInfoEntry {
  uid?: number;
  key?: string[];
  keysecondary?: string[];
  comment?: string;
  content?: string;
  constant?: boolean;
  selective?: boolean;
  selectiveLogic?: number;
  order?: number;
  position?: number;
  disable?: boolean;
  depth?: number;
  probability?: number | null;
  scanDepth?: number | null;
  matchWholeWords?: boolean | null;
  caseSensitive?: boolean | null;
  role?: number;
  group?: string;
  groupWeight?: number | null;
  sticky?: number | null;
  cooldown?: number | null;
  delay?: number | null;
  vectorized?: boolean;
}

interface STWorldInfo {
  entries?: Record<string, STWorldInfoEntry>;
  name?: string;
  extensions?: Record<string, unknown>;
}

/**
 * Import a SillyTavern World Info JSON file.
 */
export async function importSTLorebook(raw: Record<string, unknown>, db: DB) {
  const storage = createLorebooksStorage(db);
  const wi = raw as unknown as STWorldInfo;

  // Create the lorebook
  const lorebook = await storage.create({
    name: wi.name ?? "Imported Lorebook",
    description: "Imported from SillyTavern",
    scanDepth: 2,
    tokenBudget: 2048,
    recursiveScanning: false,
  });

  if (!lorebook) return { error: "Failed to create lorebook" };

  const entries = wi.entries ?? {};
  let imported = 0;

  for (const [, entry] of Object.entries(entries)) {
    // Map ST selective logic: 0=AND, 1=OR, 2=NOT
    const logicMap: Record<number, "and" | "or" | "not"> = { 0: "and", 1: "or", 2: "not" };

    // Map ST role: 0=system, 1=user, 2=assistant
    const roleMap: Record<number, "system" | "user" | "assistant"> = {
      0: "system",
      1: "user",
      2: "assistant",
    };

    const input: CreateLorebookEntryInput = {
      lorebookId: lorebook.id,
      name: entry.comment ?? `Entry ${imported + 1}`,
      content: entry.content ?? "",
      keys: entry.key ?? [],
      secondaryKeys: entry.keysecondary ?? [],
      enabled: !(entry.disable ?? false),
      constant: entry.constant ?? false,
      selective: entry.selective ?? false,
      selectiveLogic: logicMap[entry.selectiveLogic ?? 0] ?? "and",
      probability: entry.probability ?? null,
      scanDepth: entry.scanDepth ?? null,
      matchWholeWords: entry.matchWholeWords ?? false,
      caseSensitive: entry.caseSensitive ?? false,
      position: entry.position ?? 0,
      depth: entry.depth ?? 4,
      order: entry.order ?? 100,
      role: roleMap[entry.role ?? 0] ?? "system",
      sticky: entry.sticky ?? null,
      cooldown: entry.cooldown ?? null,
      delay: entry.delay ?? null,
      group: entry.group ?? "",
      groupWeight: entry.groupWeight ?? null,
      category: "uncategorized",
      relationships: {},
      dynamicState: {},
      activationConditions: [],
    };

    await storage.createEntry(input);
    imported++;
  }

  return {
    success: true,
    lorebookId: lorebook.id,
    name: lorebook.name,
    entriesImported: imported,
  };
}
