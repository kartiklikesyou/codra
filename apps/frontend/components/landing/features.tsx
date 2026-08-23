import React from "react";
import { ShieldCheck, GitPullRequest, Code2, Database, TerminalSquare, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Code2,
    title: "Full-Stack Generation",
    description: "Generate frontend components, Express backend endpoints, and Prisma databases in one coherent flow.",
  },
  {
    icon: ShieldCheck,
    title: "Strict Type Safety",
    description: "Every file and function is typed with TypeScript and validated with zod to eliminate runtime regressions.",
  },
  {
    icon: GitPullRequest,
    title: "Zero Vendor Lock-in",
    description: "You own 100% of your source code. Export directly to Git and run anywhere on your own infrastructure.",
  },
  {
    icon: TerminalSquare,
    title: "Live Sandboxed Previews",
    description: "Run and inspect your applications in isolated, fast environments before merging to production.",
  },
  {
    icon: Database,
    title: "Prisma & Database Ready",
    description: "Automated schema migrations, type-safe queries, and relation scaffolding out of the box.",
  },
  {
    icon: Sparkles,
    title: "Intelligent Refactoring",
    description: "Iterate on existing codebases without destroying working logic or project conventions.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-20 border-t border-zinc-800/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-14 space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Capabilities</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
            Engineered for developers
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Built from the ground up for software teams who value clean code and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-6 transition-all hover:border-zinc-700/80 hover:bg-zinc-900/30"
              >
                <div className="mb-4 inline-flex rounded-lg border border-zinc-800 bg-zinc-900/80 p-2.5 text-zinc-300 group-hover:text-white transition-colors">
                  <Icon className="size-4" />
                </div>
                <h3 className="text-sm sm:text-base font-medium text-zinc-100 mb-2 tracking-tight">
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
