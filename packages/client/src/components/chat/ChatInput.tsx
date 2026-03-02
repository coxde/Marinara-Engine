// ──────────────────────────────────────────────
// Chat: Input (polished with glow + gradient)
// ──────────────────────────────────────────────
import { useState, useRef, useCallback } from "react";
import { Send, Loader2, Paperclip, StopCircle } from "lucide-react";
import { useChatStore } from "../../stores/chat.store";
import { useGenerate } from "../../hooks/use-generate";
import { cn } from "../../lib/utils";

export function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const { generate } = useGenerate();

  const handleSend = useCallback(async () => {
    if (!input.trim() || !activeChatId || isStreaming) return;

    const message = input.trim();
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await generate({
        chatId: activeChatId,
        connectionId: null,
        userMessage: message,
      });
    } catch (error) {
      console.error("Send failed:", error);
    }
  }, [input, activeChatId, isStreaming, generate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const hasInput = input.trim().length > 0;

  return (
    <div className="glass-strong border-t border-[var(--border)] p-3">
      {/* Main input container */}
      <div className={cn(
        "relative flex items-end gap-2 rounded-2xl border-2 bg-[var(--secondary)] px-4 py-3 transition-all duration-200",
        hasInput ? "border-[var(--y2k-pink)]/40 shadow-md shadow-pink-500/5" : "border-[var(--y2k-purple)]/20",
      )}>
        {/* Attachment button */}
        <button
          className="mb-0.5 rounded-lg p-1.5 text-[var(--muted-foreground)] transition-all hover:bg-[var(--accent)] hover:text-[var(--y2k-pink)] active:scale-90"
          title="Attach file"
        >
          <Paperclip size={16} />
        </button>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={activeChatId ? "Type a message..." : "Select a chat first"}
          disabled={!activeChatId}
          rows={1}
          className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none disabled:cursor-not-allowed disabled:opacity-40"
        />

        {/* Send / Stop button */}
        <button
          onClick={isStreaming ? undefined : handleSend}
          disabled={(!hasInput && !isStreaming) || !activeChatId}
          className={cn(
            "mb-0.5 flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
            isStreaming
              ? "bg-[var(--destructive)] text-white hover:opacity-80"
              : hasInput && activeChatId
                ? "bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-md shadow-pink-500/20 hover:shadow-lg active:scale-90"
                : "text-[var(--muted-foreground)]",
          )}
        >
          {isStreaming ? (
            <StopCircle size={16} />
          ) : (
            <Send size={15} className={cn(hasInput && "translate-x-[1px]")} />
          )}
        </button>
      </div>

      {/* Bottom hint */}
      <div className="mt-1.5 flex items-center justify-between px-3 text-[10px] text-[var(--muted-foreground)]/60">
        <span>Shift+Enter for new line</span>
        {isStreaming && (
          <span className="flex items-center gap-1 text-[var(--y2k-pink)]">
            <Loader2 size={9} className="animate-spin" />
            Generating...
          </span>
        )}
      </div>
    </div>
  );
}
