"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  X,
  Globe,
  Lock,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { GitHubIcon, SpinnerIcon } from "@/components/auth/icons";

export interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  projectId?: string;
  files?: Array<{ path: string; content: string }>;
  onExport?: (data: {
    repoName: string;
    isPrivate: boolean;
  }) => Promise<{ repoUrl: string; fullName?: string }>;
}

export function GitHubExportModal({
  isOpen,
  onClose,
  projectName = "my-project",
  projectId,
  files = [],
  onExport,
}: GitHubExportModalProps) {
  const { data: session } = useSession();

  const [repoName, setRepoName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    repoUrl: string;
    fullName?: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sanitize and pre-populate repository name when modal opens
  useEffect(() => {
    if (isOpen) {
      const sanitized = projectName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");

      setRepoName(sanitized || "codra-project");
      setIsPrivate(false);
      setStatus("idle");
      setErrorMessage(null);
      setSuccessData(null);

      // Focus input after modal mounts
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, projectName]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && status !== "loading") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, status, onClose]);

  if (!isOpen) return null;

  const isLoading = status === "loading";

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleRepoNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep GitHub-safe characters (letters, numbers, hyphens, underscores)
    const sanitized = e.target.value.replace(/[^a-zA-Z0-9-_]/g, "");
    setRepoName(sanitized);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !repoName.trim()) return;

    try {
      setStatus("loading");
      setErrorMessage(null);

      // 1. If parent provided a custom export handler prop:
      if (onExport) {
        const result = await onExport({
          repoName: repoName.trim(),
          isPrivate,
        });
        setSuccessData(result);
        setStatus("success");
        return;
      }

      // 2. Default integration with backend API
      if (!projectId) {
        throw new Error("Project ID is required to export.");
      }

      const response = await fetch(
        `/backend/api/projects/${projectId}/export/github`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session?.user?.id,
            repoName: repoName.trim(),
            isPrivate,
            files,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to export repository to GitHub.");
      }

      setSuccessData({
        repoUrl: data.repoUrl,
        fullName: data.fullName || `${repoName.trim()}`,
      });
      setStatus("success");
    } catch (err) {
      console.error("Export to GitHub failed:", err);
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      role="presentation"
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-800 bg-[#0e0e11] p-6 shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="github-export-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-40"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 shadow-sm">
            <GitHubIcon className="size-4" />
          </div>
          <div className="space-y-0.5">
            <h2
              id="github-export-title"
              className="text-base font-semibold text-zinc-100"
            >
              Export to GitHub
            </h2>
            <p className="text-xs text-zinc-400">
              Create a new repository and push this project codebase.
            </p>
          </div>
        </div>

        {/* SUCCESS STATE */}
        {status === "success" && successData ? (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Export Successful
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your project repository has been created. All files and configurations are ready on GitHub.
                </p>
              </div>
            </div>

            {/* Repository Info Card */}
            <div className="rounded-lg border border-zinc-800 bg-[#141418] p-3 space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                Repository
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-zinc-200 truncate">
                  {successData.fullName || successData.repoUrl}
                </span>
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 bg-zinc-800/60 border border-zinc-700/40">
                  {isPrivate ? "Private" : "Public"}
                </span>
              </div>
            </div>

            {/* Success Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/60">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Done
              </button>
              <a
                href={successData.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white transition-colors"
              >
                <GitHubIcon className="size-3.5" />
                <span>Open on GitHub</span>
                <ExternalLink className="size-3 text-zinc-600" />
              </a>
            </div>
          </div>
        ) : (
          /* FORM STATE (IDLE / LOADING / ERROR) */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-red-900/50 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-300 transition-all animate-in fade-in"
              >
                <AlertCircle className="size-4 shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Field 1: Repository Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="modal-repo-name"
                className="block text-xs text-zinc-400"
              >
                Repository Name
              </label>
              <input
                ref={inputRef}
                id="modal-repo-name"
                type="text"
                required
                disabled={isLoading}
                placeholder="e.g. my-cool-project"
                value={repoName}
                onChange={handleRepoNameChange}
                className="h-9 w-full rounded-lg border border-zinc-800 bg-[#141418] px-3 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600 disabled:opacity-50 transition-colors font-mono"
              />
              <p className="text-[11px] text-zinc-500">
                Letters, numbers, hyphens, and underscores.
              </p>
            </div>

            {/* Field 2: Visibility Selection */}
            <div className="space-y-2">
              <span className="block text-xs text-zinc-400">
                Visibility
              </span>

              <div className="space-y-2">
                {/* Option: Public */}
                <label
                  htmlFor="visibility-public"
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
                    isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                  } ${
                    !isPrivate
                      ? "border-zinc-700 bg-[#16161c] text-zinc-100 ring-1 ring-zinc-700/50"
                      : "border-zinc-800/80 bg-[#141418]/60 text-zinc-400 hover:border-zinc-700/60 hover:text-zinc-300"
                  }`}
                >
                  <input
                    id="visibility-public"
                    type="radio"
                    name="export-visibility"
                    value="public"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    disabled={isLoading}
                    className="mt-0.5 size-3.5 accent-zinc-100 text-zinc-900 border-zinc-700 focus:ring-0"
                  />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
                      <Globe className="size-3.5 text-zinc-400" />
                      <span>Public</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Anyone on the internet can view and clone this repository.
                    </p>
                  </div>
                </label>

                {/* Option: Private */}
                <label
                  htmlFor="visibility-private"
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
                    isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                  } ${
                    isPrivate
                      ? "border-zinc-700 bg-[#16161c] text-zinc-100 ring-1 ring-zinc-700/50"
                      : "border-zinc-800/80 bg-[#141418]/60 text-zinc-400 hover:border-zinc-700/60 hover:text-zinc-300"
                  }`}
                >
                  <input
                    id="visibility-private"
                    type="radio"
                    name="export-visibility"
                    value="private"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    disabled={isLoading}
                    className="mt-0.5 size-3.5 accent-zinc-100 text-zinc-900 border-zinc-700 focus:ring-0"
                  />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
                      <Lock className="size-3.5 text-zinc-400" />
                      <span>Private</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Only you can view and commit to this repository.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/60">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading || !repoName.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white disabled:opacity-40 transition-colors min-w-[130px]"
              >
                {isLoading ? (
                  <>
                    <SpinnerIcon className="size-3.5 text-zinc-900" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <GitHubIcon className="size-3.5" />
                    <span>{status === "error" ? "Try Again" : "Export to GitHub"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
