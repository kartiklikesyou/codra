import React from "react";
import Link from "next/link";
import { CodraLogo } from "./icons";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#08090c] text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100 overflow-hidden font-sans">
      {/* Subtle Developer Background Ambient Depth */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-40"
      >
        <div className="h-[40rem] w-[50rem] rounded-full bg-radial from-zinc-800/20 via-zinc-900/5 to-transparent blur-3xl" />
      </div>

      {/* Subtle Grid Accent */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30"
      />

      {/* Fixed/Simple Header */}
      <header className="relative z-10 w-full px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 transition-opacity hover:opacity-90"
            aria-label="Codra Home"
          >
            <CodraLogo />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-zinc-600">
        <p>© 2026 Codra. All rights reserved.</p>
      </footer>
    </div>
  );
}
