"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface PreviewLoadingProps {
  activityMessage?: string;
}

export function PreviewLoading({ activityMessage }: PreviewLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#09090b] px-4 text-center select-none"
    >
      <style>{`
        @keyframes codra-indeterminate {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(50%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>

      {/* Subtle radial ambient gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(59,130,246,0.06),transparent)]"
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm">
        {/* Codra Mark with subtle ambient glow */}
        <div className="relative mb-5">
          <div
            aria-hidden="true"
            className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-lg opacity-70 animate-pulse"
          />
          <div className="relative flex size-14 items-center justify-center rounded-2xl border border-zinc-800/90 bg-zinc-900/90 shadow-xl backdrop-blur-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6 text-zinc-100"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
        </div>

        {/* Title & Subheading */}
        <h3 className="text-base font-medium tracking-tight text-zinc-100">
          Building your website
        </h3>
        <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed max-w-[280px]">
          Codra is turning your idea into a working experience.
        </p>

        {/* Indeterminate progress shimmer bar */}
        <div
          aria-hidden="true"
          className="relative mt-5 h-1 w-44 overflow-hidden rounded-full bg-zinc-800/80"
        >
          <div
            style={{
              animation: "codra-indeterminate 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500"
          />
        </div>

        {/* Live SSE step pill */}
        <div className="mt-4 flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/60 px-3 py-1 text-[11px] text-zinc-400 shadow-sm">
          <Loader2 className="size-3 shrink-0 animate-spin text-blue-400" />
          <span className="font-mono text-zinc-300 truncate max-w-[220px]">
            {activityMessage || "Understanding your request..."}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PreviewLoading;
