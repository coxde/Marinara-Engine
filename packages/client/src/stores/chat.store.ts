// ──────────────────────────────────────────────
// Zustand Store: Chat Slice
// ──────────────────────────────────────────────
import { create } from "zustand";
import type { Chat, Message, ChatMode } from "@rpg-engine/shared";

interface ChatState {
  activeChatId: string | null;
  activeChat: Chat | null;
  messages: Message[];
  isStreaming: boolean;
  streamBuffer: string;
  swipeIndex: Map<string, number>; // messageId → active swipe index

  // Actions
  setActiveChat: (chat: Chat | null) => void;
  setActiveChatId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  appendStreamBuffer: (text: string) => void;
  clearStreamBuffer: () => void;
  setSwipeIndex: (messageId: string, index: number) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChatId: null,
  activeChat: null,
  messages: [],
  isStreaming: false,
  streamBuffer: "",
  swipeIndex: new Map(),

  setActiveChat: (chat) => set({ activeChat: chat }),
  setActiveChatId: (id) => set({ activeChatId: id }),
  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      if (last) {
        messages[messages.length - 1] = { ...last, content };
      }
      return { messages };
    }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  appendStreamBuffer: (text) =>
    set((state) => ({ streamBuffer: state.streamBuffer + text })),
  clearStreamBuffer: () => set({ streamBuffer: "" }),

  setSwipeIndex: (messageId, index) =>
    set((state) => {
      const m = new Map(state.swipeIndex);
      m.set(messageId, index);
      return { swipeIndex: m };
    }),

  reset: () =>
    set({
      activeChatId: null,
      activeChat: null,
      messages: [],
      isStreaming: false,
      streamBuffer: "",
      swipeIndex: new Map(),
    }),
}));
