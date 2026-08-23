"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { GoogleIcon, GitHubIcon, SpinnerIcon } from "./icons";

interface OAuthButtonsProps {
  disabled?: boolean;
}

export function OAuthButtons({ disabled = false }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      setLoadingProvider(provider);
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      console.error(`Error during ${provider} sign-in:`, error);
      setLoadingProvider(null);
    }
  };

  const isBusy = disabled || loadingProvider !== null;

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <button
        type="button"
        onClick={() => handleOAuthSignIn("google")}
        disabled={isBusy}
        className="inline-flex h-9 w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 text-xs font-medium text-zinc-200 shadow-sm transition-all hover:bg-zinc-800/80 hover:text-white hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50"
      >
        {loadingProvider === "google" ? (
          <SpinnerIcon className="size-4 text-zinc-300" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        <span>Continue with Google</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuthSignIn("github")}
        disabled={isBusy}
        className="inline-flex h-9 w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 text-xs font-medium text-zinc-200 shadow-sm transition-all hover:bg-zinc-800/80 hover:text-white hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50"
      >
        {loadingProvider === "github" ? (
          <SpinnerIcon className="size-4 text-zinc-300" />
        ) : (
          <GitHubIcon className="size-4 text-zinc-100" />
        )}
        <span>Continue with GitHub</span>
      </button>
    </div>
  );
}
