"use client";

import React from "react";
import Link from "next/link";
import { CodraLogo, GitHubIcon } from "@/components/auth/icons";

export function Footer() {
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.location.hash) {
      window.history.pushState(null, "", "/");
    }
  };

  return (
    <footer className="border-t border-zinc-800/60 bg-[#08090c] py-12 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-zinc-800/50">
          {/* Left: Brand */}
          <div className="space-y-2 max-w-xs">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="inline-block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-md transition-opacity hover:opacity-90"
              aria-label="Codra Home - Scroll to top"
            >
              <CodraLogo />
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed">
              The AI-native development platform designed to turn architectural intent into production-grade software.
            </p>
          </div>

          {/* Right: Minimal Navigation Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">
              How it works
            </a>
            <a href="#preview" className="hover:text-zinc-100 transition-colors">
              Workspace
            </a>
            <a href="#pricing" className="hover:text-zinc-100 transition-colors">
              Pricing
            </a>
            <a
              href="https://github.com/kartiklikesyou/codra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-zinc-100 transition-colors"
            >
              <GitHubIcon className="size-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© 2026 Codra. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-zinc-500 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-500 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-500 cursor-pointer">Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
