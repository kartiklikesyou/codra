import React from "react";
import { MessageSquareCode, Cpu, RefreshCw } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Describe",
    description: "Tell Codra what you want to build in plain English, specifications, or architectural prompts.",
    icon: MessageSquareCode,
  },
  {
    step: "02",
    title: "Generate",
    description: "Codra turns your intent into typed, modular code—scaffolding full-stack routes, schemas, and components.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Iterate",
    description: "Refine layouts, add endpoints, fix edge cases, and push directly to your Git repository with continuous AI context.",
    icon: RefreshCw,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 border-t border-zinc-800/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-14 space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Workflow</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
            From idea to code
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            A frictionless development loop built for speed and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-6 transition-all duration-200 hover:border-zinc-700/80 hover:bg-zinc-900/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {item.step}
                  </span>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    <Icon className="size-4" />
                  </div>
                </div>
                <h3 className="text-base font-medium text-zinc-100 mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
