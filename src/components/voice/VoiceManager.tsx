"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useMicRecorder } from "@/hooks/useMicRecorder";
import { useVoiceWebSocket } from "@/hooks/useVoiceWebSocket";

export default function VoiceManager() {
  const isListening = useAppStore((s) => s.voiceState.isListening);
  const toggleListening = useAppStore((s) => s.toggleListening);
  const { startRecording, stopRecording, recording } = useMicRecorder();
  const { sendAudio, interrupt } = useVoiceWebSocket();
  const wasListening = useRef(false);

  useEffect(() => {
    if (isListening && !wasListening.current) {
      // Start recording and interrupt any speaking AI
      interrupt();
      startRecording(() => {
        // This is the onSilence callback
        if (useAppStore.getState().voiceState.isListening) {
          toggleListening(); // turn off listening
        }
      }).catch(console.error);
      wasListening.current = true;
    } else if (!isListening && wasListening.current) {
      // Stop recording and send audio
      if (recording) {
        const audioBuffer = stopRecording();
        sendAudio(audioBuffer);
      }
      wasListening.current = false;
    }
  }, [isListening, startRecording, stopRecording, recording, sendAudio, interrupt, toggleListening]);

  return null; // Hidden component, purely logic
}
