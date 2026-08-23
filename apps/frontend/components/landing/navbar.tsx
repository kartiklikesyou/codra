"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CodraLogo } from "@/components/auth/icons";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.location.hash) {
      window.history.pushState(null, "", "/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-[#08090c]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo (navigates & smoothly scrolls to top) */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-md transition-opacity hover:opacity-90"
            aria-label="Codra Home - Scroll to top"
          >
            <CodraLogo />
          </Link>
        </div>

        {/* Center: Minimal Anchor Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
          <a
            href="#features"
            className="transition-colors hover:text-zinc-100 focus-visible:text-zinc-100 focus:outline-none"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-zinc-100 focus-visible:text-zinc-100 focus:outline-none"
          >
            How it works
          </a>
          <a
            href="#preview"
            className="transition-colors hover:text-zinc-100 focus-visible:text-zinc-100 focus:outline-none"
          >
            Workspace
          </a>
          <a
            href="#pricing"
            className="transition-colors hover:text-zinc-100 focus-visible:text-zinc-100 focus:outline-none"
          >
            Pricing
          </a>
        </nav>

        {/* Right: Action Buttons (strictly NO redirect/auth navigation) */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            className="h-8 rounded-lg px-3.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 transition-colors"
          >
            Log in
          </button>
          <button
            type="button"
            className="h-8 rounded-lg border border-zinc-700/60 bg-zinc-100 px-3.5 text-xs font-semibold text-zinc-900 shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 transition-all active:scale-[0.98]"
          >
            Get started
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-zinc-800/80 bg-[#090a0f] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col gap-3 text-sm text-zinc-400">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-zinc-100"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-zinc-100"
            >
              How it works
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-zinc-100"
            >
              Workspace
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-zinc-100"
            >
              Pricing
            </a>
          </nav>
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              className="w-full h-9 rounded-lg px-3 text-xs font-medium text-zinc-300 hover:bg-zinc-800/60"
            >
              Log in
            </button>
            <button
              type="button"
              className="w-full h-9 rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-900 shadow-sm"
            >
              Get started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
