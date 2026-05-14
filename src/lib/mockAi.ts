/** Simulated AI — swap for FastAPI + OpenAI streaming later (see `src/lib/ai/`). */

export const MOCK_ASSISTANT_REPLIES = [
  "Signal locked. Processing intent vectors… articulating response now.",
  "Neural mesh stable. Here’s what I’m seeing in your context layer.",
  "Listening boundary engaged. Composing a concise next step for you.",
  "AlterEGO online — depth without noise. Glow and waveform stay synced.",
  "Inference complete. I’ll stream this character-by-character so latency reads as intelligence.",
] as const;

export function pickMockReply(): string {
  const i = Math.floor(Math.random() * MOCK_ASSISTANT_REPLIES.length);
  return MOCK_ASSISTANT_REPLIES[i] ?? MOCK_ASSISTANT_REPLIES[0];
}
