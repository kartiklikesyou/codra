"use client";

import React from "react";
import { Project } from "./mock-data";
import { ProjectCard } from "./project-card";
import { Plus } from "lucide-react";

interface ProjectsGridProps {
  projects: Project[];
  onOpenNewProjectModal: () => void;
}

export function ProjectsGrid({
  projects,
  onOpenNewProjectModal,
}: ProjectsGridProps) {
  return (
    <section className="space-y-4 pt-2">
      {/* Section Heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">
          Your Projects
        </h2>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {/* Minimal "+ New Project" Card */}
        <button
          type="button"
          onClick={onOpenNewProjectModal}
          className="group flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800/80 bg-transparent p-6 text-center transition-colors hover:border-zinc-700 hover:bg-[#0d0d10]"
        >
          <div className="mb-2 flex size-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 group-hover:text-zinc-200 transition-colors">
            <Plus className="size-4" />
          </div>
          <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
            New Project
          </span>
        </button>
      </div>
    </section>
  );
}
