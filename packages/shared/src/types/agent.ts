// ──────────────────────────────────────────────
// Agent System Types
// ──────────────────────────────────────────────

/** When in the generation pipeline an agent runs. */
export type AgentPhase =
  /** Before the main generation (can modify prompt context) */
  | "pre_generation"
  /** In parallel with or after the main generation */
  | "parallel"
  /** After the main response is complete (can modify it) */
  | "post_processing";

/** The result type an agent can produce. */
export type AgentResultType =
  | "game_state_update"
  | "text_rewrite"
  | "sprite_change"
  | "echo_message"
  | "quest_update"
  | "image_prompt"
  | "context_injection"
  | "continuity_check"
  | "director_event";

/** Configuration for a single agent. */
export interface AgentConfig {
  id: string;
  /** Agent type identifier (e.g. "world-state", "prose-guardian") */
  type: string;
  /** Display name */
  name: string;
  description: string;
  /** When this agent runs in the pipeline */
  phase: AgentPhase;
  /** Whether globally enabled */
  enabled: boolean;
  /** Override: use a different connection/model for this agent */
  connectionId: string | null;
  /** Agent-specific prompt template */
  promptTemplate: string;
  /** Agent-specific settings */
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** Result produced by an agent after execution. */
export interface AgentResult {
  agentId: string;
  agentType: string;
  type: AgentResultType;
  /** The result payload (varies by type) */
  data: unknown;
  /** Token usage */
  tokensUsed: number;
  /** How long the agent took */
  durationMs: number;
  /** Whether the agent succeeded */
  success: boolean;
  error: string | null;
}

/** Shared context passed to every agent. */
export interface AgentContext {
  chatId: string;
  chatMode: string;
  /** Recent chat history (last N messages) */
  recentMessages: Array<{ role: string; content: string; characterId?: string }>;
  /** The main response text (available for post-processing agents) */
  mainResponse: string | null;
  /** Current game state (if any) */
  gameState: import("./game-state.js").GameState | null;
  /** Active characters in the chat */
  characters: Array<{ id: string; name: string; description: string }>;
  /** User persona info */
  persona: { name: string; description: string } | null;
  /** The agent's own persistent memory (key-value) */
  memory: Record<string, unknown>;
}

/** Built-in agent type identifiers. */
export const BUILT_IN_AGENT_IDS = {
  WORLD_STATE: "world-state",
  PROSE_GUARDIAN: "prose-guardian",
  CONTINUITY: "continuity",
  EXPRESSION: "expression",
  ECHO_CHAMBER: "echo-chamber",
  DIRECTOR: "director",
  QUEST: "quest",
  ILLUSTRATOR: "illustrator",
} as const;

export interface BuiltInAgentMeta {
  id: string;
  name: string;
  description: string;
  phase: AgentPhase;
  enabledByDefault: boolean;
}

export const BUILT_IN_AGENTS: BuiltInAgentMeta[] = [
  { id: "world-state", name: "World State", description: "Tracks date/time, weather, location, and present characters automatically.", phase: "post_processing", enabledByDefault: true },
  { id: "prose-guardian", name: "Prose Guardian", description: "Silently reviews output quality and nudges the model toward better prose.", phase: "pre_generation", enabledByDefault: true },
  { id: "continuity", name: "Continuity Checker", description: "Detects contradictions with established lore and facts.", phase: "post_processing", enabledByDefault: true },
  { id: "expression", name: "Expression Engine", description: "Detects character emotions and selects VN sprites/expressions.", phase: "post_processing", enabledByDefault: false },
  { id: "echo-chamber", name: "EchoChamber", description: "Generates brief in-character reactions from inactive group members.", phase: "parallel", enabledByDefault: false },
  { id: "director", name: "Narrative Director", description: "Introduces events, NPCs, and plot beats to keep the story moving.", phase: "pre_generation", enabledByDefault: false },
  { id: "quest", name: "Quest Tracker", description: "Manages quest objectives, completion states, and rewards.", phase: "post_processing", enabledByDefault: false },
  { id: "illustrator", name: "Illustrator", description: "Generates image prompts for key scenes (requires image generation API).", phase: "parallel", enabledByDefault: false },
];
