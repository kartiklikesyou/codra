import React from "react";
import { AlertCircle } from "lucide-react";

interface AuthErrorAlertProps {
  message?: string | null;
}

export function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-900/50 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-300 transition-all animate-in fade-in slide-in-from-top-1"
    >
      <AlertCircle className="size-4 shrink-0 text-red-400 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
