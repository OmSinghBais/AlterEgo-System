"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] px-6 py-16 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-orbitron text-lg font-semibold tracking-tight text-white">
            AlterEGO
          </p>
          <p className="mt-2 max-w-sm text-sm text-white/35">
            Cinematic intelligence — 3D neural field, glass layers, realtime
            voice interface.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm text-white/45">
          <Link
            className="transition hover:text-cyan-400"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link className="transition hover:text-cyan-400" href="/">
            Home
          </Link>
          <span className="text-white/20">Docs soon</span>
          <span className="text-white/20">API soon</span>
        </div>
      </div>
      <p className="mx-auto mt-14 max-w-6xl text-xs text-white/20">
        © {new Date().getFullYear()} AlterEGO. Built for motion-first
        interfaces.
      </p>
    </footer>
  );
}
