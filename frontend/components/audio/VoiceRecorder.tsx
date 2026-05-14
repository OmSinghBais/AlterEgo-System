"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { useAssistantStore } from "@/store/useAssistantStore";
import { audioQueue } from "@/services/audioQueue";
import AudioVisualizer from "./AudioVisualizer";

const SILENCE_THRESHOLD = 0.01;
const SILENCE_DURATION = 1500; // ms

export default function VoiceRecorder() {
  const { isRecording, setRecording, setThinking, setSpeaking, addMessage } = useAssistantStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const chunks = useRef<Blob[]>([]);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      audioQueue.interrupt();
      setSpeaking(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);
      analyser.current.fftSize = 256;
      
      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkSilence = () => {
        if (!mediaRecorder.current || mediaRecorder.current.state !== "recording") return;
        
        analyser.current?.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0 - 1.0;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / bufferLength);

        if (rms < SILENCE_THRESHOLD) {
          if (!silenceTimer.current) {
            silenceTimer.current = setTimeout(() => {
              stopRecording();
            }, SILENCE_DURATION);
          }
        } else {
          if (silenceTimer.current) {
            clearTimeout(silenceTimer.current);
            silenceTimer.current = null;
          }
        }

        requestAnimationFrame(checkSilence);
      };

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
        await handleVoiceUpload(audioBlob);
      };

      mediaRecorder.current.start();
      setRecording(true);
      checkSilence();
    } catch (err) {
      console.error("Voice system error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
      
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
        silenceTimer.current = null;
      }
      
      if (audioContext.current) {
        audioContext.current.close();
      }
    }
  };

  const handleVoiceUpload = async (blob: Blob) => {
    setIsProcessing(true);
    setThinking(true);

    const formData = new FormData();
    formData.append("audio", blob, "voice.wav");

    try {
      const response = await fetch("http://localhost:8000/voice", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      addMessage({ role: "user", content: data.transcript });
      addMessage({ role: "assistant", content: data.response });
      
      if (data.audio_url) {
        setSpeaking(true);
        await audioQueue.enqueue(data.audio_url);
      }
    } catch (err) {
      console.error("Voice pipeline failed:", err);
    } finally {
      setIsProcessing(false);
      setThinking(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <AudioVisualizer />
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`p-3 rounded-xl transition-all shadow-lg ${
          isRecording 
            ? "bg-red-600 text-white animate-pulse scale-110 shadow-red-500/20" 
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
        } disabled:opacity-50`}
      >
        {isProcessing ? (
          <Loader2 className="size-5 animate-spin" />
        ) : isRecording ? (
          <Square className="size-5" />
        ) : (
          <Mic className="size-5" />
        )}
      </button>
    </div>
  );
}
