"use client";

import React, { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

interface DashboardPromptProps {
  onBuildProject: (prompt: string, model: string) => void;
}

const MODELS = [
  { id: "codra-v1", name: "Codra Agent" },
  { id: "codra-fast", name: "Codra Fast" },
];

export function DashboardPrompt({ onBuildProject }: DashboardPromptProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<(typeof MODELS)[number]>(MODELS[0]!);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isBuilding) return;

    setIsBuilding(true);
    onBuildProject(prompt.trim(), selectedModel.name);
  };

  return (
    <div className="w-full space-y-6 max-w-3xl">
      {/* Greeting Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Welcome back, Kartik
        </h1>
        <p className="text-sm text-zinc-400">
          What do you want to build?
        </p>
      </div>

      {/* Large Clean Prompt Input */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d10] p-4 shadow-sm transition-colors focus-within:border-zinc-700">
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
            className="w-full resize-none bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-600 outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
            {/* Subtle Model Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <span>{selectedModel.name}</span>
                <ChevronDown className="size-3 text-zinc-600" />
              </button>

              {modelDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-40 rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-xl z-20">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model);
                        setModelDropdownOpen(false);
                      }}
                      className={`flex w-full items-center px-2 py-1.5 text-xs rounded text-left ${
                        selectedModel.id === model.id
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Build Button [ Build → ] */}
            <button
              type="submit"
              disabled={!prompt.trim() || isBuilding}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-[0.98]"
            >
              <span>{isBuilding ? "Building..." : "Build"}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
