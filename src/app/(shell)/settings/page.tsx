"use client";

import { useAppStore } from "@/store/useAppStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Brain, Mic, Shield, User, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { settings, setSettings } = useAppStore();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-10">
        <h1 className="font-space text-3xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-sm text-white/50">Configure your neural link and AI personality.</p>
      </header>

      <Tabs defaultValue="brain" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-4 bg-[#0a1018]/50 p-1">
          <TabsTrigger value="brain" className="flex items-center gap-2">
            <Brain className="size-4" />
            <span className="hidden sm:inline">Brain</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="size-4" />
            <span className="hidden sm:inline">Voice</span>
          </TabsTrigger>
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <User className="size-4" />
            <span className="hidden sm:inline">Identity</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="size-4" />
            <span className="hidden sm:inline">Safety</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brain">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6"
          >
            <Card className="border-white/5 bg-[#0a1018]/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">LLM Configuration</CardTitle>
                <CardDescription>Select the core intelligence model.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-white/70">Intelligence Model</Label>
                  <Input 
                    id="model" 
                    value="GPT-4o-mini" 
                    disabled 
                    className="border-white/10 bg-white/5 text-white"
                  />
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">v4.1 Neural Engine Active</p>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label className="text-white">Enhanced Context</Label>
                    <p className="text-xs text-white/40">Inject long-term memory into every prompt.</p>
                  </div>
                  <Switch checked={true} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="voice">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6"
          >
            <Card className="border-white/5 bg-[#0a1018]/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">Voice & Output</CardTitle>
                <CardDescription>Customize how AlterEGO sounds.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white/70">TTS Voice</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["GuyNeural (Jarvis)", "JennyNeural (Elena)"].map((v) => (
                      <Button
                        key={v}
                        variant="outline"
                        className={`h-12 border-white/10 transition-all ${
                          v.includes(settings.voiceId) 
                            ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/50" 
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                        onClick={() => setSettings({ voiceId: v.includes("Guy") ? "en-US-GuyNeural" : "en-US-JennyNeural" })}
                      >
                        {v}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label className="text-white">Audio Feedback</Label>
                    <p className="text-xs text-white/40">Play confirmation sounds on task completion.</p>
                  </div>
                  <Switch 
                    checked={settings.audioFeedbackEnabled}
                    onCheckedChange={(v) => setSettings({ audioFeedbackEnabled: v })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="identity">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6"
          >
             <Card className="border-white/5 bg-[#0a1018]/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">Assistant Personality</CardTitle>
                <CardDescription>Choose the primary persona of the system.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { id: "jarvis", name: "Jarvis", desc: "Professional & Loyal" },
                  { id: "researcher", name: "Scholar", desc: "Detailed & Analytical" },
                  { id: "coder", name: "Architect", desc: "Concise & Technical" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSettings({ personalityId: p.id })}
                    className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                      settings.personalityId === p.id
                        ? "border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-500/20"
                        : "border-white/5 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${settings.personalityId === p.id ? "text-cyan-200" : "text-white"}`}>
                      {p.name}
                    </span>
                    <span className="text-[10px] text-white/40">{p.desc}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
