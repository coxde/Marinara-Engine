// ──────────────────────────────────────────────
// Layout: Chat Sidebar (polished with rich buttons)
// ──────────────────────────────────────────────
import { Plus, MessageSquare, Search, Trash2, BookOpen, Theater } from "lucide-react";
import { useChats, useCreateChat, useDeleteChat } from "../../hooks/use-chats";
import { useChatStore } from "../../stores/chat.store";
import { cn } from "../../lib/utils";
import { useState } from "react";
import type { ChatMode } from "@rpg-engine/shared";

const MODE_CONFIG: Record<string, { icon: React.ReactNode; label: string; gradient: string }> = {
  conversation: {
    icon: <MessageSquare size={14} />,
    label: "Chat",
    gradient: "from-sky-400 to-blue-500",
  },
  roleplay: {
    icon: <BookOpen size={14} />,
    label: "RP",
    gradient: "from-pink-400 to-rose-500",
  },
  visual_novel: {
    icon: <Theater size={14} />,
    label: "VN",
    gradient: "from-purple-400 to-violet-500",
  },
};

export function ChatSidebar() {
  const { data: chats, isLoading } = useChats();
  const createChat = useCreateChat();
  const deleteChat = useDeleteChat();
  const activeChatId = useChatStore((s) => s.activeChatId);
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = chats?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleNewChat = (mode: ChatMode) => {
    createChat.mutate(
      { name: `New ${MODE_CONFIG[mode]?.label ?? mode}`, mode, characterIds: [] },
      { onSuccess: (chat) => setActiveChatId(chat.id) },
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--sidebar-border)] px-4 py-3">
        <h2 className="retro-glow-text text-sm font-bold tracking-tight">
          ✧ Chats
        </h2>
        <div className="flex gap-0.5">
          {(["conversation", "roleplay", "visual_novel"] as const).map((mode) => {
            const cfg = MODE_CONFIG[mode];
            return (
              <button
                key={mode}
                onClick={() => handleNewChat(mode)}
                className="rounded-lg p-1.5 text-[var(--muted-foreground)] transition-all hover:bg-[var(--sidebar-accent)] hover:text-[var(--y2k-pink)] active:scale-90"
                title={`New ${cfg.label}`}
              >
                {cfg.icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg bg-[var(--secondary)] px-3 py-2 ring-1 ring-transparent transition-all focus-within:ring-[var(--primary)]/40">
          <Search size={13} className="text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {isLoading && (
          <div className="flex flex-col gap-2 px-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-10 rounded-lg" />
            ))}
          </div>
        )}

        {filtered?.length === 0 && !isLoading && (
          <div className="flex flex-col items-center gap-2 px-3 py-12 text-center">
            <div className="animate-float flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--secondary)]">
              <MessageSquare size={20} className="text-[var(--muted-foreground)]" />
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">No chats yet</p>
          </div>
        )}

        <div className="stagger-children flex flex-col gap-0.5">
          {filtered?.map((chat) => {
            const cfg = MODE_CONFIG[chat.mode] ?? MODE_CONFIG.conversation;
            const isActive = activeChatId === chat.id;

            return (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  "group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all duration-150",
                  isActive
                    ? "bg-[var(--sidebar-accent)] shadow-sm"
                    : "hover:bg-[var(--sidebar-accent)]/60",
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className={cn("absolute -left-0.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b", cfg.gradient)} />
                )}

                {/* Mode icon */}
                <div className={cn(
                  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs transition-transform group-active:scale-90",
                  isActive
                    ? `bg-gradient-to-br ${cfg.gradient} text-white shadow-sm`
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)]",
                )}>
                  {cfg.icon}
                </div>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <span className={cn(
                    "block truncate text-sm",
                    isActive ? "font-medium text-[var(--sidebar-accent-foreground)]" : "text-[var(--sidebar-foreground)]",
                  )}>
                    {chat.name}
                  </span>
                </div>

                {/* Mode badge on hover */}
                <span className="shrink-0 text-[10px] text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100">
                  {cfg.label}
                </span>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this chat?")) {
                      deleteChat.mutate(chat.id);
                      if (activeChatId === chat.id) setActiveChatId(null);
                    }
                  }}
                  className="shrink-0 rounded-md p-1 opacity-0 transition-all hover:bg-[var(--destructive)]/20 group-hover:opacity-100"
                >
                  <Trash2 size={12} className="text-[var(--destructive)]" />
                </button>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer - New Chat button */}
      <div className="border-t border-[var(--sidebar-border)] p-3">
        <button
          onClick={() => handleNewChat("roleplay")}
          className="bunny-glow flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 px-3 py-2.5 text-sm font-medium text-white shadow-lg shadow-pink-500/20 transition-all hover:shadow-pink-500/30 active:scale-[0.98]"
        >
          <Plus size={15} />
          New Chat
        </button>
      </div>
    </div>
  );
}
