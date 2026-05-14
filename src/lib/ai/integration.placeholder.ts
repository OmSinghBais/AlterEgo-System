/**
 * Backend phase (after cinematic frontend locks in)
 *
 * | Concern    | Suggested stack                          |
 * |------------|------------------------------------------|
 * | API        | FastAPI                                 |
 * | LLM        | OpenAI (or compatible) streaming        |
 * | Realtime   | WebSockets or SSE                       |
 * | Voice in   | Whisper (or browser speech recognition) |
 * | Voice out  | ElevenLabs / OpenAI TTS                 |
 *
 * Map server tokens → `updateChatMessage` / `setOrbMode("speaking")` /
 * `setRealtimeStatus("streaming")` so the orb + chat stay in sync.
 *
 * Env examples: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`
 */

export {};
