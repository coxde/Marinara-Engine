// ──────────────────────────────────────────────
// Chat: Main chat area with messages + input
// ──────────────────────────────────────────────
import { useEffect, useRef, useCallback } from "react";
import { useChatMessages, useChat, useDeleteMessage } from "../../hooks/use-chats";
import { useChatStore } from "../../stores/chat.store";
import { useGenerate } from "../../hooks/use-generate";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MessageSquare, Sparkles, BookOpen, Theater } from "lucide-react";
import { useUIStore } from "../../stores/ui.store";

export function ChatArea() {
  const activeChatId = useChatStore((s) => s.activeChatId);
  const setActiveChat = useChatStore((s) => s.setActiveChat);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamBuffer = useChatStore((s) => s.streamBuffer);
  const chatBackground = useUIStore((s) => s.chatBackground);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chat } = useChat(activeChatId);
  const { data: messages, isLoading } = useChatMessages(activeChatId);
  const deleteMessage = useDeleteMessage(activeChatId);
  const { generate } = useGenerate();

  const handleDelete = useCallback(
    (messageId: string) => {
      deleteMessage.mutate(messageId);
    },
    [deleteMessage],
  );

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      if (!activeChatId || isStreaming) return;
      // Delete the message and all messages after it, then regenerate
      const msgIndex = messages?.findIndex((m) => m.id === messageId) ?? -1;
      if (msgIndex < 0 || !messages) return;

      // Delete from the target message onward
      const toDelete = messages.slice(msgIndex);
      for (const msg of toDelete) {
        await deleteMessage.mutateAsync(msg.id);
      }

      // Regenerate without a new user message
      await generate({ chatId: activeChatId, connectionId: null });
    },
    [activeChatId, isStreaming, messages, deleteMessage, generate],
  );

  useEffect(() => {
    if (chat) setActiveChat(chat);
  }, [chat, setActiveChat]);

  // Auto-scroll on new messages / streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamBuffer]);

  // Empty state
  if (!activeChatId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        {/* Central hero */}
        <div className="relative">
          <div className="animate-pulse-ring bunny-glow flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 shadow-xl shadow-pink-500/20">
            <Sparkles size={32} className="text-white" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="retro-glow-text text-xl font-bold tracking-tight">
            ✧ RPG Engine ✧
          </h3>
          <p className="mt-2 max-w-xs text-sm text-[var(--muted-foreground)]">
            Select a chat or create a new one to get started
          </p>
        </div>

        {/* Quick start cards */}
        <div className="stagger-children flex gap-3">
          <QuickStartCard icon={<MessageSquare size={18} />} label="Conversation" gradient="from-sky-400 to-blue-500" />
          <QuickStartCard icon={<BookOpen size={18} />} label="Roleplay" gradient="from-pink-400 to-rose-500" />
          <QuickStartCard icon={<Theater size={18} />} label="Visual Novel" gradient="from-purple-400 to-violet-500" />
        </div>

        {/* Retro divider decoration */}
        <div className="retro-divider w-48" />
      </div>
    );
  }

  return (
    <div
      className="chat-bg relative flex flex-1 flex-col overflow-hidden"
      style={chatBackground ? { backgroundImage: `url(${chatBackground})` } : undefined}
    >
      {/* Overlay for readability if background is set */}
      {chatBackground && (
        <div className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-[1px]" />
      )}

      {/* Messages area */}
      <div className="relative flex-1 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="shimmer h-12 w-12 rounded-xl" />
            <div className="shimmer h-3 w-32 rounded-full" />
          </div>
        )}

        {messages?.map((msg, i) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            index={i}
            onDelete={handleDelete}
            onRegenerate={handleRegenerate}
          />
        ))}

        {/* Streaming indicator */}
        {isStreaming && streamBuffer && (
          <div className="animate-message-in">
            <ChatMessage
              message={{
                id: "__streaming__",
                chatId: activeChatId,
                role: "assistant",
                characterId: null,
                content: streamBuffer,
                activeSwipeIndex: 0,
                extra: { displayText: null, isGenerated: true, tokenCount: 0, generationInfo: null },
                createdAt: new Date().toISOString(),
              }}
              isStreaming
              index={-1}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="relative">
        <ChatInput />
      </div>
    </div>
  );
}

function QuickStartCard({ icon, label, gradient }: { icon: React.ReactNode; label: string; gradient: string }) {
  return (
    <div className="group card-3d-tilt flex cursor-default flex-col items-center gap-2 rounded-xl border-2 border-[var(--y2k-purple)]/20 bg-[var(--card)] p-4 transition-all hover:-translate-y-1 hover:border-[var(--y2k-pink)]/40 hover:shadow-lg hover:shadow-pink-500/10">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <span className="text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
    </div>
  );
}
