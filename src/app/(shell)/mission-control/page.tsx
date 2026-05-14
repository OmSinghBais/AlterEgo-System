"use client";

import { useEffect, useState } from "react";
import { 
  Activity, Brain, Cpu, Database, Globe, 
  Layers, MessageSquare, Monitor, Play, 
  Shield, Zap, Terminal, Search, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useVoiceWebSocket } from "@/hooks/useVoiceWebSocket";

export default function MissionControlPage() {
  const { status, lastMessage } = useVoiceWebSocket();
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    cpu: 12,
    mem: 45,
    tokens: 12450,
    latency: 450
  });

  // Handle agent telemetry from WebSocket
  useEffect(() => {
    if (lastMessage?.type === "agent_thought" || lastMessage?.type === "agent_action") {
      setTelemetry(prev => [lastMessage, ...prev].slice(0, 50));
    }
  }, [lastMessage]);

  return (
    <div className="p-8 space-y-8 bg-black/40 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            MISSION CONTROL
          </h1>
          <p className="text-muted-foreground mt-1">AlterEGO Cognitive Operating System — v4.0.0-stable</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="px-4 py-1 border-blue-500/50 text-blue-400">
            <Zap className="w-3 h-3 mr-2" />
            CORE ACTIVE
          </Badge>
          <Badge variant="outline" className="px-4 py-1 border-green-500/50 text-green-400">
             <Shield className="w-3 h-3 mr-2" />
             SAFETENSORS ENABLED
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Cognitive Stream */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-zinc-900/50 border-zinc-800 h-[600px] flex flex-col overflow-hidden">
            <CardHeader className="border-b border-zinc-800/50 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Brain className="w-4 h-4 text-blue-400" />
                COGNITIVE STREAM (TELEMETRY)
              </CardTitle>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Live Link</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide">
              <div className="p-4 space-y-4 font-mono text-[13px]">
                <AnimatePresence initial={false}>
                  {telemetry.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 mt-20 opacity-50">
                      <Terminal className="w-12 h-12 mb-4" />
                      <p>Waiting for agent activation...</p>
                    </div>
                  ) : (
                    telemetry.map((t, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border flex gap-3 ${
                          t.type === 'agent_thought' 
                            ? 'bg-blue-500/5 border-blue-500/20' 
                            : 'bg-purple-500/5 border-purple-500/20'
                        }`}
                      >
                        <div className="mt-1">
                          {t.type === 'agent_thought' ? <Brain className="w-4 h-4 text-blue-400" /> : <Play className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                              t.type === 'agent_thought' ? 'text-blue-400' : 'text-purple-400'
                            }`}>
                              {t.type === 'agent_thought' ? 'Thought' : 'Action'} — {t.agent}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-zinc-300 leading-relaxed italic text-[12px]">
                            {t.content || t.step}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: System Health & Active Agents */}
        <div className="space-y-8">
          
          {/* Active Agents */}
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                ACTIVE AGENTS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Planner", role: "Goal Decomposition", status: "Active", icon: Brain },
                { name: "Browser", role: "Operator Automation", status: "Standby", icon: Globe },
                { name: "Vision", role: "Screen Understanding", status: "Active", icon: Eye },
                { name: "Research", role: "Internet Retrieval", status: "Active", icon: Search },
              ].map((agent, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50 hover:border-blue-500/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-zinc-800 group-hover:bg-blue-500/10 transition-colors">
                      <agent.icon className="w-4 h-4 text-zinc-400 group-hover:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">{agent.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">{agent.role}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${
                    agent.status === 'Active' ? 'text-green-400 border-green-500/50' : 'text-zinc-500 border-zinc-800'
                  }`}>
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Telemetry */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium">SYSTEM HEALTH</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>NEURAL LOAD (CPU)</span>
                  <span>{metrics.cpu}%</span>
                </div>
                <Progress value={metrics.cpu} className="h-1 bg-zinc-800" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>SYNAPTIC WEIGHT (MEM)</span>
                  <span>{metrics.mem}%</span>
                </div>
                <Progress value={metrics.mem} className="h-1 bg-zinc-800" />
              </div>
              <div className="pt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Tokens (24h)</p>
                  <p className="text-lg font-mono font-bold text-blue-400">{metrics.tokens.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Latency</p>
                  <p className="text-lg font-mono font-bold text-purple-400">{metrics.latency}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
