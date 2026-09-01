"use client";

import React from "react";
import Link from "next/link";
import { Project } from "./mock-data";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/project/${project.id}`}
      className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-[#0d0d10] p-3 transition-colors hover:border-zinc-700 hover:bg-[#111115]"
    >
      {/* Simple Dark Preview Area */}
      <div className="relative mb-3.5 h-32 w-full overflow-hidden rounded-lg border border-zinc-800/60 bg-[#08080a] p-3 flex flex-col justify-between select-none">
        <div className="flex items-center justify-between border-b border-zinc-800/40 pb-1.5">
          <div className="h-1.5 w-12 bg-zinc-800 rounded" />
          <div className="flex gap-1">
            <div className="size-1.5 rounded-full bg-zinc-800" />
            <div className="size-1.5 rounded-full bg-zinc-800" />
          </div>
        </div>
        <div className="space-y-1.5 my-auto">
          <div className="h-2 w-20 bg-zinc-800/80 rounded" />
          <div className="h-1.5 w-32 bg-zinc-900 rounded" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-3 w-10 bg-zinc-900 rounded border border-zinc-800/60" />
          <div className="h-3 w-8 bg-zinc-900 rounded border border-zinc-800/60" />
        </div>
      </div>

      {/* Card Info */}
      <div className="px-1 pb-1 space-y-1">
        <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
          {project.name}
        </h3>
        <p className="text-xs text-zinc-500 font-normal">
          {project.updatedAt}
        </p>
      </div>
    </Link>
  );
}
