"use client";

import { useEffect, useState } from "react";
import { Brain, Database, Search, Sparkles, Clock, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Memory {
  id: number;
  content: string;
  category: string;
  importance: number;
  created_at: number;
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [facts, setFacts] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [memRes, factRes] = await Promise.all([
          fetch("http://localhost:8000/api/memory"),
          fetch("http://localhost:8000/api/facts")
        ]);
        const memData = await memRes.json();
        const factData = await factRes.json();
        setMemories(memData);
        setFacts(factData);
      } catch (e) {
        console.error("Failed to fetch memory data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredMemories = memories.filter(m => 
    m.content.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="mb-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/30">
            Neural Storage Active
          </Badge>
          <h1 className="font-space text-4xl font-bold tracking-tight text-white">Semantic Memory</h1>
          <p className="text-sm text-white/50">Long-term episodic and factual storage.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <Input 
            placeholder="Search neural patterns..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-white/5 bg-[#0a1018]/60 pl-10 text-white backdrop-blur-xl"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Facts */}
        <div className="lg:col-span-1">
          <Card className="border-white/5 bg-[#0a1018]/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center gap-3">
              <Database className="size-5 text-cyan-400" />
              <CardTitle className="text-white">Core Facts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(facts).length === 0 ? (
                  <p className="text-xs text-white/30 italic">No hard facts established yet.</p>
                ) : (
                  Object.entries(facts).map(([k, v]) => (
                    <div key={k} className="group relative rounded-lg border border-white/5 bg-white/5 p-3 transition-all hover:bg-white/10">
                      <p className="text-[10px] uppercase tracking-widest text-white/40">{k}</p>
                      <p className="mt-1 text-sm text-white">{String(v)}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Memories */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredMemories.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <Brain className="mx-auto mb-4 size-12 text-white/10" />
                  <p className="text-white/40">No neural clusters matching your search.</p>
                </div>
              ) : (
                filteredMemories.map((mem, idx) => (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group relative h-full overflow-hidden border-white/5 bg-[#0a1018]/40 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5 backdrop-blur-xl">
                      <div className="absolute right-3 top-3">
                         <div className="flex items-center gap-1">
                            <Star className={`size-3 ${mem.importance > 0.7 ? "text-yellow-400" : "text-white/20"}`} fill={mem.importance > 0.7 ? "currentColor" : "none"} />
                            <span className="text-[10px] font-mono text-white/30">{(mem.importance * 100).toFixed(0)}%</span>
                         </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <Badge variant="outline" className="bg-white/5 text-[10px] text-white/40 border-white/10">
                            {mem.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-[10px] text-white/20">
                            <Clock className="size-3" />
                            {new Date(mem.created_at * 1000).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-white/80 line-clamp-4">
                          {mem.content}
                        </p>
                        
                        <div className="absolute bottom-0 left-0 h-1 w-0 bg-cyan-500/50 transition-all group-hover:w-full" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
