// ──────────────────────────────────────────────
// Lorebook / World Info Types
// ──────────────────────────────────────────────

/** Lorebook entry categories (extends ST's flat model). */
export type LorebookCategory =
  | "location"
  | "character"
  | "item"
  | "lore"
  | "quest"
  | "event"
  | "system"
  | "uncategorized";

/** Selective logic operators. */
export type SelectiveLogic = "and" | "or" | "not";

/** Role for injected lorebook content. */
export type LorebookRole = "system" | "user" | "assistant";

/** A complete lorebook (collection of entries). */
export interface Lorebook {
  id: string;
  name: string;
  description: string;
  /** Default scan depth for entries that don't override */
  scanDepth: number;
  /** Max tokens allocated to this lorebook */
  tokenBudget: number;
  recursiveScanning: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A single lorebook entry. */
export interface LorebookEntry {
  id: string;
  lorebookId: string;
  /** Display name */
  name: string;
  /** The actual content injected into the prompt */
  content: string;
  /** Primary trigger keywords (supports regex) */
  keys: string[];
  /** Secondary / optional keywords */
  secondaryKeys: string[];

  // ── Activation settings ──
  enabled: boolean;
  constant: boolean;
  selective: boolean;
  selectiveLogic: SelectiveLogic;
  probability: number | null;
  /** How far back in chat to scan for matches */
  scanDepth: number | null;
  matchWholeWords: boolean;
  caseSensitive: boolean;

  // ── Injection settings ──
  /** 0 = before character, 1 = after character */
  position: number;
  /** Insertion depth in the message array */
  depth: number;
  /** Insertion priority (lower = earlier) */
  order: number;
  role: LorebookRole;

  // ── Timing ──
  /** Keep active for N messages after trigger */
  sticky: number | null;
  /** Wait N messages between activations */
  cooldown: number | null;
  /** Delay N messages before first activation */
  delay: number | null;

  // ── Grouping ──
  group: string;
  groupWeight: number | null;

  // ── Engine extensions (beyond ST) ──
  category: LorebookCategory;
  /** Relationships to other entries: { entryId: relationshipType } */
  relationships: Record<string, string>;
  /** Dynamic state for quests etc. (arbitrary JSON) */
  dynamicState: Record<string, unknown>;
  /** Game-state conditional activation rules */
  activationConditions: ActivationCondition[];

  createdAt: string;
  updatedAt: string;
}

/** A rule for conditional lorebook activation based on game state. */
export interface ActivationCondition {
  /** The game state field to check (e.g. "location", "time_of_day") */
  field: string;
  /** Comparison operator */
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "gt" | "lt";
  /** Value to compare against */
  value: string;
}

/** Quest-specific fields for quest-type lorebook entries. */
export interface QuestData {
  stages: QuestStage[];
  currentStageIndex: number;
  completed: boolean;
  rewards: string[];
}

/** A single stage/objective in a quest. */
export interface QuestStage {
  name: string;
  description: string;
  objectives: QuestObjective[];
  completionTrigger: string;
}

/** An objective within a quest stage. */
export interface QuestObjective {
  text: string;
  completed: boolean;
}
