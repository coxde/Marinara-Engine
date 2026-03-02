// ──────────────────────────────────────────────
// Prompt System Types
// ──────────────────────────────────────────────

/** Role for a prompt section. */
export type PromptRole = "system" | "user" | "assistant";

/** Where in the prompt a section is injected. */
export type InjectionPosition =
  /** Placed in order relative to other sections */
  | "ordered"
  /** Injected at a depth relative to the end of chat history */
  | "depth";

/** A complete prompt preset (template). */
export interface PromptPreset {
  id: string;
  name: string;
  description: string;
  /** Ordered list of section IDs defining the prompt structure */
  sectionOrder: string[];
  /** Variable toggle groups */
  variableGroups: PromptVariableGroup[];
  /** Current values for all variables */
  variableValues: Record<string, string>;
  /** Generation parameters */
  parameters: GenerationParameters;
  createdAt: string;
  updatedAt: string;
}

/** A single section/block within a prompt preset. */
export interface PromptSection {
  id: string;
  presetId: string;
  /** Unique identifier (e.g. "main", "charDescription", or UUID for custom) */
  identifier: string;
  /** Display name */
  name: string;
  /** The prompt text content (supports macros like {{user}}, {{char}}) */
  content: string;
  /** Message role */
  role: PromptRole;
  /** Whether this section is enabled */
  enabled: boolean;
  /** Whether this is a built-in marker (charDescription, chatHistory, etc.) */
  isMarker: boolean;

  // ── Injection ──
  injectionPosition: InjectionPosition;
  /** Depth from the bottom of chat (0 = after last message) */
  injectionDepth: number;
  /** Priority when multiple sections share the same depth */
  injectionOrder: number;

  // ── XML Wrapping ──
  /** Whether to automatically wrap content in XML tags */
  wrapInXml: boolean;
  /** Custom XML tag name (defaults to section name slug) */
  xmlTagName: string;

  // ── Overrides ──
  /** If true, character cards cannot override this section */
  forbidOverrides: boolean;
}

/** A group of mutually exclusive variable options (radio toggle). */
export interface PromptVariableGroup {
  /** Variable name (used in {{getvar::name}}) */
  name: string;
  /** Display label */
  label: string;
  /** Available options */
  options: PromptVariableOption[];
}

/** A single option within a variable group. */
export interface PromptVariableOption {
  label: string;
  value: string;
}

/** Generation parameters sent with each API call. */
export interface GenerationParameters {
  temperature: number;
  topP: number;
  topK: number;
  minP: number;
  maxTokens: number;
  maxContext: number;
  frequencyPenalty: number;
  presencePenalty: number;
  /** For reasoning models */
  reasoningEffort: "low" | "medium" | "high" | null;
  /** Merge consecutive system messages */
  squashSystemMessages: boolean;
  /** Show model reasoning/thinking */
  showThoughts: boolean;
  /** Custom stop sequences */
  stopSequences: string[];
}

/** Well-known built-in marker identifiers (match ST). */
export const BUILTIN_MARKERS = {
  MAIN: "main",
  NSFW: "nsfw",
  JAILBREAK: "jailbreak",
  ENHANCE_DEFINITIONS: "enhanceDefinitions",
  CHAR_DESCRIPTION: "charDescription",
  CHAR_PERSONALITY: "charPersonality",
  SCENARIO: "scenario",
  PERSONA_DESCRIPTION: "personaDescription",
  DIALOGUE_EXAMPLES: "dialogueExamples",
  CHAT_HISTORY: "chatHistory",
  WORLD_INFO_BEFORE: "worldInfoBefore",
  WORLD_INFO_AFTER: "worldInfoAfter",
} as const;

/** A ChatML-format message (internal lingua franca). */
export interface ChatMLMessage {
  role: PromptRole;
  content: string;
  /** Optional: name of the speaker for multi-character */
  name?: string;
}
