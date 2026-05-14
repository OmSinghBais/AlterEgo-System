"use client";

import { useAssistantStore } from "@/store/useAssistantStore";
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Sidebar() {
  const { conversations, activeConversationId, createConversation, setActiveConversation, deleteConversation } = useAssistantStore();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-zinc-900 rounded-lg lg:hidden"
      >
        <ChevronRight className={`transition-transform ${isOpen ? "rotate-180" : ""}`} size={20} />
      </button>

      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
        className="relative h-full bg-[#050505] border-r border-white/5 flex flex-col overflow-hidden"
      >
        <div className="p-4 flex flex-col gap-4 h-full w-[280px]">
          {/* New Chat */}
          <button
            onClick={() => createConversation()}
            className="flex items-center gap-3 w-full p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all font-bold text-xs tracking-widest"
          >
            <Plus size={16} />
            NEW NEURAL LINK
          </button>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-2 py-4 custom-scrollbar">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  activeConversationId === conv.id 
                    ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-200" 
                    : "text-zinc-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={16} className="shrink-0" />
                  <span className="truncate text-xs font-medium">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="size-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Settings size={16} className="text-zinc-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-300">ALTEREGO CORE</span>
                <span className="text-[8px] text-zinc-600">v4.1.0-STABLE</span>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
