"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const NAV = [
  { href: "/", label: "Story", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/voice", label: "Voice", icon: Mic },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.uiState.sidebarCollapsed);
  const sidebarOpen = useAppStore((s) => s.uiState.sidebarOpen);
  const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed);
  const setUiState = useAppStore((s) => s.setUiState);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUiState({ sidebarOpen: false })}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 76 : 256,
          x: 0,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        className={cn(
          "fixed z-50 flex h-screen shrink-0 flex-col border-r border-white/[0.05] bg-[#060a0e]/95 py-6 shadow-[inset_-1px_0_0_rgba(56,189,248,0.04)] backdrop-blur-2xl md:relative md:z-20",
          !sidebarOpen && "max-md:-translate-x-full max-md:hidden"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-2 px-4",
            collapsed && "justify-center px-2"
          )}
        >
          <Sparkles className="size-7 shrink-0 text-cyan-400 drop-shadow-[0_0_14px_rgba(56,189,248,0.45)]" />
          {!collapsed && (
            <span className="font-space text-lg font-semibold tracking-tight text-white">
              ALTEREGO
            </span>
          )}

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setUiState({ sidebarOpen: false })}
            className="ml-auto flex size-7 items-center justify-center rounded-lg text-white/50 transition hover:text-white md:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          type="button"
          onClick={() => toggleSidebarCollapsed()}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-24 z-30 hidden size-7 items-center justify-center rounded-full border border-white/10 bg-[#0a1018] text-white/70 shadow-[0_0_18px_rgba(14,116,144,0.25)] transition hover:border-cyan-500/30 hover:text-cyan-300 md:flex"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>

        {/* Navigation */}
        <nav className="mt-12 flex flex-1 flex-col gap-1.5 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/" &&
                href !== "/dashboard" &&
                pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                title={label}
                onClick={() => setUiState({ sidebarOpen: false })}
              >
                <motion.span
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors duration-200",
                    collapsed && "justify-center px-2",
                    active
                      ? "bg-cyan-950/40 text-cyan-200 shadow-[0_0_24px_rgba(14,116,144,0.12),inset_0_0_0_1px_rgba(56,189,248,0.15)]"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-cyan-300"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[22px] shrink-0 transition-colors",
                      active
                        ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                        : "text-white/35 group-hover:text-cyan-400"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate font-medium tracking-wide">
                      {label}
                    </span>
                  )}
                  {active && !collapsed && (
                    <span className="ml-auto size-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                  )}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "mt-auto px-4 font-space text-[10px] text-cyan-900/50",
            collapsed && "hidden"
          )}
        >
          AlterEGO OS · neural shell
        </div>
      </motion.aside>
    </>
  );
}
