// ──────────────────────────────────────────────
// Panel: Agents
// ──────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api-client";
import { Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { useAgentStore } from "../../stores/agent.store";
import { BUILT_IN_AGENTS } from "@rpg-engine/shared";

export function AgentsPanel() {
  const { data: agentConfigs, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get<Array<{ id: string; agentId: string; type: string; enabled: string }>>("/agents"),
  });
  const qc = useQueryClient();

  const toggleAgent = useMutation({
    mutationFn: (agentType: string) => api.put(`/agents/toggle/${agentType}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
  });

  const thoughtBubbles = useAgentStore((s) => s.thoughtBubbles);
  const dismissThoughtBubble = useAgentStore((s) => s.dismissThoughtBubble);

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="text-xs text-[var(--muted-foreground)]">
        Built-in agents enhance roleplay, track game state, and provide guidance.
      </div>

      {/* Thought bubbles */}
      {thoughtBubbles.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-medium text-[var(--primary)]">Agent Thoughts</div>
          {thoughtBubbles.map((bubble, i) => (
            <div
              key={i}
              className="relative rounded-md bg-[var(--primary)]/10 p-2 text-xs"
            >
              <button
                onClick={() => dismissThoughtBubble(i)}
                className="absolute right-1 top-1 text-[var(--muted-foreground)]"
              >
                ×
              </button>
              <span className="font-medium text-[var(--primary)]">{bubble.agentName}: </span>
              {bubble.content}
            </div>
          ))}
        </div>
      )}

      {/* Agent list */}
      {isLoading && (
        <div className="py-4 text-center text-xs text-[var(--muted-foreground)]">Loading...</div>
      )}

      {BUILT_IN_AGENTS.map((agent) => {
        const config = (agentConfigs as Array<{ type: string; enabled: string }> | undefined)?.find(
          (c) => c.type === agent.id,
        );
        const enabled = config ? config.enabled === "true" : agent.enabledByDefault;

        return (
          <div
            key={agent.id}
            className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-[var(--sidebar-accent)]"
          >
            <Sparkles size={16} className="mt-0.5 text-[var(--primary)]" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{agent.name}</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {agent.description}
              </div>
            </div>
            <button
              className="mt-0.5 text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
              onClick={() => toggleAgent.mutate(agent.id)}
              disabled={toggleAgent.isPending}
            >
              {enabled ? (
                <ToggleRight size={20} className="text-[var(--primary)]" />
              ) : (
                <ToggleLeft size={20} />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
