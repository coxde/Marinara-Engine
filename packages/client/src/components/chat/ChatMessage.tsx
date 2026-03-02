// ──────────────────────────────────────────────
// Chat: Message bubble (polished with animations)
// ──────────────────────────────────────────────
import { cn } from "../../lib/utils";
import { User, Bot, ChevronLeft, ChevronRight, Copy, RefreshCw, Trash2 } from "lucide-react";
import type { Message } from "@rpg-engine/shared";
import { useState } from "react";

interface ChatMessageProps {
  message: Message & { swipes?: Array<{ id: string; content: string }> };
  isStreaming?: boolean;
  index: number;
  onDelete?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
}

export function ChatMessage({ message, isStreaming, index, onDelete, onRegenerate }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isSystem) {
    return (
      <div className="animate-fade-in-up flex justify-center py-3">
        <div className="rounded-full bg-[var(--secondary)]/80 px-4 py-1.5 text-[11px] text-[var(--muted-foreground)] backdrop-blur-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("group mb-5 flex gap-3 animate-message-in", isUser && "flex-row-reverse")}
      style={{ animationDelay: `${Math.min(index * 30, 200)}ms`, animationFillMode: "backwards" }}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105",
          isUser
            ? "bg-gradient-to-br from-pink-400 to-purple-500"
            : "bg-gradient-to-br from-[var(--secondary)] to-[var(--accent)] ring-1 ring-[var(--y2k-purple)]/20",
        )}
      >
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <Bot size={16} className="text-[var(--y2k-pink)]" />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex max-w-[75%] flex-col gap-1.5", isUser && "items-end")}>
        {/* Name & timestamp */}
        <div className="flex items-center gap-2 px-1">
          <span className={cn(
            "text-xs font-semibold",
            isUser ? "text-[var(--y2k-pink)]" : "text-[var(--y2k-lavender)]"
          )}>
            {isUser ? "You" : message.characterId ?? "Assistant"}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)]/50">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-md bg-gradient-to-br from-pink-500/90 to-purple-600/90 text-white shadow-md shadow-pink-500/10"
              : "rounded-tl-md bg-[var(--card)] text-[var(--card-foreground)] shadow-sm ring-1 ring-[var(--y2k-purple)]/20",
            isStreaming && "ring-2 ring-[var(--y2k-pink)]/30",
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-[3px] animate-pulse rounded-full bg-[var(--y2k-pink)]" />
            )}
          </div>
        </div>

        {/* Swipe navigation (if multiple swipes) */}
        {message.swipes && message.swipes.length > 1 && (
          <div className="flex items-center gap-1.5 px-1 text-xs text-[var(--muted-foreground)]">
            <button className="rounded-md p-0.5 transition-colors hover:bg-[var(--accent)]">
              <ChevronLeft size={12} />
            </button>
            <span className="tabular-nums">1/{message.swipes.length}</span>
            <button className="rounded-md p-0.5 transition-colors hover:bg-[var(--accent)]">
              <ChevronRight size={12} />
            </button>
          </div>
        )}

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-0.5 px-1 opacity-0 transition-all group-hover:opacity-100">
          <ActionBtn icon={copied ? "✓" : <Copy size={11} />} onClick={handleCopy} title="Copy" />
          <ActionBtn icon={<RefreshCw size={11} />} onClick={() => onRegenerate?.(message.id)} title="Regenerate" />
          <ActionBtn icon={<Trash2 size={11} />} onClick={() => onDelete?.(message.id)} title="Delete" className="hover:text-[var(--destructive)]" />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  onClick,
  title,
  className,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-md p-1 text-[var(--muted-foreground)] transition-all hover:bg-[var(--accent)] hover:text-[var(--foreground)] active:scale-90",
        className,
      )}
    >
      {icon}
    </button>
  );
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
