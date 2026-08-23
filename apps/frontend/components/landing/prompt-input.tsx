"use client";

import React, { useState } from "react";
import { ArrowUp, Paperclip, Mic, Sparkles, Code2, Layers, Zap } from "lucide-react";

const SUGGESTIONS = [
  { icon: Layers, label: "Full-stack SaaS with NextAuth & Stripe" },
  { icon: Code2, label: "Realtime collaboration canvas & whiteboard" },
  { icon: Zap, label: "REST API with rate-limiting & Prisma ORM" },
];

export function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const [isSubmittedLocally, setIsSubmittedLocally] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmittedLocally) return;

    // Purely local visual simulation (strictly no network, no API, no redirect)
    setIsSubmittedLocally(true);
    setTimeout(() => {
      setIsSubmittedLocally(false);
    }, 1800);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <div className="relative rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-3 shadow-2xl backdrop-blur-2xl transition-all focus-within:border-zinc-700/90 focus-within:ring-1 focus-within:ring-zinc-700/50">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe what you want to build..."
            rows={3}
            className="w-full resize-none bg-transparent px-2 pt-1 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40">
            {/* Left Tools */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="inline-flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 focus:outline-none transition-colors"
                title="Attach file or reference"
                aria-label="Attach file"
              >
                <Paperclip className="size-3.5" />
              </button>

              <button
                type="button"
                className="inline-flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 focus:outline-none transition-colors"
                title="Voice input"
                aria-label="Voice input"
              >
                <Mic className="size-3.5" />
              </button>

              <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900/80 text-[11px] font-mono text-zinc-400">
                <Sparkles className="size-3 text-zinc-300" />
                <span>codra-agent-v1</span>
              </div>
            </div>

            {/* Right Build/Submit Action */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!prompt.trim()}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                  prompt.trim()
                    ? "bg-zinc-100 text-zinc-950 hover:bg-white active:scale-95"
                    : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800/60"
                }`}
              >
                <span>{isSubmittedLocally ? "Synthesizing..." : "Build with Codra"}</span>
                <ArrowUp className="size-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preset Suggestion Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <span className="text-[11px] text-zinc-500 font-mono">Try:</span>
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setPrompt(item.label)}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800/80 bg-zinc-900/40 px-2.5 py-1 text-[11px] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
            >
              <Icon className="size-3 text-zinc-500" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
