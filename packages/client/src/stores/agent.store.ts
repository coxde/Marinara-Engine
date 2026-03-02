// ──────────────────────────────────────────────
// Zustand Store: Agent Slice
// ──────────────────────────────────────────────
import { create } from "zustand";
import type { AgentResult } from "@rpg-engine/shared";

interface AgentState {
  activeAgents: string[];
  lastResults: Map<string, AgentResult>;
  isProcessing: boolean;
  thoughtBubbles: Array<{
    agentId: string;
    agentName: string;
    content: string;
    timestamp: number;
  }>;

  // Actions
  setActiveAgents: (agents: string[]) => void;
  setProcessing: (processing: boolean) => void;
  addResult: (agentId: string, result: AgentResult) => void;
  addThoughtBubble: (agentId: string, agentName: string, content: string) => void;
  dismissThoughtBubble: (index: number) => void;
  clearThoughtBubbles: () => void;
  reset: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  activeAgents: [],
  lastResults: new Map(),
  isProcessing: false,
  thoughtBubbles: [],

  setActiveAgents: (agents) => set({ activeAgents: agents }),
  setProcessing: (processing) => set({ isProcessing: processing }),

  addResult: (agentId, result) =>
    set((s) => {
      const results = new Map(s.lastResults);
      results.set(agentId, result);
      return { lastResults: results };
    }),

  addThoughtBubble: (agentId, agentName, content) =>
    set((s) => ({
      thoughtBubbles: [
        ...s.thoughtBubbles,
        { agentId, agentName, content, timestamp: Date.now() },
      ],
    })),

  dismissThoughtBubble: (index) =>
    set((s) => ({
      thoughtBubbles: s.thoughtBubbles.filter((_, i) => i !== index),
    })),

  clearThoughtBubbles: () => set({ thoughtBubbles: [] }),

  reset: () =>
    set({
      activeAgents: [],
      lastResults: new Map(),
      isProcessing: false,
      thoughtBubbles: [],
    }),
}));
