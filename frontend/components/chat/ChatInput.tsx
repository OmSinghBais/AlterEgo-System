"use client";

import { useState } from "react";
import { useAssistantStore } from "@/store/useAssistantStore";
import VoiceRecorder from "@/components/audio/VoiceRecorder";
import { Send } from "lucide-react";

export default function ChatInput() {
  const [message, setMessage] = useState("");
  const { addMessage, updateLastMessage, setThinking, setStreaming, isThinking, isStreaming } = useAssistantStore();

  const handleSend = async () => {
    if (!message.trim() || isThinking || isStreaming) return;

    const userMessage = message;
    setMessage("");

    // 1. Add user message
    addMessage({ role: "user", content: userMessage });
    
    // 2. Start thinking
    setThinking(true);

    try {
      const response = await fetch("http://localhost:8000/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // 3. Setup streaming
      setThinking(false);
      setStreaming(true);
      addMessage({ role: "assistant", content: "" });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        updateLastMessage(chunk);
      }
    } catch (error) {
      console.error(error);
      setThinking(false);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="border-t border-zinc-800 p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex gap-3">
        <VoiceRecorder />
        
        <div className="flex-1 relative">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Neural input required..."
            className="w-full bg-zinc-900 rounded-xl px-4 py-3 outline-none text-white border border-white/5 focus:border-white/10 transition-all placeholder:text-zinc-600"
          />
          {(isThinking || isStreaming) && (
             <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
               <div className="size-1 bg-cyan-500 rounded-full animate-bounce" />
               <div className="size-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
               <div className="size-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
             </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || isThinking || isStreaming}
          className="bg-white text-black px-6 rounded-xl font-bold transition-all hover:bg-zinc-200 disabled:opacity-30 flex items-center justify-center gap-2 group"
        >
          <span>SEND</span>
          <Send size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
