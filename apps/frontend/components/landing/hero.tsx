import React from "react";
import { PromptInput } from "./prompt-input";
import { Terminal } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
      {/* Subtle Atmospheric Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 transform-gpu overflow-hidden blur-3xl opacity-30"
      >
        <div
          className="aspect-1155/678 w-68rem bg-linear-to-tr from-indigo-900/30 via-zinc-800/20 to-sky-900/20"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300 shadow-inner backdrop-blur-md">
          <Terminal className="size-3.5 text-zinc-400" />
          <span className="font-mono text-[11px] text-zinc-400">AI-powered development platform</span>
          <span className="inline-block size-1 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Main Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-100 sm:text-6xl md:text-7xl">
            Build software <br className="hidden sm:inline" />
            <span className="bg-linear-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              with intelligence.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
            Turn specifications into production-ready full-stack applications.
            Describe what you need, and Codra crafts the architecture, code, and tests.
          </p>
        </div>

        {/* Centered Prompt Input */}
        <div className="pt-2">
          <PromptInput />
        </div>
      </div>
    </section>
  );
}
