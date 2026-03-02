// ──────────────────────────────────────────────
// Character Card V2 Types (compatible with ST / Chub)
// ──────────────────────────────────────────────

/** Full Character Card V2 envelope. */
export interface CharacterCardV2 {
  spec: "chara_card_v2";
  spec_version: "2.0";
  data: CharacterData;
}

/** Core character data (V2 spec). */
export interface CharacterData {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creator_notes: string;
  system_prompt: string;
  post_history_instructions: string;
  tags: string[];
  creator: string;
  character_version: string;
  alternate_greetings: string[];
  extensions: CharacterExtensions;
  character_book: CharacterBook | null;
}

/** ST-compatible extension fields. */
export interface CharacterExtensions {
  talkativeness: number;
  fav: boolean;
  world: string;
  depth_prompt: DepthPrompt;
  [key: string]: unknown;
}

/** Depth-injected prompt attached to a character. */
export interface DepthPrompt {
  prompt: string;
  depth: number;
  role: "system" | "user" | "assistant";
}

/** Embedded lorebook inside a character card. */
export interface CharacterBook {
  name: string;
  description: string;
  scan_depth: number;
  token_budget: number;
  recursive_scanning: boolean;
  extensions: Record<string, unknown>;
  entries: CharacterBookEntry[];
}

/** A single entry in a character book. */
export interface CharacterBookEntry {
  keys: string[];
  content: string;
  extensions: Record<string, unknown>;
  enabled: boolean;
  insertion_order: number;
  case_sensitive: boolean;
  name: string;
  priority: number;
  id: number;
  comment: string;
  selective: boolean;
  secondary_keys: string[];
  constant: boolean;
  position: "before_char" | "after_char";
}

/** Our internal Character representation (extends V2 with engine-specific fields). */
export interface Character {
  id: string;
  /** Original V2 data preserved for export compatibility */
  data: CharacterData;
  /** Path to avatar image file */
  avatarPath: string | null;
  /** Path to sprite folder */
  spriteFolderPath: string | null;
  createdAt: string;
  updatedAt: string;
}
