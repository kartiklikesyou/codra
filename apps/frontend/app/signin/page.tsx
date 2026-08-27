"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard, AuthDivider } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { SpinnerIcon } from "@/components/auth/icons";

export default function SigninPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter(); 

    async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isLoading) return;

        if (!email.trim() || !password) {
        setError("Please enter both email and password.");
        return;
        }

        try {
        setIsLoading(true);
        setError(null);

        const res = await signIn("credentials", {
            email: email.trim(),
            password,
            redirect: false,
        });

        if (!res || res.error || !res.ok) {
            setError("Invalid email or password. Please try again.");
            setIsLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
        } catch (err) {
        console.error("Sign in error:", err);
        setError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
        }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to continue to Codra."
        footerPrompt="Don't have an account?"
        footerActionLabel="Create one"
        footerActionHref="/signup"
      >
        <AuthErrorAlert message={error} />

        <form onSubmit={handleSignin} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-zinc-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
              required
              className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-sm transition-colors outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-zinc-300"
              >
                Password
              </label>
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 text-xs font-semibold text-zinc-900 shadow transition-all hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="size-4 text-zinc-900" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        <AuthDivider text="OR" />

        <OAuthButtons disabled={isLoading} />
      </AuthCard>
    </AuthLayout>
  );
}
