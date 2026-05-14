import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ChatMessage,
  LiveStatus,
  OrbMode,
  ThemePreference,
} from "@/types/app";
import { pickMockReply } from "@/lib/mockAi";

/** Re-export pipeline mode for components that import from the store. */
export type { OrbMode } from "@/types/app";

function uid() {
  return crypto.randomUUID();
}

export interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  chatPanelOpen: boolean;
  activeSectionId: string | null;
  reducedMotion: boolean;
}

export interface VoiceState {
  isListening: boolean;
  inputLevel: number;
}

export type ThinkingSubState =
  | "analyzing"
  | "accessing_memory"
  | "generating"
  | null;

export interface OrbState {
  mode: OrbMode;
  /** 0–1 visual energy driving glow / waveform */
  energy: number;
  /** Task 18: Granular thinking sub-state */
  thinkingSubState: ThinkingSubState;
}

export interface AnimationPrefs {
  landingIntroDone: boolean;
  prefersReducedMotion: boolean;
}

export interface SettingsState {
  theme: ThemePreference;
  audioFeedbackEnabled: boolean;
  /** Task 17: AI Personality / Identity */
  personalityId: string;
  /** TTS Voice selection */
  voiceId: string;
}

export interface SessionInfo {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messages: ChatMessage[];
}


export interface AppStore {
  uiState: UiState;
  voiceState: VoiceState;
  orbState: OrbState;
  animations: AnimationPrefs;
  settings: SettingsState;
  chatMessages: ChatMessage[];
  history: SessionInfo[];
  currentSessionId: string | null;
  realtimeStatus: LiveStatus;

  /** Sleep mode — reduced animation, passive wake only */
  sleepMode: boolean;

  setUiState: (partial: Partial<UiState>) => void;
  setVoiceState: (partial: Partial<VoiceState>) => void;
  setOrbState: (partial: Partial<OrbState>) => void;
  /** Shorthand: set orb emotional / activity mode (keeps energy unless you pass energy in setOrbState). */
  setOrbMode: (mode: OrbMode) => void;
  /** Task 18: Set thinking sub-state label */
  setThinkingSubState: (sub: ThinkingSubState) => void;
  setAnimations: (partial: Partial<AnimationPrefs>) => void;
  setSettings: (partial: Partial<SettingsState>) => void;
  setRealtimeStatus: (status: LiveStatus) => void;
  setHistory: (history: SessionInfo[]) => void;
  setCurrentSessionId: (id: string | null) => void;


  appendChatMessage: (msg: Omit<ChatMessage, "id" | "createdAt">) => string;
  /** Alias for `appendChatMessage` — conversation API. */
  addMessage: (msg: Omit<ChatMessage, "id" | "createdAt">) => string;
  updateChatMessage: (id: string, content: string) => void;
  clearChat: () => void;

  toggleListening: () => void;
  /** Listen (2s) → think (1.5s) → stream as speaking → idle */
  startFakeVoiceCycle: () => void;
  /** Demo: flash error state then recover */
  pulseOrbError: () => void;
  simulateAssistantStream: (
    fullText: string,
    opts?: { thinkBeforeStreamMs?: number }
  ) => void;
  toggleSidebarCollapsed: () => void;
  /** Enter sleep mode — dim orb, reduce ambient */
  enterSleepMode: () => void;
  /** Exit sleep mode — wake orb, restore ambient */
  exitSleepMode: () => void;
  /** Real backend messaging with streaming */
  sendMessage: (text: string) => Promise<void>;
}

const initialUi: UiState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  chatPanelOpen: true,
  activeSectionId: null,
  reducedMotion: false,
};

const initialVoice: VoiceState = {
  isListening: false,
  inputLevel: 0,
};

const initialOrb: OrbState = {
  mode: "idle",
  energy: 0.35,
  thinkingSubState: null,
};

const initialAnimations: AnimationPrefs = {
  landingIntroDone: false,
  prefersReducedMotion: false,
};

const initialSettings: SettingsState = {
  theme: "dark",
  audioFeedbackEnabled: true,
  personalityId: "jarvis",
  voiceId: "en-US-GuyNeural",
};


function energyForMode(mode: OrbMode): number {
  switch (mode) {
    case "listening":
      return 0.88;
    case "thinking":
      return 0.55;
    case "speaking":
      return 0.95;
    case "error":
      return 0.72;
    case "sleeping":
      return 0.22;
    default:
      return 0.38;
  }
}

function busyPipeline(state: AppStore) {
  const { orbState, realtimeStatus } = state;
  if (orbState.mode === "error") return true;
  if (orbState.mode === "sleeping") return false;
  return (
    realtimeStatus === "streaming" ||
    orbState.mode === "thinking" ||
    orbState.mode === "speaking" ||
    orbState.mode === "listening"
  );
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
  uiState: initialUi,
  voiceState: initialVoice,
  orbState: initialOrb,
  animations: initialAnimations,
  settings: initialSettings,
  chatMessages: [
    {
      id: "seed-user",
      role: "user",
      content: "Hello Om 👋",
      createdAt: 0,
    },
    {
      id: "seed-assistant",
      role: "assistant",
      content: "Welcome to AlterEGO — cinematic intelligence online.",
      createdAt: 1,
    },
  ],
  realtimeStatus: "ready",
  sleepMode: false,
  history: [],
  currentSessionId: uid(),


  setUiState: (partial) =>
    set((s) => ({ uiState: { ...s.uiState, ...partial } })),
  setVoiceState: (partial) =>
    set((s) => ({ voiceState: { ...s.voiceState, ...partial } })),
  setOrbState: (partial) =>
    set((s) => {
      const nextMode = partial.mode ?? s.orbState.mode;
      const nextEnergy =
        partial.energy ??
        (partial.mode !== undefined ? energyForMode(partial.mode) : s.orbState.energy);
      return {
        orbState: {
          ...s.orbState,
          ...partial,
          mode: nextMode,
          energy: nextEnergy,
        },
      };
    }),
  setOrbMode: (mode) =>
    set((s) => ({
      orbState: {
        ...s.orbState,
        mode,
        energy: energyForMode(mode),
        thinkingSubState: mode === "thinking" ? s.orbState.thinkingSubState : null,
      },
    })),
  setThinkingSubState: (sub) =>
    set((s) => ({
      orbState: { ...s.orbState, thinkingSubState: sub },
    })),
  setAnimations: (partial) =>
    set((s) => ({ animations: { ...s.animations, ...partial } })),
  setSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),
  setRealtimeStatus: (realtimeStatus) => set({ realtimeStatus }),
  setHistory: (history) => set({ history }),
  setCurrentSessionId: (currentSessionId) => {
    const s = get();
    let updatedHistory = [...s.history];
    
    // Save current session before switching if it has messages
    if (s.currentSessionId && s.chatMessages.length > 0) {
      const existingIdx = updatedHistory.findIndex((h) => h.id === s.currentSessionId);
      const lastMsg = s.chatMessages[s.chatMessages.length - 1]?.content || "";
      const title = s.chatMessages.find(m => m.role === "user")?.content.slice(0, 30) + "..." || "Session";
      
      if (existingIdx >= 0) {
        updatedHistory[existingIdx] = {
          ...updatedHistory[existingIdx],
          messages: s.chatMessages,
          lastMessage: lastMsg,
        };
      } else {
        updatedHistory.unshift({
          id: s.currentSessionId,
          title,
          lastMessage: lastMsg,
          timestamp: Date.now(),
          messages: s.chatMessages,
        });
      }
    }
    
    // Load target session
    const targetSession = updatedHistory.find((h) => h.id === currentSessionId);
    set({
      history: updatedHistory,
      currentSessionId,
      chatMessages: targetSession ? targetSession.messages : [],
    });
  },


  appendChatMessage: (msg) => {
    const id = uid();
    set((s) => ({
      chatMessages: [
        ...s.chatMessages,
        { ...msg, id, createdAt: Date.now() },
      ],
    }));
    return id;
  },

  addMessage: (msg) => get().appendChatMessage(msg),

  updateChatMessage: (id, content) =>
    set((s) => ({
      chatMessages: s.chatMessages.map((m) =>
        m.id === id ? { ...m, content } : m
      ),
    })),

  clearChat: () => set({ chatMessages: [] }),

  toggleListening: () => {
    const listening = !get().voiceState.isListening;
    set((s) => ({
      voiceState: {
        ...s.voiceState,
        isListening: listening,
        inputLevel: listening ? 0.6 : 0,
      },
      orbState: {
        ...s.orbState,
        mode: listening ? "listening" : "idle",
        energy: listening ? energyForMode("listening") : energyForMode("idle"),
      },
    }));
  },

  startFakeVoiceCycle: () => {
    if (get().orbState.mode === "sleeping") {
      get().setOrbMode("idle");
    }
    if (busyPipeline(get())) return;

    get().addMessage({
      role: "user",
      content: "Core stimulus — open channel.",
    });

    set((s) => ({
      voiceState: {
        ...s.voiceState,
        isListening: false,
        inputLevel: 0.52,
      },
      orbState: { ...s.orbState, mode: "listening", energy: energyForMode("listening") },
      realtimeStatus: "ready",
    }));

    const listenSimId = window.setInterval(() => {
      set((s) => ({
        voiceState: {
          ...s.voiceState,
          inputLevel: 0.38 + Math.random() * 0.42,
        },
        orbState: {
          ...s.orbState,
          energy: 0.55 + Math.random() * 0.32,
        },
      }));
    }, 85);

    window.setTimeout(() => {
      window.clearInterval(listenSimId);
      set((s) => ({
        voiceState: { ...s.voiceState, inputLevel: 0 },
        orbState: { ...s.orbState, mode: "thinking", energy: energyForMode("thinking") },
        realtimeStatus: "connecting",
      }));
    }, 2000);

    window.setTimeout(() => {
      get().simulateAssistantStream(pickMockReply(), {
        thinkBeforeStreamMs: 0,
      });
    }, 2000 + 1500);
  },

  pulseOrbError: () => {
    set((s) => ({
      orbState: { ...s.orbState, mode: "error", energy: energyForMode("error") },
      realtimeStatus: "error",
    }));
    window.setTimeout(() => {
      set((s) => ({
        orbState: { ...s.orbState, mode: "idle", energy: energyForMode("idle") },
        realtimeStatus: "ready",
      }));
    }, 2200);
  },

  toggleSidebarCollapsed: () =>
    set((s) => ({
      uiState: {
        ...s.uiState,
        sidebarCollapsed: !s.uiState.sidebarCollapsed,
      },
    })),

  simulateAssistantStream: (fullText, opts) => {
    const thinkBeforeStreamMs = opts?.thinkBeforeStreamMs ?? 1000;
    const chars = Array.from(fullText);

    const id = get().appendChatMessage({
      role: "assistant",
      content: "",
    });

    const beginChars = () => {
      set((s) => ({
        realtimeStatus: "streaming",
        orbState: { ...s.orbState, mode: "speaking", energy: energyForMode("speaking") },
      }));

      let i = 0;
      const tick = () => {
        if (i >= chars.length) {
          set((s) => ({
            realtimeStatus: "ready",
            orbState: { ...s.orbState, mode: "idle", energy: energyForMode("idle") },
            voiceState: {
              ...s.voiceState,
              inputLevel: s.voiceState.isListening ? s.voiceState.inputLevel : 0,
            },
          }));
          return;
        }
        i += 1;
        get().updateChatMessage(id, chars.slice(0, i).join(""));
        const ch = chars[i - 1];
        const isSpace = ch === " " || ch === "\n" || ch === "\t";
        const delay = isSpace ? 6 + Math.random() * 10 : 12 + Math.random() * 20;
        window.setTimeout(tick, delay);
      };
      tick();
    };

    if (thinkBeforeStreamMs > 0) {
      set((s) => ({
        orbState: { ...s.orbState, mode: "thinking", energy: energyForMode("thinking") },
        realtimeStatus: "connecting",
      }));
      window.setTimeout(beginChars, thinkBeforeStreamMs);
    } else {
      beginChars();
    }
  },

  enterSleepMode: () =>
    set((s) => ({
      sleepMode: true,
      orbState: {
        ...s.orbState,
        mode: "sleeping" as OrbMode,
        energy: energyForMode("sleeping"),
        thinkingSubState: null,
      },
    })),

  exitSleepMode: () =>
    set((s) => ({
      sleepMode: false,
      orbState: {
        ...s.orbState,
        mode: "idle" as OrbMode,
        energy: energyForMode("idle"),
      },
    })),

  sendMessage: async (text: string) => {
    const { addMessage, updateChatMessage, setOrbState, setRealtimeStatus } = get();
    
    // 1. Add User Message
    addMessage({ role: "user", content: text });
    
    // 2. Set Thinking State
    setOrbState({ mode: "thinking", thinkingSubState: "generating" });
    setRealtimeStatus("connecting");

    // 3. Create Placeholder Assistant Message
    const assistantMsgId = addMessage({ role: "assistant", content: "" });
    let fullContent = "";

    try {
      const response = await fetch("http://localhost:8000/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode: "cinematic" }),
      });

      if (!response.ok) throw new Error("Backend connection failed");
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream reader");

      setOrbState({ mode: "speaking" });
      setRealtimeStatus("streaming");

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        fullContent += chunk;
        updateChatMessage(assistantMsgId, fullContent);
      }

    } catch (error) {
      console.error("Chat Error:", error);
      updateChatMessage(assistantMsgId, "[Neural Connection Lost. Please check backend status.]");
      setOrbState({ mode: "error" });
    } finally {
      setRealtimeStatus("ready");
      setOrbState({ mode: "idle" });
    }
  },
}),
{
  name: "alterego-storage",
  partialize: (state) => ({
    history: state.history,
    currentSessionId: state.currentSessionId,
    chatMessages: state.chatMessages,
    settings: state.settings,
    animations: state.animations,
  }),
}));
