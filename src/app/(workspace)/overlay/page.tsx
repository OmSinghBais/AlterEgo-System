"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useVoiceWebSocket } from "@/hooks/useVoiceWebSocket";

export default function OverlayPage() {
  const { socketState, sendText, lastMessage } = useVoiceWebSocket();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [streaming, setStreaming] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragStart = useRef({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    const data = lastMessage;
    if (data.type === "token") {
      if (data.done) {
        setMessages((prev) => [...prev, { role: "assistant", text: streaming }]);
        setStreaming("");
      } else {
        setStreaming((prev) => prev + (data.content || ""));
      }
    }
  }, [lastMessage]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, streaming]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    sendText(input);
    setInput("");
  }, [input, sendText]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging) return;
      setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging]);

  if (minimized) {
    return (
      <div
        onClick={() => setMinimized(false)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00d4ff 0%, #7b2fff 100%)",
          boxShadow: "0 0 24px rgba(0,212,255,0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          animation: "pulse 2s infinite",
        }}
      >
        <span style={{ fontSize: 24 }}>🧠</span>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 24px rgba(0,212,255,0.4); }
          50% { transform: scale(1.08); box-shadow: 0 0 32px rgba(0,212,255,0.6); }
        }
        .overlay-msg::-webkit-scrollbar { width: 4px; }
        .overlay-msg::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
      `}</style>
      <div
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          width: 380,
          maxHeight: 520,
          borderRadius: 16,
          background: "rgba(10, 10, 18, 0.92)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Title Bar */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "grab",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: socketState === "connected" ? "#00ff88" : "#ff4444",
                boxShadow: socketState === "connected" ? "0 0 8px #00ff88" : "0 0 8px #ff4444",
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>
              ALTEREGO
            </span>
          </div>
          <button
            onClick={() => setMinimized(true)}
            style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.4)",
              cursor: "pointer", fontSize: 16, padding: "2px 6px", borderRadius: 4,
            }}
          >
            —
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="overlay-msg"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: 360,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user"
                  ? "linear-gradient(135deg, #7b2fff 0%, #00d4ff 100%)"
                  : "rgba(255,255,255,0.06)",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: 12,
                maxWidth: "85%",
                fontSize: 13,
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {m.text}
            </div>
          ))}
          {streaming && (
            <div
              style={{
                alignSelf: "flex-start",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: 12,
                maxWidth: "85%",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {streaming}
              <span style={{ opacity: 0.5, animation: "pulse 1s infinite" }}>▊</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Jarvis..."
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "8px 12px",
              color: "#fff",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: "linear-gradient(135deg, #7b2fff, #00d4ff)",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
}
