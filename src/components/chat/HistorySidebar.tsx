"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Trash2, Clock, Search, Edit2, Check, X as CloseIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function HistorySidebar() {
  const { history, currentSessionId, setCurrentSessionId, setHistory } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredHistory = history.filter(s => 
    (s.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (s.lastMessage?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(s => s.id !== id);
    setHistory(newHistory);
    if (currentSessionId === id) {
      if (newHistory.length > 0) {
        setCurrentSessionId(newHistory[0].id);
      } else {
        setCurrentSessionId(crypto.randomUUID());
      }
    }
  };

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle || "Untitled Session");
  };

  const saveRename = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newHistory = history.map(s => s.id === id ? { ...s, title: editTitle } : s);
    setHistory(newHistory);
    setEditingId(null);
  };

  const startNewChat = () => {
    setCurrentSessionId(crypto.randomUUID());
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-white/[0.05] bg-[#060a0e]/50 backdrop-blur-xl">
      <div className="p-4">
        <Button 
          onClick={startNewChat}
          className="group w-full justify-start gap-2 border-white/10 bg-white/5 font-space text-xs font-medium text-white transition-all hover:bg-cyan-500/10 hover:text-cyan-200"
          variant="outline"
        >
          <Plus className="size-4 transition-transform group-hover:rotate-90" />
          NEW NEURAL LINK
        </Button>
      </div>

      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3 -translate-y-1/2 text-white/30" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full rounded-lg border border-white/5 bg-white/5 py-2 pl-9 pr-4 text-[10px] text-white/70 outline-none transition-focus focus:border-cyan-500/30"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          <AnimatePresence mode="popLayout">
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-30">
                <Clock className="mb-2 size-8" />
                <p className="text-[10px] uppercase tracking-widest">{searchQuery ? "No matches found" : "No previous sessions"}</p>
              </div>
            ) : (
              filteredHistory.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => {
                      if (editingId !== session.id) setCurrentSessionId(session.id);
                    }}
                    className={cn(
                      "group relative flex w-full flex-col items-start gap-1 rounded-xl p-3 text-left transition-all",
                      currentSessionId === session.id
                        ? "bg-cyan-500/10 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.2)]"
                        : "hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      {editingId === session.id ? (
                        <div className="flex w-full items-center gap-1">
                          <input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveRename(session.id)}
                            className="w-full rounded bg-black/50 px-1.5 py-0.5 text-xs text-white outline-none ring-1 ring-cyan-500/50"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button onClick={(e) => saveRename(session.id, e)} className="text-green-400 hover:text-green-300">
                            <Check className="size-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-red-400 hover:text-red-300">
                            <CloseIcon className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={cn(
                            "truncate text-xs font-medium",
                            currentSessionId === session.id ? "text-cyan-200" : "text-white/70"
                          )}>
                            {session.title || "Untitled Session"}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button 
                              onClick={(e) => startRename(session.id, session.title, e)}
                              className="text-white/40 hover:text-cyan-300"
                            >
                              <Edit2 className="size-3" />
                            </button>
                            <button 
                              onClick={(e) => deleteSession(session.id, e)}
                              className="text-white/40 hover:text-red-400"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    <span className="line-clamp-1 text-[10px] text-white/30">
                      {session.lastMessage || "Empty session"}
                    </span>
                    <span className="mt-1 text-[8px] uppercase tracking-tighter text-white/20">
                      {formatDistanceToNow(session.timestamp)} ago
                    </span>
                    
                    {currentSessionId === session.id && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                      />
                    )}
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="mt-auto p-4 border-t border-white/[0.03]">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <MessageSquare className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-white/80">MEMORY UTILIZATION</span>
            <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-[40%] bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
