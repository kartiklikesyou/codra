"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";

interface ProjectMenuButtonProps {
  projectId: string;
  projectName: string;
  onDeleteClick: (id: string, name: string) => void;
}

export function ProjectMenuButton({
  projectId,
  projectName,
  onDeleteClick,
}: ProjectMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={menuRef}
      className="relative shrink-0"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex size-6 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800/70 hover:text-zinc-200 transition-colors"
        aria-label="Project options"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-[130px] rounded-lg border border-zinc-800 bg-[#121216] p-1 shadow-xl animate-in fade-in zoom-in-95">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onDeleteClick(projectId, projectName);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <Trash2 className="size-3.5" />
            <span>Delete project</span>
          </button>
        </div>
      )}
    </div>
  );
}
