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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      let data: { error?: string; e?: string; id?: string; email?: string } = {};
      try {
        data = await response.json();
      } catch {
        // Fallback for non-JSON responses
      }

      if (!response.ok) {
        const errorMsg = data.error || data.e || "Could not create account. Please try again.";
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      // Automatically sign in via NextAuth credentials after successful signup
      const signInRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (signInRes?.ok && !signInRes.error) {
        router.push("/");
        router.refresh();
      } else {
        // If automatic login doesn't complete, redirect to signin
        router.push("/signin");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error: Could not reach the authentication server.");
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        subtitle="Start building with Codra."
        footerPrompt="Already have an account?"
        footerActionLabel="Sign in"
        footerActionHref="/signin"
      >
        <AuthErrorAlert message={error} />

        <form onSubmit={handleSignup} className="space-y-4" noValidate>
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
            <label
              htmlFor="password"
              className="block text-xs font-medium text-zinc-300"
            >
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
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
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create account</span>
            )}
          </button>
        </form>

        <AuthDivider text="OR" />

        <OAuthButtons disabled={isLoading} />
      </AuthCard>
    </AuthLayout>
  );
}