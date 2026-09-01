"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
  initialPrompt?: string;
}

export function NewProjectModal({
  isOpen,
  onClose,
  onCreate,
  initialPrompt = "",
}: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialPrompt) {
      setDescription(initialPrompt);
      const words = initialPrompt.trim().split(" ").slice(0, 3).join(" ");
      if (words && !name) {
        setName(words.charAt(0).toUpperCase() + words.slice(1));
      }
    }
  }, [initialPrompt]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate(name.trim(), description.trim());
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-md rounded-xl border border-zinc-800 bg-[#0e0e11] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 space-y-1">
          <h2 className="text-base font-semibold text-zinc-100">
            Create Project
          </h2>
          <p className="text-xs text-zinc-400">
            Start a new software project in Codra.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="modal-proj-name" className="block text-xs text-zinc-400">
              Project Name
            </label>
            <input
              id="modal-proj-name"
              type="text"
              required
              placeholder="e.g. My Next.js App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 w-full rounded-lg border border-zinc-800 bg-[#141418] px-3 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="modal-proj-desc" className="block text-xs text-zinc-400">
              Description / Initial Prompt
            </label>
            <textarea
              id="modal-proj-desc"
              rows={3}
              placeholder="Describe what you want to build..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-lg border border-zinc-800 bg-[#141418] p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white disabled:opacity-40 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
