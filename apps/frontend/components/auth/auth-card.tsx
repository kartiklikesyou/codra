import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  subtitle: string;
  footerPrompt: string;
  footerActionLabel: string;
  footerActionHref: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  footerPrompt,
  footerActionLabel,
  footerActionHref,
  children,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all",
        className
      )}
    >
      {/* Header section */}
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
          {title}
        </h1>
        <p className="text-xs text-zinc-400 sm:text-sm font-normal">
          {subtitle}
        </p>
      </div>

      {/* Main interactive form */}
      <div className="space-y-4">{children}</div>

      {/* Footer Navigation Link */}
      <div className="mt-6 text-center text-xs text-zinc-400">
        <span>{footerPrompt} </span>
        <Link
          href={footerActionHref}
          className="font-medium text-zinc-200 underline-offset-4 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-sm transition-colors"
        >
          {footerActionLabel}
        </Link>
      </div>
    </div>
  );
}

export function AuthDivider({ text = "OR" }: { text?: string }) {
  return (
    <div className="relative my-4 flex items-center justify-center">
      <div className="w-full border-t border-zinc-800/80" />
      <span className="absolute bg-zinc-950/90 px-2.5 text-[10px] uppercase font-semibold tracking-widest text-zinc-500 font-mono">
        {text}
      </span>
    </div>
  );
}
