import VoiceOrb from "@/components/voice/VoiceOrb";
import WaveformBars from "@/components/realtime/WaveformBars";

export default function VoicePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-red-500/85">
          Voice channel
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Realtime listening · simulated
        </h1>
      </div>
      <VoiceOrb />
      <WaveformBars />
    </div>
  );
}
