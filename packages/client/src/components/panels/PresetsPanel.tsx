// ──────────────────────────────────────────────
// Panel: Presets (polished)
// ──────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api-client";
import { useUpdateChat } from "../../hooks/use-chats";
import { useChatStore } from "../../stores/chat.store";
import { Plus, Upload, FileText, Trash2, Check } from "lucide-react";
import { useUIStore } from "../../stores/ui.store";
import { cn } from "../../lib/utils";

export function PresetsPanel() {
  const { data: presets, isLoading } = useQuery({
    queryKey: ["presets"],
    queryFn: () => api.get<Array<{ id: string; name: string; description: string }>>("/prompts"),
  });
  const qc = useQueryClient();
  const deletePreset = useMutation({
    mutationFn: (id: string) => api.delete(`/prompts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presets"] }),
  });
  const openModal = useUIStore((s) => s.openModal);
  const activeChat = useChatStore((s) => s.activeChat);
  const updateChat = useUpdateChat();

  const activePresetId = activeChat?.promptPresetId ?? null;

  const selectPreset = (presetId: string) => {
    if (!activeChat) return;
    const newId = activePresetId === presetId ? null : presetId;
    updateChat.mutate({ id: activeChat.id, promptPresetId: newId });
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex gap-2">
        <button
          onClick={() => openModal("create-preset")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 px-3 py-2.5 text-xs font-medium text-white shadow-md shadow-purple-400/15 transition-all hover:shadow-lg hover:shadow-purple-400/25 active:scale-[0.98]"
        >
          <Plus size={13} /> New
        </button>
        <button
          onClick={() => openModal("import-preset")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--secondary)] px-3 py-2.5 text-xs font-medium text-[var(--secondary-foreground)] ring-1 ring-[var(--border)] transition-all hover:bg-[var(--accent)] active:scale-[0.98]"
        >
          <Upload size={13} /> Import
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2 py-2">
          {[1, 2].map((i) => (
            <div key={i} className="shimmer h-14 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (!presets || presets.length === 0) && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="animate-float flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400/20 to-violet-500/20">
            <FileText size={20} className="text-purple-400" />
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">No presets yet</p>
        </div>
      )}

      <div className="stagger-children flex flex-col gap-1">
        {presets?.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
          <div
            key={preset.id}
            onClick={() => selectPreset(preset.id)}
            className={cn(
              "group flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-[var(--sidebar-accent)]",
              isSelected && "ring-1 ring-purple-400/40 bg-purple-400/5",
            )}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 text-white shadow-sm">
              <FileText size={16} />
              {isSelected && (
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-400 shadow-sm">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{preset.name}</div>
              <div className="truncate text-[11px] text-[var(--muted-foreground)]">
                {preset.description || "No description"}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deletePreset.mutate(preset.id); }}
              className="rounded-lg p-1.5 opacity-0 transition-all hover:bg-[var(--destructive)]/15 group-hover:opacity-100 active:scale-90"
            >
              <Trash2 size={13} className="text-[var(--destructive)]" />
            </button>
          </div>
          );
        })}
      </div>
      {activeChat && (
        <p className="px-1 text-[10px] text-[var(--muted-foreground)]/60">
          Click to set as active preset for this chat
        </p>
      )}
    </div>
  );
}
