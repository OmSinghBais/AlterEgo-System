/**
 * Realtime client wiring — extend when integrating a WebSocket / Socket.IO server.
 */
export type SocketStatus = "idle" | "connecting" | "connected" | "error"

export function getSocketUrl(): string {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL
  }
  return ""
}
