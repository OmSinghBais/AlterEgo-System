"use client";

import { useEffect } from "react";
import { useAssistantStore } from "@/store/useAssistantStore";

export function useKeyboardShortcuts() {
  const { createConversation, clearMessages } = useAssistantStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K -> New Chat (Prevent default browser behavior)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        createConversation();
      }

      // Ctrl+Delete -> Clear current messages
      if ((e.ctrlKey || e.metaKey) && e.key === "Backspace") {
        if (confirm("Clear current conversation history?")) {
          clearMessages();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createConversation, clearMessages]);
}
