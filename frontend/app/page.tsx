import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import AssistantOrb from "@/components/assistant/AssistantOrb";
import Sidebar from "@/components/chat/Sidebar";

export default function Home() {
  return (
    <main className="h-screen bg-black text-white flex overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
          <AssistantOrb />
          <div className="w-full max-w-4xl flex-1 min-h-0 bg-[#050505] rounded-3xl border border-white/5 shadow-2xl overflow-hidden mb-4 relative">
             {/* Scanning Line Effect */}
             <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-[scan_4s_linear_infinity] z-20 pointer-events-none" />
             <ChatWindow />
          </div>
        </div>

        <ChatInput />
      </div>
    </main>
  );
}
