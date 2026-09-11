"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  onConfirmDelete: () => Promise<void>;
}

export function DeleteProjectModal({
  isOpen,
  onClose,
  projectName,
  onConfirmDelete,
}: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirmDelete();
      onClose();
    } catch (err) {
      console.error("Error during deletion:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-sm rounded-xl border border-zinc-800 bg-[#0e0e11] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-40"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
            <AlertTriangle className="size-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-zinc-100">
              Delete project?
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-medium text-zinc-200">"{projectName}"</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {isDeleting && <Loader2 className="size-3.5 animate-spin" />}
            <span>{isDeleting ? "Deleting..." : "Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
