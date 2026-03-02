// ──────────────────────────────────────────────
// Panel: Characters (polished)
// ──────────────────────────────────────────────
import { useCharacters, useDeleteCharacter } from "../../hooks/use-characters";
import { useUpdateChat } from "../../hooks/use-chats";
import { useChatStore } from "../../stores/chat.store";
import { Plus, Trash2, Upload, User, Check } from "lucide-react";
import { useUIStore } from "../../stores/ui.store";
import { cn } from "../../lib/utils";

export function CharactersPanel() {
  const { data: characters, isLoading } = useCharacters();
  const deleteCharacter = useDeleteCharacter();
  const openModal = useUIStore((s) => s.openModal);
  const activeChat = useChatStore((s) => s.activeChat);
  const updateChat = useUpdateChat();

  const chatCharacterIds: string[] = activeChat
    ? (typeof activeChat.characterIds === "string"
        ? JSON.parse(activeChat.characterIds)
        : activeChat.characterIds) ?? []
    : [];

  const toggleCharacter = (charId: string) => {
    if (!activeChat) return;
    const isActive = chatCharacterIds.includes(charId);
    const newIds = isActive
      ? chatCharacterIds.filter((id: string) => id !== charId)
      : [...chatCharacterIds, charId];
    if (newIds.length === 0) return; // Must have at least one
    updateChat.mutate({ id: activeChat.id, characterIds: newIds });
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => openModal("create-character")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 px-3 py-2.5 text-xs font-medium text-white shadow-md shadow-pink-500/15 transition-all hover:shadow-lg hover:shadow-pink-500/25 active:scale-[0.98]"
        >
          <Plus size={13} /> New
        </button>
        <button
          onClick={() => openModal("import-character")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--secondary)] px-3 py-2.5 text-xs font-medium text-[var(--secondary-foreground)] ring-1 ring-[var(--border)] transition-all hover:bg-[var(--accent)] active:scale-[0.98]"
        >
          <Upload size={13} /> Import
        </button>
      </div>

      {/* Character list */}
      {isLoading && (
        <div className="flex flex-col gap-2 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-14 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (!characters || (characters as unknown[]).length === 0) && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="animate-float flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400/20 to-rose-500/20">
            <User size={20} className="text-[var(--primary)]" />
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">No characters yet</p>
        </div>
      )}

      <div className="stagger-children flex flex-col gap-1">
        {(characters as Array<{ id: string; data: string }>)?.map((char) => {
          const parsed = (() => { try { return typeof char.data === "string" ? JSON.parse(char.data) : char.data; } catch { return {}; } })();
          const charName = parsed.name ?? "Unnamed";
          const charDesc = parsed.description ?? "";
          const isSelected = chatCharacterIds.includes(char.id);
          return (
          <div
            key={char.id}
            onClick={() => toggleCharacter(char.id)}
            className={cn(
              "group flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-[var(--sidebar-accent)]",
              isSelected && "ring-1 ring-[var(--primary)]/40 bg-[var(--primary)]/5",
            )}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-sm">
              <User size={16} />
              {isSelected && (
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] shadow-sm">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{charName}</div>
              <div className="truncate text-[11px] text-[var(--muted-foreground)]">
                {charDesc.slice(0, 60) || "No description"}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteCharacter.mutate(char.id); }}
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
          Click to assign/remove from active chat
        </p>
      )}
    </div>
  );
}
