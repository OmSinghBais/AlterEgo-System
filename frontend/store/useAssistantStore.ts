import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

interface AssistantStore {
  // States
  conversations: Conversation[];
  activeConversationId: string | null;
  
  isThinking: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  isStreaming: boolean;
  
  selectedModel: string;
  currentPersonality: string;
  theme: "jarvis" | "minimal" | "cyberpunk" | "dark";
  
  // Actions
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateLastMessage: (content: string) => void;
  
  setThinking: (state: boolean) => void;
  setRecording: (state: boolean) => void;
  setSpeaking: (state: boolean) => void;
  setStreaming: (state: boolean) => void;
  
  createConversation: () => void;
  setActiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearMessages: () => void;
  
  updateSettings: (settings: Partial<Pick<AssistantStore, "selectedModel" | "currentPersonality" | "theme">>) => void;
}

export const useAssistantStore = create<AssistantStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      
      isThinking: false,
      isRecording: false,
      isSpeaking: false,
      isStreaming: false,
      
      selectedModel: "gpt-4o-mini",
      currentPersonality: "jarvis",
      theme: "dark",

      createConversation: () => {
        const newConv: Conversation = {
          id: crypto.randomUUID(),
          title: "New Neural Link",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        set((state) => ({
          conversations: [newConv, ...state.conversations],
          activeConversationId: newConv.id,
        }));
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      deleteConversation: (id) => set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
      })),

      addMessage: (msg) => {
        const { activeConversationId, conversations } = get();
        let targetId = activeConversationId;
        
        // Auto-create conversation if none active
        if (!targetId) {
          const newId = crypto.randomUUID();
          const newConv: Conversation = {
            id: newId,
            title: msg.content.slice(0, 30) || "New Chat",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
          };
          set({ conversations: [newConv, ...conversations], activeConversationId: newId });
          targetId = newId;
        }

        const newMessage: Message = {
          ...msg,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === targetId
              ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  updatedAt: Date.now(),
                  title: c.messages.length === 0 && msg.role === "user" ? msg.content.slice(0, 40) : c.title
                }
              : c
          ),
        }));
      },

      updateLastMessage: (content) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  messages: c.messages.map((m, i) =>
                    i === c.messages.length - 1 ? { ...m, content: m.content + content } : m
                  ),
                }
              : c
          ),
        }));
      },

      setThinking: (isThinking) => set({ isThinking }),
      setRecording: (isRecording) => set({ isRecording }),
      setSpeaking: (isSpeaking) => set({ isSpeaking }),
      setStreaming: (isStreaming) => set({ isStreaming }),

      clearMessages: () => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === activeConversationId ? { ...c, messages: [] } : c
          ),
        }));
      },

      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: "alterego-assistant-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        selectedModel: state.selectedModel,
        currentPersonality: state.currentPersonality,
        theme: state.theme,
      }),
    }
  )
);
