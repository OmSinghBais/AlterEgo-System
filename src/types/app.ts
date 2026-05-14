export type OrbMode =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "sleeping";

export type LiveStatus = "idle" | "connecting" | "streaming" | "ready" | "error";

export type ThemePreference = "dark" | "system";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}
